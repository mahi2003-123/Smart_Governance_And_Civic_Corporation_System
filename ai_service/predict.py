import os
import sys
import json
import joblib
import numpy as np

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

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
    if metadata["feature_type"] == "tfidf":
        X = vectorizer.transform([complaint_text])
    else:
        X = embedder.encode([complaint_text], show_progress_bar=False)
        
    # Get prediction
    if hasattr(clf, "predict_proba"):
        probs = clf.predict_proba(X)[0]
        max_idx = np.argmax(probs)
        category = clf.classes_[max_idx]
        confidence = float(probs[max_idx])
    elif hasattr(clf, "decision_function"):
        dec_vals = clf.decision_function(X)[0]
        # Approximation of confidence
        exp_vals = np.exp(dec_vals - np.max(dec_vals))
        probs = exp_vals / np.sum(exp_vals)
        max_idx = np.argmax(probs)
        category = clf.classes_[max_idx]
        confidence = float(probs[max_idx])
    else:
        category = clf.predict(X)[0]
        confidence = 1.0
        
    return {
        "category": str(category),
        "confidence": round(confidence, 4),
        "model": metadata["model_name"]
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
