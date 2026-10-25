from fastapi import FastAPI, HTTPException, Body, Header, Depends
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

# Disable /docs and /openapi.json in production
env_val = os.getenv("ENVIRONMENT") or os.getenv("ENV") or ("production" if os.getenv("RENDER") else "development")
is_production = env_val.strip().lower() in ("production", "prod")

app = FastAPI(
    title="SGCS AI Service",
    lifespan=lifespan,
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json"
)

# Shared-secret authentication dependency
def verify_internal_key(x_internal_key: Optional[str] = Header(None, alias="X-Internal-Key")):
    expected_key = os.getenv("AI_INTERNAL_KEY", "").strip()
    if not expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized: AI_INTERNAL_KEY is not configured on the server")
    if not x_internal_key or x_internal_key.strip() != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing X-Internal-Key header")

class PredictRequest(BaseModel):
    complaint_text: Optional[str] = None
    description: Optional[str] = None
    text: Optional[str] = None

    @model_validator(mode='after')
    def validate_text(self):
        content = self.complaint_text or self.description or self.text
        if not content or not str(content).strip():
            raise ValueError('Complaint text/description cannot be empty')
        text_val = str(content).strip()
        if len(text_val) > 2000:
            raise HTTPException(status_code=413, detail="Complaint text exceeds maximum limit of 2000 characters")
        self.complaint_text = text_val
        return self

class DuplicateCheckInput(BaseModel):
    new_complaint: str
    new_title: Optional[str] = ""
    new_description: Optional[str] = ""
    new_ward: Optional[str] = ""
    new_location: Optional[str] = ""
    new_latitude: Optional[float] = None
    new_longitude: Optional[float] = None
    new_category: Optional[str] = ""
    new_created_at: Optional[str] = ""
    existing_complaints: List[Dict[str, Any]]

    @model_validator(mode='after')
    def validate_limits(self):
        if self.new_complaint and len(str(self.new_complaint)) > 2000:
            raise HTTPException(status_code=413, detail="New complaint text exceeds maximum limit of 2000 characters")
        if self.existing_complaints is not None:
            if len(self.existing_complaints) > 500:
                raise HTTPException(status_code=413, detail="existing_complaints cannot exceed 500 items")
            for idx, item in enumerate(self.existing_complaints):
                t = str(item.get("text", "") or "")
                if len(t) > 2000:
                    raise HTTPException(status_code=413, detail=f"Complaint at index {idx} exceeds maximum text limit of 2000 characters")
        return self

@app.get("/health")
def health_check():
    return {
        "status": "UP"
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

@app.post("/predict", dependencies=[Depends(verify_internal_key)])
def predict_endpoint(request: PredictRequest):
    if len(request.complaint_text) > 2000:
        raise HTTPException(status_code=413, detail="Complaint text exceeds maximum limit of 2000 characters")
    return handle_prediction(request.complaint_text)

@app.post("/ai/classify-complaint", dependencies=[Depends(verify_internal_key)])
def classify_endpoint(request: PredictRequest):
    if len(request.complaint_text) > 2000:
        raise HTTPException(status_code=413, detail="Complaint text exceeds maximum limit of 2000 characters")
    return handle_prediction(request.complaint_text)

@app.post("/classify", dependencies=[Depends(verify_internal_key)])
def classify_alt_endpoint(request: PredictRequest):
    if len(request.complaint_text) > 2000:
        raise HTTPException(status_code=413, detail="Complaint text exceeds maximum limit of 2000 characters")
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

def are_wards_compatible(w1: Optional[str], w2: Optional[str]) -> bool:
    if not w1 or not w2:
        return True
    s1, s2 = str(w1).lower().strip(), str(w2).lower().strip()
    if s1 == s2 or s1 in s2 or s2 in s1:
        return True
    d1 = re.search(r'\d+', s1)
    d2 = re.search(r'\d+', s2)
    if d1 and d2:
        return d1.group(0) == d2.group(0)
    return False

def calc_string_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()

@app.get("/")
def root_check():
    return {
        "status": "UP",
        "service": "SGCS AI Classification & Duplicate Detection Service",
        "model_loaded": ai_system["clf"] is not None
    }

@app.post("/duplicate-check", dependencies=[Depends(verify_internal_key)])
@app.post("/ai/duplicate-check", dependencies=[Depends(verify_internal_key)])
def duplicate_check(data: DuplicateCheckInput):
    new_complaint_full = str(data.new_complaint or "").strip()
    new_title = str(data.new_title or "").strip()
    new_desc = str(data.new_description or "").strip()
    if not new_title and new_complaint_full:
        parts = new_complaint_full.split('.', 1)
        new_title = parts[0].strip()
        new_desc = parts[1].strip() if len(parts) > 1 else new_title
    if not new_desc:
        new_desc = new_complaint_full

    new_loc = str(data.new_location or "").strip()
    new_cat = str(data.new_category or "").strip().upper()
    existing = data.existing_complaints

    if len(new_complaint_full) > 2000:
        raise HTTPException(status_code=413, detail="New complaint text exceeds maximum limit of 2000 characters")
    if len(existing) > 500:
        raise HTTPException(status_code=413, detail="existing_complaints exceeds maximum limit of 500 items")
    for idx, item in enumerate(existing):
        t = str(item.get("text", "") or "")
        if len(t) > 2000:
            raise HTTPException(status_code=413, detail=f"Complaint at index {idx} exceeds maximum text limit of 2000 characters")

    if not new_complaint_full or not existing:
        return {"possible_duplicate_id": None, "similarity": 0.0}

    new_title_tokens = extract_tokens(new_title)
    new_desc_tokens = extract_tokens(new_desc)
    new_loc_tokens = extract_tokens(new_loc)
    new_digits = set(re.findall(r'\b\d+\b', new_loc))

    best_match = None
    highest_score = 0.0

    vectorizer = ai_system.get("vectorizer")

    for c in existing:
        c_ward = str(c.get('ward', '') or '').strip()
        wards_match = are_wards_compatible(data.new_ward, c_ward)

        # 1. Location Matching (Mandatory prerequisite: locations must match)
        c_loc = str(c.get('location', '') or "").strip()
        c_loc_tokens = extract_tokens(c_loc)
        c_digits = set(re.findall(r'\b\d+\b', c_loc))
        
        c_lat = c.get('latitude')
        c_lon = c.get('longitude')
        has_gps = (data.new_latitude is not None and data.new_longitude is not None and 
                   c_lat is not None and c_lon is not None)

        is_loc_match = False
        loc_score = 0.0

        if has_gps:
            try:
                import math
                lat1, lon1 = float(data.new_latitude), float(data.new_longitude)
                lat2, lon2 = float(c_lat), float(c_lon)
                dlat = math.radians(lat2 - lat1)
                dlon = math.radians(lon2 - lon1)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
                dist_m = 6371000 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                if dist_m <= 75:
                    loc_score = 1.0
                    is_loc_match = True
                elif dist_m <= 150:
                    loc_score = 0.85
                    is_loc_match = True
                elif dist_m <= 250 and wards_match:
                    loc_score = 0.65
                    is_loc_match = True
                else:
                    loc_score = 0.0
                    is_loc_match = False
            except Exception:
                has_gps = False

        if not has_gps:
            if not wards_match and data.new_ward and c_ward:
                continue

            if new_digits and c_digits and not (new_digits & c_digits):
                is_loc_match = False
                loc_score = 0.0
            else:
                if new_loc and c_loc:
                    s1 = normalize_text(new_loc)
                    s2 = normalize_text(c_loc)
                    if s1 == s2 or s1 in s2 or s2 in s1:
                        loc_score = 0.90
                    else:
                        loc_inter = new_loc_tokens & c_loc_tokens
                        loc_union = new_loc_tokens | c_loc_tokens
                        loc_jaccard = len(loc_inter) / len(loc_union) if loc_union else 0.0
                        loc_overlap = len(loc_inter) / min(len(new_loc_tokens), len(c_loc_tokens)) if min(len(new_loc_tokens), len(c_loc_tokens)) > 0 else 0.0
                        loc_seq = calc_string_similarity(s1, s2)
                        loc_score = max(loc_jaccard, loc_overlap * 0.85, loc_seq)
                    if loc_score >= 0.40:
                        is_loc_match = True

        # IF LOCATION DOES NOT MATCH, CANNOT BE A DUPLICATE!
        if not is_loc_match:
            continue

        # 2. Title Matching
        c_title = str(c.get('title', '') or "").strip()
        c_title_tokens = extract_tokens(c_title)
        title_score = 0.0
        if new_title and c_title:
            if normalize_text(new_title) == normalize_text(c_title):
                title_score = 1.0
            else:
                t_inter = new_title_tokens & c_title_tokens
                t_union = new_title_tokens | c_title_tokens
                t_jacc = len(t_inter) / len(t_union) if t_union else 0.0
                t_over = len(t_inter) / min(len(new_title_tokens), len(c_title_tokens)) if min(len(new_title_tokens), len(c_title_tokens)) > 0 else 0.0
                t_seq = calc_string_similarity(normalize_text(new_title), normalize_text(c_title))
                title_score = max(t_jacc, t_over, t_seq)
        elif new_title_tokens:
            c_text_all = str(c.get('text', '') or "")
            c_all_tokens = extract_tokens(c_text_all)
            t_inter = new_title_tokens & c_all_tokens
            title_score = len(t_inter) / len(new_title_tokens) if new_title_tokens else 0.0
        else:
            title_score = 0.50

        if title_score < 0.35:
            continue

        # 3. Description Matching
        c_desc = str(c.get('description', '') or c.get('text', '') or "").strip()
        c_desc_tokens = extract_tokens(c_desc)
        if not new_desc_tokens or not c_desc_tokens:
            continue

        d_inter = new_desc_tokens & c_desc_tokens
        d_union = new_desc_tokens | c_desc_tokens
        d_jacc = len(d_inter) / len(d_union) if d_union else 0.0
        d_over = len(d_inter) / min(len(new_desc_tokens), len(c_desc_tokens)) if min(len(new_desc_tokens), len(c_desc_tokens)) > 0 else 0.0

        cos_sim = 0.0
        if vectorizer is not None:
            try:
                m1 = vectorizer.transform([new_desc])
                m2 = vectorizer.transform([c_desc])
                cos_sim = float(cosine_similarity(m1, m2)[0][0])
            except Exception:
                cos_sim = 0.0

        desc_score = 0.45 * cos_sim + 0.30 * d_jacc + 0.25 * d_over
        if desc_score < 0.35:
            continue

        # 4. Category & Status modifiers
        c_cat = str(c.get('category', '') or "").strip().upper()
        cat_match = 0.0
        if new_cat and c_cat and new_cat != 'OTHER' and c_cat != 'OTHER':
            if new_cat == c_cat:
                cat_match = 0.10
            elif (new_cat in ['ROAD', 'DRAINAGE'] and c_cat in ['ROAD', 'DRAINAGE']) or \
                 (new_cat in ['WASTE_MANAGEMENT', 'PUBLIC_SPACE'] and c_cat in ['WASTE_MANAGEMENT', 'PUBLIC_SPACE']):
                cat_match = 0.03
            else:
                cat_match = -0.15

        c_status = str(c.get('status', '') or "").strip().upper()
        status_boost = 0.05 if c_status in ['OPEN', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_APPROVAL'] else 0.0

        # Combined 3-way score (Title, Description, and Location all matched)
        score = (
            0.35 * loc_score +
            0.35 * desc_score +
            0.20 * title_score +
            cat_match +
            status_boost
        )
        score = max(0.0, min(0.99, score))

        if score > highest_score:
            highest_score = score
            best_match = c

    # Threshold for duplicate: 0.48
    if highest_score >= 0.48 and best_match:
        return {
            "possible_duplicate_id": best_match.get('id'),
            "similarity": round(highest_score, 2)
        }

    return {"possible_duplicate_id": None, "similarity": 0.0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
