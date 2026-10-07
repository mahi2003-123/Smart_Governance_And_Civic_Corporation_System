from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import logging
from typing import Optional
from contextlib import asynccontextmanager

# Import from the standalone predict script
from predict import load_system, predict as run_prediction

# Duplicate check dependencies
import re
from difflib import SequenceMatcher
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(level=logging.INFO)

# Global model state
ai_system = {
    "clf": None,
    "vectorizer": None,
    "embedder": None,
    "metadata": None
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    try:
        clf, vectorizer, embedder, metadata = load_system()
        ai_system["clf"] = clf
        ai_system["vectorizer"] = vectorizer
        ai_system["embedder"] = embedder
        ai_system["metadata"] = metadata
        logging.info(f"Loaded complaint classification pipeline: {metadata['model_name']}")
    except Exception as e:
        logging.error(f"Failed to load model: {e}")
    yield
    # Cleanup on shutdown
    ai_system.clear()

app = FastAPI(title="SGCS AI Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    complaint_text: str
    
    @field_validator('complaint_text')
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError('complaint_text cannot be empty')
        return trimmed

class DuplicateCheckInput(BaseModel):
    new_complaint: str
    new_ward: Optional[str] = ""
    new_location: Optional[str] = ""
    new_category: Optional[str] = ""
    new_created_at: Optional[str] = ""
    existing_complaints: list[dict]


@app.get("/health")
def health_check():
    model_loaded = ai_system["clf"] is not None
    return {
        "status": "UP",
        "model_loaded": model_loaded
    }

@app.post("/predict")
def predict_endpoint(request: PredictRequest):
    if not ai_system["clf"]:
        raise HTTPException(status_code=503, detail="Model is not loaded or unavailable")
        
    try:
        result = run_prediction(
            request.complaint_text,
            ai_system["clf"],
            ai_system["vectorizer"],
            ai_system["embedder"],
            ai_system["metadata"]
        )
        return result
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during AI prediction")

# ----------------- Duplicate Check (Kept exactly as it was) -----------------
def normalize_text(text: str) -> str:
    if not text: return ""
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return ' '.join(text.split())

def calc_string_similarity(a: str, b: str) -> float:
    if not a or not b: return 0.0
    return SequenceMatcher(None, a, b).ratio()

@app.post("/ai/duplicate-check")
def duplicate_check(data: DuplicateCheckInput):
    new_text = data.new_complaint.strip()
    new_ward = normalize_text(data.new_ward)
    new_loc = normalize_text(data.new_location)
    new_cat = str(data.new_category).strip().upper()
    existing = data.existing_complaints
    
    if not new_text or not existing:
        return {"possible_duplicate_id": None, "similarity": 0.0}
        
    filtered_by_ward = []
    for c in existing:
        c_ward = normalize_text(c.get('ward', ''))
        if new_ward and c_ward and new_ward != c_ward:
            continue
        filtered_by_ward.append(c)
        
    if not filtered_by_ward:
        return {"possible_duplicate_id": None, "similarity": 0.0}
    
    best_match = None
    highest_score = 0.0
    
    texts = [new_text]
    for c in filtered_by_ward:
        texts.append(c.get('text', '') or '')
        
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
    except ValueError:
        cosine_sim = [0.0] * len(filtered_by_ward)
        
    for i, c in enumerate(filtered_by_ward):
        c_loc = normalize_text(c.get('location', ''))
        c_cat = str(c.get('category', '')).strip().upper()
        c_status = str(c.get('status', '')).strip().upper()
        
        # Location is the SECOND and MOST IMPORTANT comparison
        if not new_loc or not c_loc:
            # Cannot confidently establish proximity without location
            continue
            
        loc_sim = calc_string_similarity(new_loc, c_loc)
        if loc_sim < 0.40:
            continue
            
        score = 0.0
        
        # Location Match (Max 0.45)
        score += loc_sim * 0.45
        
        # Category Match (Max 0.15)
        if c_cat and new_cat and c_cat == new_cat:
            score += 0.15
            
        # Semantic Description Match (Max 0.30)
        desc_sim = float(cosine_sim[i])
        score += desc_sim * 0.30
        
        # Status Proximity (Max 0.10)
        if c_status == 'RESOLVED':
            continue
            
        if c_status in ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING']:
            score += 0.10
            
        if score > highest_score:
            highest_score = score
            best_match = c
            
    if highest_score > 0.65 and best_match:
        return {
            "possible_duplicate_id": best_match['id'],
            "similarity": min(highest_score, 0.99)
        }
    
    return {"possible_duplicate_id": None, "similarity": 0.0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
