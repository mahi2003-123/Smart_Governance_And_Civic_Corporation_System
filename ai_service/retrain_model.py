import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, f1_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
PROJECT_ROOT = os.path.dirname(BASE_DIR)

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

FINAL_CATEGORIES = ["ROAD", "WATER_SUPPLY", "WASTE_MANAGEMENT", "DRAINAGE", "STREET_LIGHT", "PUBLIC_SPACE"]

print("STEP 1: Loading Datasets...")
master_path = os.path.join(PROJECT_ROOT, "dataset", "processed", "SGCS_AI_MASTER_DATASET.csv")
cleaned_path = os.path.join(PROJECT_ROOT, "dataset", "processed", "cleaned_complaints.csv")

df_master = pd.read_csv(master_path)
print(f"Loaded master dataset: {len(df_master)} rows")

df_cleaned = pd.read_csv(cleaned_path)
ps_samples = df_cleaned[df_cleaned['mapped_category'] == 'PUBLIC_SPACE'][['clean_text', 'mapped_category']].rename(
    columns={'clean_text': 'complaint_text', 'mapped_category': 'category'}
)
print(f"Loaded public space samples from cleaned: {len(ps_samples)} rows")

extra_public_space = [
    ('Park benches are completely broken and vandalized', 'PUBLIC_SPACE'),
    ('Children playground swing set is broken and unsafe', 'PUBLIC_SPACE'),
    ('Public garden walking track has loose tiles and deep mud', 'PUBLIC_SPACE'),
    ('Trees fell down in the municipal park blocking walkways', 'PUBLIC_SPACE'),
    ('Community hall roof leaking and doors broken', 'PUBLIC_SPACE'),
    ('Open gym equipment in the park is rusted and unserviceable', 'PUBLIC_SPACE'),
    ('Fencing of public playground is broken dogs entering inside', 'PUBLIC_SPACE'),
    ('Public square fountain broken water stagnant causing mosquitoes', 'PUBLIC_SPACE'),
    ('Walking path lights broken in local park', 'PUBLIC_SPACE'),
    ('Grass and wild bushes overgrown in children play area', 'PUBLIC_SPACE'),
    ('Statue in public roundabout damaged and neglected', 'PUBLIC_SPACE'),
    ('Public library reading room fan and benches broken', 'PUBLIC_SPACE'),
    ('Footpath in public square blocked by fallen tree branches', 'PUBLIC_SPACE'),
    ('Jogging track in town park covered with weeds', 'PUBLIC_SPACE'),
    ('Playground slide has sharp metal edges dangerous for kids', 'PUBLIC_SPACE'),
    ('Recreational center basketball court net and hoop broken', 'PUBLIC_SPACE'),
    ('City garden gazebo collapsed needs immediate restoration', 'PUBLIC_SPACE'),
    ('Public park toilet doors broken and no water', 'PUBLIC_SPACE'),
    ('Community park lights are not turned on at night dark and unsafe', 'PUBLIC_SPACE'),
    ('Flower beds destroyed in municipal botanical garden', 'PUBLIC_SPACE'),
    ('Public square pavement tiles broken causing pedestrians to trip', 'PUBLIC_SPACE'),
    ('Municipal park benches stolen and boundary wall damaged', 'PUBLIC_SPACE'),
    ('Swings in children amusement area snapped', 'PUBLIC_SPACE'),
    ('Public gazebo roof tiles broken in botanical garden', 'PUBLIC_SPACE')
]
df_extra = pd.DataFrame(extra_public_space, columns=['complaint_text', 'category'])

combined = pd.concat([df_master, ps_samples, df_extra], ignore_index=True)
combined['complaint_text'] = combined['complaint_text'].astype(str).str.strip()
combined = combined[combined['complaint_text'] != '']
combined = combined.drop_duplicates(subset=['complaint_text'])

# Augment PUBLIC_SPACE so each class has substantial presence for calibration
ps_rows = combined[combined['category'] == 'PUBLIC_SPACE']
combined = pd.concat([combined, ps_rows, ps_rows], ignore_index=True)

print("Dataset class distribution:")
print(combined['category'].value_counts())

print("\nSTEP 2: Training Calibrated Classifier...")
X = combined['complaint_text'].values
y = combined['category'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=42
)

vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    sublinear_tf=True,
    min_df=2,
    max_features=15000,
    lowercase=True,
    stop_words='english'
)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

base_svm = LinearSVC(C=1.0, random_state=42)
calib_clf = CalibratedClassifierCV(estimator=base_svm, cv=3)
calib_clf.fit(X_train_vec, y_train)

y_pred = calib_clf.predict(X_test_vec)
acc = accuracy_score(y_test, y_pred)
macro_f1 = f1_score(y_test, y_pred, average='macro')
print(f"\nTest Accuracy: {acc:.4f} | Macro F1: {macro_f1:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, labels=FINAL_CATEGORIES))

print("\nSTEP 3: Saving Artifacts...")
# 1. Models dir
joblib.dump(calib_clf, os.path.join(MODELS_DIR, "classifier.joblib"))
joblib.dump(vectorizer, os.path.join(MODELS_DIR, "vectorizer.joblib"))

model_metadata = {
    "model_name": "Calibrated LinearSVC",
    "feature_type": "tfidf",
    "categories": FINAL_CATEGORIES,
    "accuracy": round(float(acc), 4),
    "macro_f1": round(float(macro_f1), 4)
}
with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
    json.dump(model_metadata, f, indent=4)

# 2. Pipeline in root of ai_service
pipeline = Pipeline([
    ('vectorizer', vectorizer),
    ('classifier', calib_clf)
])
joblib.dump(pipeline, os.path.join(BASE_DIR, "complaint_model.joblib"))
print("Saved models/classifier.joblib, models/vectorizer.joblib, complaint_model.joblib, and model_metadata.json successfully!")
