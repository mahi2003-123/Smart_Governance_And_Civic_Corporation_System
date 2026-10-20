import os
import sys
import json
import joblib
import numpy as np
import re
import warnings

warnings.filterwarnings('ignore')

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Canonical Municipal Categories
CATEGORIES = [
    "ROAD",
    "WATER_SUPPLY",
    "WASTE_MANAGEMENT",
    "DRAINAGE",
    "STREET_LIGHT",
    "PUBLIC_SPACE"
]

# Common typos and normalization dictionary
TYPO_CORRECTIONS = {
    r'\bpothle\b': 'pothole',
    r'\bpothls\b': 'potholes',
    r'\bpot hole\b': 'pothole',
    r'\bpot holes\b': 'potholes',
    r'\bstreelight\b': 'streetlight',
    r'\bstreatlight\b': 'streetlight',
    r'\bstreat light\b': 'street light',
    r'\bdrinage\b': 'drainage',
    r'\bdrange\b': 'drainage',
    r'\bsewge\b': 'sewage',
    r'\bsewerage\b': 'sewage',
    r'\bgarbag\b': 'garbage',
    r'\bgardage\b': 'garbage',
    r'\bwatr\b': 'water',
    r'\bpipline\b': 'pipeline',
    r'\bleek\b': 'leak',
    r'\bleekage\b': 'leakage',
    r'\bmanhol\b': 'manhole',
    r'\bguter\b': 'gutter'
}

# High-precision domain keywords and n-grams
CIVIC_KEYWORD_RULES = {
    "ROAD": [
        "pothole", "potholes", "crater", "craters", "asphalt", "bitumen",
        "road broken", "damaged road", "broken road", "tar road", "speed breaker",
        "speed bump", "road divider", "road cave", "road collapse", "pavement damaged",
        "footpath broken", "missing paver", "paver blocks", "pedestrian pathway",
        "gravel on road", "road dug", "excavation on road", "culvert bridge",
        "zebra crossing", "bumpy road", "uneven road", "road resurfacing"
    ],
    "WATER_SUPPLY": [
        "drinking water", "water supply", "tap water", "pipeline leak", "pipe burst",
        "burst pipe", "low water pressure", "muddy water", "dirty drinking water",
        "contaminated water", "no water in tap", "no water supply", "water meter",
        "water valve", "water tanker", "borewell", "municipal tap", "water shortage",
        "leakage from pipe", "water pipe broken"
    ],
    "WASTE_MANAGEMENT": [
        "garbage", "trash", "waste dumped", "dumping yard", "dustbin overflowing",
        "garbage bin", "garbage truck", "litter", "plastic waste", "dead animal",
        "rotting waste", "foul smell from garbage", "sanitation worker", "debris dumped",
        "construction rubble", "solid waste", "bio waste", "uncleaned trash",
        "dumping ground", "street sweeping"
    ],
    "DRAINAGE": [
        "drainage", "drain", "drains", "sewer", "sewage", "gutter", "gutters",
        "manhole", "waterlogging", "water logging", "stagnant rain water",
        "blocked drain", "clogged drain", "drain overflow", "sewage overflow",
        "gutter overflow", "manhole cover missing", "open drain", "storm water drain",
        "nullah", "rain water stagnation", "septic tank overflow", "choked drain"
    ],
    "STREET_LIGHT": [
        "street light", "streetlight", "streetlights", "street lights", "lamp post",
        "pole light", "dark street", "pitch dark", "bulb fused", "light not working",
        "flickering light", "wire hanging from pole", "electric pole leaning",
        "led street light", "high mast", "no lighting", "dark road at night",
        "broken street light", "street lamp"
    ],
    "PUBLIC_SPACE": [
        "park", "public park", "playground", "children park", "garden", "public garden",
        "bench broken", "park benches", "swings broken", "playground slide",
        "open gym", "walking track", "jogging track", "fountain in square",
        "public toilet in park", "community hall", "gazebo", "statue damaged",
        "botanical garden", "recreational ground", "overgrown grass in park"
    ]
}

# Urgent / High-priority hazard triggers
URGENT_KEYWORDS = [
    "accident", "danger", "hazardous", "fatal", "death", "casualty", "injury",
    "electric shock", "hanging wire", "live wire", "sparking", "fire",
    "explosion", "deep crater", "massive sinkhole", "burst pipeline flooding",
    "contaminated water disease", "toxic", "pedestrian fell", "severe flood"
]

HIGH_PRIORITY_KEYWORDS = [
    "overflowing", "completely blocked", "urgent", "emergency", "crisis",
    "no water for days", "stinking", "dengue", "mosquitoes", "slipping",
    "unmarked speed breaker", "completely dark", "unusable"
]

def clean_text(text: str) -> str:
    """Preprocess and normalize input text with typo correction."""
    if not text:
        return ""
    cleaned = text.lower().strip()
    for pattern, replacement in TYPO_CORRECTIONS.items():
        cleaned = re.sub(pattern, replacement, cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned

def evaluate_keyword_signals(cleaned_text: str) -> dict:
    """Calculates keyword match scores across categories with phrase weight."""
    scores = {cat: 0.0 for cat in CATEGORIES}

    # Contextual disambiguation rules (e.g. water logging -> DRAINAGE)
    if "water logging" in cleaned_text or "waterlogging" in cleaned_text or "stagnant water" in cleaned_text:
        scores["DRAINAGE"] += 3.5
    if "sewage water" in cleaned_text or "drain water" in cleaned_text or "gutter water" in cleaned_text:
        scores["DRAINAGE"] += 3.0
    if "street light" in cleaned_text or "streetlight" in cleaned_text:
        scores["STREET_LIGHT"] += 3.5
    if "pothole" in cleaned_text or "potholes" in cleaned_text:
        scores["ROAD"] += 3.5
    if "drinking water" in cleaned_text or "tap water" in cleaned_text or "water supply" in cleaned_text:
        scores["WATER_SUPPLY"] += 3.5
    if "garbage" in cleaned_text or "dustbin" in cleaned_text or "waste dump" in cleaned_text:
        scores["WASTE_MANAGEMENT"] += 3.5

    for cat, phrases in CIVIC_KEYWORD_RULES.items():
        for phrase in phrases:
            # Word boundary matching
            escaped = re.escape(phrase)
            matches = len(re.findall(r'\b' + escaped + r'\b', cleaned_text))
            if matches > 0:
                # Longer phrases carry higher confidence
                weight = 1.5 if ' ' in phrase else 1.0
                scores[cat] += matches * weight

    return scores

def estimate_priority(cleaned_text: str) -> str:
    """Estimates priority based on severity markers."""
    for kw in URGENT_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', cleaned_text):
            return "URGENT"
    for kw in HIGH_PRIORITY_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', cleaned_text):
            return "HIGH"
    return "MEDIUM"

def load_system():
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")
    if not os.path.exists(metadata_path):
        raise Exception("Model metadata not found. Please train the model first.")

    with open(metadata_path, 'r') as f:
        metadata = json.load(f)

    clf = joblib.load(os.path.join(MODELS_DIR, "classifier.joblib"))
    vectorizer = None
    embedder = None

    if metadata.get("feature_type") == "tfidf":
        vectorizer = joblib.load(os.path.join(MODELS_DIR, "vectorizer.joblib"))
    elif metadata.get("feature_type") == "semantic":
        from sentence_transformers import SentenceTransformer
        embedder = SentenceTransformer(metadata["embedder_name"])

    return clf, vectorizer, embedder, metadata

def predict(complaint_text, clf, vectorizer, embedder, metadata):
    cleaned = clean_text(complaint_text)

    # Empty or gibberish check
    alphanumeric_chars = len(re.findall(r'[a-zA-Z0-9]', cleaned))
    if alphanumeric_chars < 3:
        return {
            "category": "OTHER",
            "confidence": 0.1,
            "priority": "LOW",
            "model": metadata.get("model_name", "SGCS-Ensemble")
        }

    # 1. Model inference
    if metadata.get("feature_type") == "tfidf":
        X = vectorizer.transform([cleaned])
    else:
        X = embedder.encode([cleaned], show_progress_bar=False)

    model_probs = {}
    if hasattr(clf, "predict_proba"):
        probs = clf.predict_proba(X)[0]
        for c, p in zip(clf.classes_, probs):
            model_probs[c] = float(p)
    elif hasattr(clf, "decision_function"):
        dec_vals = clf.decision_function(X)[0]
        exp_vals = np.exp(dec_vals - np.max(dec_vals))
        probs = exp_vals / np.sum(exp_vals)
        for c, p in zip(clf.classes_, probs):
            model_probs[c] = float(p)
    else:
        pred_cat = clf.predict(X)[0]
        for c in CATEGORIES:
            model_probs[c] = 1.0 if c == pred_cat else 0.0

    # 2. Rule & Domain Keyword evaluation
    rule_scores = evaluate_keyword_signals(cleaned)
    max_rule_score = max(rule_scores.values()) if rule_scores else 0.0

    # 3. Hybrid Ensemble Fusion
    combined_scores = {}
    for cat in CATEGORIES:
        m_prob = model_probs.get(cat, 0.0)
        r_score = rule_scores.get(cat, 0.0)

        if max_rule_score >= 2.0:
            # Strong rule signal: boost category
            boost = (r_score / max_rule_score) * 0.45
            combined = 0.55 * m_prob + boost
        elif max_rule_score > 0:
            boost = (r_score / max_rule_score) * 0.25
            combined = 0.75 * m_prob + boost
        else:
            combined = m_prob

        combined_scores[cat] = combined

    # Normalize to probabilities
    total = sum(combined_scores.values())
    if total > 0:
        for c in combined_scores:
            combined_scores[c] /= total

    best_cat = max(combined_scores, key=combined_scores.get)
    best_conf = float(combined_scores[best_cat])

    # Calibrate confidence threshold for non-civic or ambiguous input
    if best_conf < 0.28:
        best_cat = "OTHER"
        best_conf = round(best_conf, 4)
    else:
        best_conf = round(min(best_conf, 0.999), 4)

    suggested_priority = estimate_priority(cleaned)

    return {
        "category": str(best_cat),
        "confidence": best_conf,
        "priority": suggested_priority,
        "model": metadata.get("model_name", "SGCS-Ensemble")
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide a complaint text as an argument."}))
        sys.exit(1)

    text = " ".join(sys.argv[1:])
    try:
        clf, vectorizer, embedder, metadata = load_system()
        result = predict(text, clf, vectorizer, embedder, metadata)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
