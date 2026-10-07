import os
import pandas as pd
import numpy as np
import json
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix
try:
    from sentence_transformers import SentenceTransformer
    has_sentence_transformers = True
except ImportError:
    has_sentence_transformers = False

# Configuration
DATASET_PATH = '../dataset/processed/SGCS_AI_MASTER_DATASET.csv'
MODELS_DIR = 'models'
TRAINING_DIR = 'training'

for d in [MODELS_DIR, TRAINING_DIR]:
    os.makedirs(d, exist_ok=True)

FINAL_CATEGORIES = ["ROAD", "WATER_SUPPLY", "WASTE_MANAGEMENT", "DRAINAGE", "STREET_LIGHT", "PUBLIC_SPACE"]

print("STEP 1: VERIFY DATASET")
if not os.path.exists(DATASET_PATH):
    print(f"Error: Dataset not found at {DATASET_PATH}")
    exit(1)

df = pd.read_csv(DATASET_PATH)

print(f"- Total rows: {len(df)}")
# Check for empty text
empty_rows = df['complaint_text'].isna().sum()
if empty_rows > 0:
    print(f"- Found {empty_rows} empty complaint_text. Dropping them.")
    df = df.dropna(subset=['complaint_text'])

# Check for duplicates
duplicates = df.duplicated(subset=['complaint_text']).sum()
print(f"- Duplicate complaint_texts: {duplicates}")
if duplicates > 0:
    df = df.drop_duplicates(subset=['complaint_text'])

# Invalid categories
invalid_categories = [c for c in df['category'].unique() if c not in FINAL_CATEGORIES]
if invalid_categories:
    print(f"- Found invalid categories: {invalid_categories}. Filtering them out.")
    df = df[df['category'].isin(FINAL_CATEGORIES)]
    if len(df) == 0:
        print("Error: No valid categories left.")
        exit(1)

category_dist = df['category'].value_counts()
print("\n- Category distribution:")
for cat, count in category_dist.items():
    print(f"  {cat}: {count}")

lengths = df['complaint_text'].apply(len)
print(f"\n- Minimum text length: {lengths.min()}")
print(f"- Maximum text length: {lengths.max()}")

print("\nSTEP 2: SPLIT THE DATASET")
X = df['complaint_text'].values
y = df['category'].values

# Stratified split: 80% Train, 10% Val, 10% Test
X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.10, stratify=y, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=1/9, stratify=y_train_val, random_state=42) # 10% of total is 1/9 of 90%

print(f"Train size: {len(X_train)}")
print(f"Validation size: {len(X_val)}")
print(f"Test size: {len(X_test)}")

print("\nSTEP 3: CREATE A BASELINE MODEL (TF-IDF + Logistic Regression)")
vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=10000)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_val_tfidf = vectorizer.transform(X_val)
X_test_tfidf = vectorizer.transform(X_test)

lr_model = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)
lr_model.fit(X_train_tfidf, y_train)

print("\nSTEP 4: TRAIN A SECOND MODEL (TF-IDF + Linear SVM)")
svm_model = LinearSVC(class_weight='balanced', random_state=42)
svm_model.fit(X_train_tfidf, y_train)

# Dictionary to hold models and features
models = {
    "TF-IDF + Logistic Regression": {"model": lr_model, "feature_type": "tfidf"},
    "TF-IDF + Linear SVM": {"model": svm_model, "feature_type": "tfidf"}
}

print("\nSTEP 5: TRAIN A SEMANTIC MODEL")
if has_sentence_transformers:
    print("SentenceTransformers found! Training semantic model...")
    sbert_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    
    print("Generating sentence embeddings for Train/Val/Test...")
    X_train_emb = sbert_model.encode(X_train.tolist(), show_progress_bar=False)
    X_val_emb = sbert_model.encode(X_val.tolist(), show_progress_bar=False)
    X_test_emb = sbert_model.encode(X_test.tolist(), show_progress_bar=False)
    
    semantic_svm = LinearSVC(class_weight='balanced', random_state=42)
    semantic_svm.fit(X_train_emb, y_train)
    
    models["Sentence Transformer + SVM"] = {
        "model": semantic_svm, 
        "feature_type": "semantic",
        "embedder": sbert_model
    }
else:
    print("SentenceTransformers not found. Skipping semantic model.")


print("\nSTEP 6: EVALUATE MODELS (On Validation Set for Selection)")

results = []
best_macro_f1 = -1
best_model_name = ""

for name, info in models.items():
    model = info["model"]
    ftype = info["feature_type"]
    
    if ftype == "tfidf":
        X_eval = X_val_tfidf
    elif ftype == "semantic":
        X_eval = X_val_emb
        
    y_pred = model.predict(X_eval)
    
    acc = accuracy_score(y_val, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_val, y_pred, average=None, labels=FINAL_CATEGORIES)
    macro_f1 = np.mean(f1)
    weighted_f1 = precision_recall_fscore_support(y_val, y_pred, average='weighted')[2]
    
    results.append({
        "Model": name,
        "Accuracy": acc,
        "Macro F1": macro_f1,
        "Weighted F1": weighted_f1,
        "PerCategory": {cat: {"Precision": prec[i], "Recall": rec[i], "F1": f1[i]} for i, cat in enumerate(FINAL_CATEGORIES)}
    })
    
    if macro_f1 > best_macro_f1:
        best_macro_f1 = macro_f1
        best_model_name = name

print(f"{'Model':<35} | {'Accuracy':<10} | {'Macro F1':<10} | {'Weighted F1':<10}")
print("-" * 75)
for r in results:
    print(f"{r['Model']:<35} | {r['Accuracy']:.4f}     | {r['Macro F1']:.4f}     | {r['Weighted F1']:.4f}")

# Final evaluation on Test Set for the Best Model
best_info = models[best_model_name]
print(f"\nSTEP 7: SELECT THE BEST MODEL")
print(f"Selected: {best_model_name}")

if best_info["feature_type"] == "tfidf":
    X_test_eval = X_test_tfidf
else:
    X_test_eval = X_test_emb

y_test_pred = best_info["model"].predict(X_test_eval)

print("\nFinal Test Set Evaluation for Best Model:")
print(classification_report(y_test, y_test_pred, labels=FINAL_CATEGORIES))
cm = confusion_matrix(y_test, y_test_pred, labels=FINAL_CATEGORIES)

print("\nSTEP 8: ANALYZE DIFFICULT CATEGORIES")
confusion_df = pd.DataFrame(cm, index=FINAL_CATEGORIES, columns=FINAL_CATEGORIES)
print("Confusion Matrix:")
print(confusion_df)

# Finding top confusions
print("\nTop Confusions:")
for i in range(len(FINAL_CATEGORIES)):
    for j in range(len(FINAL_CATEGORIES)):
        if i != j and cm[i, j] > 0:
            print(f"- True {FINAL_CATEGORIES[i]} predicted as {FINAL_CATEGORIES[j]}: {cm[i, j]} times")

print("\nSTEP 9: TEST REALISTIC SGCS COMPLAINTS")
test_cases = [
    ("Large pothole near the college gate causing accidents", "ROAD"),
    ("No water in the taps since yesterday morning in ward 4", "WATER_SUPPLY"),
    ("Garbage truck didn't come to pick up trash, it's smelling very bad", "WASTE_MANAGEMENT"),
    ("Sewage water is overflowing on the main street", "DRAINAGE"),
    ("Street lights are not working and it is very dark", "STREET_LIGHT"),
    ("The local park has broken benches and uncut grass", "PUBLIC_SPACE"),
    ("Deep crater in the middle of the highway", "ROAD"),
    ("Drinking water pipeline has burst, water is leaking everywhere", "WATER_SUPPLY"),
    ("People are dumping solid waste near the river bank", "WASTE_MANAGEMENT"),
    ("Storm drain gets clogged every time it rains", "DRAINAGE"),
    ("Pole 42 bulb is burnt out completely", "STREET_LIGHT"),
    ("Gym equipment at community center needs repair", "PUBLIC_SPACE"),
    ("The road is broken off at the edges", "ROAD"),
    ("Gutter block near the fish market", "DRAINAGE"),
    ("Foul smell from public garbage bin not emptied for weeks", "WASTE_MANAGEMENT")
]

test_texts = [tc[0] for tc in test_cases]
expected_labels = [tc[1] for tc in test_cases]

if best_info["feature_type"] == "tfidf":
    X_custom = vectorizer.transform(test_texts)
else:
    X_custom = best_info["embedder"].encode(test_texts, show_progress_bar=False)

# STEP 10: CONFIDENCE (getting probabilities if possible, otherwise margins)
model_clf = best_info["model"]
try:
    if hasattr(model_clf, "predict_proba"):
        probs = model_clf.predict_proba(X_custom)
        custom_preds = model_clf.classes_[np.argmax(probs, axis=1)]
        confidences = np.max(probs, axis=1)
    elif hasattr(model_clf, "decision_function"):
        # For LinearSVC, we can approximate confidence with softmax of decision function
        dec_vals = model_clf.decision_function(X_custom)
        exp_vals = np.exp(dec_vals - np.max(dec_vals, axis=1, keepdims=True))
        probs = exp_vals / np.sum(exp_vals, axis=1, keepdims=True)
        custom_preds = model_clf.classes_[np.argmax(probs, axis=1)]
        confidences = np.max(probs, axis=1)
    else:
        custom_preds = model_clf.predict(X_custom)
        confidences = [1.0] * len(test_texts)
except Exception as e:
    custom_preds = model_clf.predict(X_custom)
    confidences = [1.0] * len(test_texts)

print("\Realistic Complaints Testing:")
for text, exp, pred, conf in zip(test_texts, expected_labels, custom_preds, confidences):
    correct = "Correct" if exp == pred else "Incorrect"
    print(f"Complaint: '{text}'")
    print(f"  Expected: {exp} | Predicted: {pred} | Correct: {correct} | Confidence: {conf:.4f}\n")


print("STEP 11: SAVE THE TRAINED MODEL")
model_metadata = {
    "model_name": best_model_name,
    "feature_type": best_info["feature_type"],
    "categories": FINAL_CATEGORIES
}
joblib.dump(best_info["model"], os.path.join(MODELS_DIR, "classifier.joblib"))
if best_info["feature_type"] == "tfidf":
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, "vectorizer.joblib"))
elif best_info["feature_type"] == "semantic":
    model_metadata["embedder_name"] = 'sentence-transformers/all-MiniLM-L6-v2'

with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
    json.dump(model_metadata, f, indent=4)

print("STEP 13: SAVE TRAINING RESULTS")
training_report = {
    "dataset_stats": {
        "total_rows": len(df),
        "train_size": len(X_train),
        "val_size": len(X_val),
        "test_size": len(X_test),
        "category_distribution": category_dist.to_dict()
    },
    "models_evaluated": results,
    "best_model": {
        "name": best_model_name,
        "macro_f1": best_macro_f1,
        "reason": "Highest Macro F1-score across validation set."
    },
    "confusion_matrix": confusion_df.to_dict(),
    "realistic_tests": [
        {"text": text, "expected": exp, "predicted": pred, "confidence": float(conf), "correct": exp == pred}
        for text, exp, pred, conf in zip(test_texts, expected_labels, custom_preds, confidences)
    ]
}

with open(os.path.join(TRAINING_DIR, "training_results.json"), "w") as f:
    json.dump(training_report, f, indent=4)

# Create a human-readable report file
with open(os.path.join(TRAINING_DIR, "training_report.txt"), "w") as f:
    f.write("=== SGCS AI Training Report ===\n\n")
    f.write(f"Best Model: {best_model_name}\n")
    f.write(f"Test Accuracy: {accuracy_score(y_test, y_test_pred):.4f}\n")
    f.write("Full Results JSON is saved in training_results.json\n")

print("\n--- Training Complete ---")
print("Models saved successfully in ai_service/models/")
print("Results saved in ai_service/training/")
