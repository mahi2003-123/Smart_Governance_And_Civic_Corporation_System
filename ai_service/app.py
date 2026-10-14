from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, model_validator
import logging
from typing import Optional, List, Dict, Any, Set
from contextlib import asynccontextmanager
import re
from difflib import SequenceMatcher
from sklearn.metrics.pairwise import cosine_similarity

import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from predict import load_system, predict as run_prediction
except ImportError:
    from ai_service.predict import load_system, predict as run_prediction

logging.basicConfig(level=logging.INFO)

# Global model state
ai_system: Dict[str, Any] = {
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
        logging.info(f"Loaded complaint classification pipeline: {metadata.get('model_name')}")
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
    complaint_text: Optional[str] = None
    description: Optional[str] = None
    text: Optional[str] = None

    @model_validator(mode='after')
    def validate_text(self):
        content = self.complaint_text or self.description or self.text
        if not content or not str(content).strip():
            raise ValueError('Complaint text/description cannot be empty')
        self.complaint_text = str(content).strip()
        return self

class DuplicateCheckInput(BaseModel):
    new_complaint: str
    new_ward: Optional[str] = ""
    new_location: Optional[str] = ""
    new_category: Optional[str] = ""
    new_created_at: Optional[str] = ""
    existing_complaints: List[Dict[str, Any]]

@app.get("/health")
def health_check():
    model_loaded = ai_system["clf"] is not None
    return {
        "status": "UP",
        "model_loaded": model_loaded
    }

def handle_prediction(text: str):
    if not ai_system["clf"]:
        raise HTTPException(status_code=503, detail="Model is not loaded or unavailable")
    try:
        result = run_prediction(
            text,
            ai_system["clf"],
            ai_system["vectorizer"],
            ai_system["embedder"],
            ai_system["metadata"]
        )
        return result
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during AI prediction")

@app.post("/predict")
def predict_endpoint(request: PredictRequest):
    return handle_prediction(request.complaint_text)

@app.post("/ai/classify-complaint")
def classify_endpoint(request: PredictRequest):
    return handle_prediction(request.complaint_text)

@app.post("/classify")
def classify_alt_endpoint(request: PredictRequest):
    return handle_prediction(request.complaint_text)

# ----------------- Robust Duplicate Detection -----------------

STOP_WORDS = {
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'near',
    'to', 'for', 'of', 'from', 'by', 'with', 'it', 'this', 'that', 'there',
    'very', 'please', 'has', 'have', 'been', 'my', 'our', 'are', 'was', 'were'
}

def normalize_text(text: Optional[str]) -> str:
    if not text:
        return ""
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return ' '.join(text.split())

def extract_tokens(text: Optional[str]) -> Set[str]:
    if not text:
        return set()
    cleaned = normalize_text(text)
    return {w for w in cleaned.split() if w not in STOP_WORDS and len(w) > 1}

def extract_ward_number(ward_str: Optional[str]) -> Optional[str]:
    if not ward_str:
        return None
    m = re.search(r'\b(?:ward\s*)?(\d+)\b', str(ward_str).lower())
    if m:
        return m.group(1)
    norm = normalize_text(ward_str)
    return norm if norm else None

def calc_string_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()

@app.post("/ai/duplicate-check")
def duplicate_check(data: DuplicateCheckInput):
    new_text = str(data.new_complaint or "").strip()
    new_ward_id = extract_ward_number(data.new_ward)
    new_loc = str(data.new_location or "").strip()
    new_cat = str(data.new_category or "").strip().upper()
    existing = data.existing_complaints

    if not new_text or not existing:
        return {"possible_duplicate_id": None, "similarity": 0.0}

    new_tokens = extract_tokens(new_text)
    new_loc_tokens = extract_tokens(new_loc)

    best_match = None
    highest_score = 0.0

    vectorizer = ai_system.get("vectorizer")

    for c in existing:
        c_ward_id = extract_ward_number(c.get('ward', ''))
        # If both explicitly specify different ward numbers, they are in different jurisdictions
        if new_ward_id and c_ward_id and new_ward_id != c_ward_id:
            continue

        c_text = str(c.get('text', '') or "").strip()
        c_tokens = extract_tokens(c_text)
        if not new_tokens or not c_tokens:
            continue

        # 1. Text & Semantic Overlap
        union = new_tokens | c_tokens
        inter = new_tokens & c_tokens
        jaccard = len(inter) / len(union) if union else 0.0
        overlap = len(inter) / min(len(new_tokens), len(c_tokens)) if min(len(new_tokens), len(c_tokens)) > 0 else 0.0

        cos_sim = 0.0
        if vectorizer is not None:
            try:
                m1 = vectorizer.transform([new_text])
                m2 = vectorizer.transform([c_text])
                cos_sim = float(cosine_similarity(m1, m2)[0][0])
            except Exception:
                cos_sim = 0.0

        # Blended text score
        text_score = 0.45 * cos_sim + 0.30 * jaccard + 0.25 * overlap

        # 2. Location Similarity
        c_loc = str(c.get('location', '') or "").strip()
        c_loc_tokens = extract_tokens(c_loc)
        has_location = bool(new_loc_tokens and c_loc_tokens)
        loc_score = 0.0

        if has_location:
            loc_inter = new_loc_tokens & c_loc_tokens
            loc_union = new_loc_tokens | c_loc_tokens
            loc_jaccard = len(loc_inter) / len(loc_union) if loc_union else 0.0
            loc_overlap = len(loc_inter) / min(len(new_loc_tokens), len(c_loc_tokens)) if min(len(new_loc_tokens), len(c_loc_tokens)) > 0 else 0.0
            loc_seq = calc_string_similarity(normalize_text(new_loc), normalize_text(c_loc))
            loc_score = max(loc_jaccard, loc_overlap * 0.9, loc_seq)

        # 3. Category Match
        c_cat = str(c.get('category', '') or "").strip().upper()
        cat_match = 0.0
        if new_cat and c_cat and new_cat != 'OTHER' and c_cat != 'OTHER':
            cat_match = 1.0 if new_cat == c_cat else -0.3

        # 4. Status Boost (active issues are much more likely duplicate targets)
        c_status = str(c.get('status', '') or "").strip().upper()
        status_boost = 0.10 if c_status in ['OPEN', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_APPROVAL'] else 0.0

        # Weighted combination
        if has_location:
            score = (
                0.50 * text_score +
                0.30 * loc_score +
                0.10 * max(0.0, cat_match) +
                status_boost
            )
        else:
            score = (
                0.75 * text_score +
                0.15 * max(0.0, cat_match) +
                status_boost
            )

        # Strong text match override: if descriptions strongly describe the same problem
        if text_score >= 0.70:
            score = max(score, text_score)

        if score > highest_score:
            highest_score = score
            best_match = c

    # Threshold for flagging possible duplicate
    if highest_score >= 0.55 and best_match:
        return {
            "possible_duplicate_id": best_match.get('id'),
            "similarity": round(min(highest_score, 0.99), 4)
        }

    return {"possible_duplicate_id": None, "similarity": 0.0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
