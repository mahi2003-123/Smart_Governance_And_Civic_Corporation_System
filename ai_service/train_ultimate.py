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
PROJECT_ROOT = os.path.dirname(BASE_DIR)

os.makedirs(MODELS_DIR, exist_ok=True)

FINAL_CATEGORIES = ["ROAD", "WATER_SUPPLY", "WASTE_MANAGEMENT", "DRAINAGE", "STREET_LIGHT", "PUBLIC_SPACE"]

print("STEP 1: Loading Datasets...")
master_path = os.path.join(PROJECT_ROOT, "dataset", "processed", "SGCS_AI_MASTER_DATASET.csv")
df_master = pd.read_csv(master_path)
print(f"Loaded master dataset: {len(df_master)} rows")

# Comprehensive high-intent municipal short phrases and common expressions
expert_seed_data = [
    # ROAD - explicit singular, plural, and variations
    ("pothole", "ROAD"),
    ("potholes", "ROAD"),
    ("big pothole", "ROAD"),
    ("deep pothole", "ROAD"),
    ("pothole on road", "ROAD"),
    ("potholes on the street", "ROAD"),
    ("road damage", "ROAD"),
    ("road broken", "ROAD"),
    ("damaged road", "ROAD"),
    ("broken road", "ROAD"),
    ("asphalt", "ROAD"),
    ("asphalt road broken", "ROAD"),
    ("tar road damaged", "ROAD"),
    ("crater on road", "ROAD"),
    ("craters on highway", "ROAD"),
    ("speed breaker unmarked", "ROAD"),
    ("dangerous speed bump", "ROAD"),
    ("road divider broken", "ROAD"),
    ("road cave in", "ROAD"),
    ("road depression", "ROAD"),
    ("uneven road surface", "ROAD"),
    ("bumpy road", "ROAD"),
    ("loose gravel on road", "ROAD"),
    ("pavement damaged", "ROAD"),
    ("footpath broken", "ROAD"),
    ("missing footpath tiles", "ROAD"),
    ("pedestrian pathway damaged", "ROAD"),
    ("road resurfacing needed", "ROAD"),
    ("bitumen road peeled off", "ROAD"),
    ("culvert bridge damaged", "ROAD"),
    ("flyover expansion joint damaged", "ROAD"),
    ("road dug up by contractor not repaired", "ROAD"),
    ("trench on road left open", "ROAD"),
    ("curb stone dislodged on street", "ROAD"),
    ("zebra crossing faded", "ROAD"),

    # WATER_SUPPLY - clean water, drinking supply, taps, pipes
    ("no water", "WATER_SUPPLY"),
    ("no water supply", "WATER_SUPPLY"),
    ("drinking water problem", "WATER_SUPPLY"),
    ("water pipe leak", "WATER_SUPPLY"),
    ("pipeline burst", "WATER_SUPPLY"),
    ("burst water pipe", "WATER_SUPPLY"),
    ("low water pressure", "WATER_SUPPLY"),
    ("dirty drinking water", "WATER_SUPPLY"),
    ("muddy water from tap", "WATER_SUPPLY"),
    ("contaminated tap water", "WATER_SUPPLY"),
    ("water meter broken", "WATER_SUPPLY"),
    ("main water valve leaking", "WATER_SUPPLY"),
    ("water tanker required", "WATER_SUPPLY"),
    ("borewell pump not working", "WATER_SUPPLY"),
    ("municipal water not coming", "WATER_SUPPLY"),
    ("water shortage in locality", "WATER_SUPPLY"),
    ("water pipeline ruptured under road", "WATER_SUPPLY"),
    ("chlorine smell in drinking water", "WATER_SUPPLY"),
    ("overhead water tank overflow", "WATER_SUPPLY"),
    ("drinking water pipeline damaged", "WATER_SUPPLY"),
    ("tap dry for three days", "WATER_SUPPLY"),

    # WASTE_MANAGEMENT - solid waste, garbage, trash
    ("garbage", "WASTE_MANAGEMENT"),
    ("trash", "WASTE_MANAGEMENT"),
    ("waste dumped", "WASTE_MANAGEMENT"),
    ("overflowing garbage bin", "WASTE_MANAGEMENT"),
    ("garbage truck did not arrive", "WASTE_MANAGEMENT"),
    ("garbage not collected", "WASTE_MANAGEMENT"),
    ("dumping waste on street", "WASTE_MANAGEMENT"),
    ("litter scattered everywhere", "WASTE_MANAGEMENT"),
    ("plastic waste pile", "WASTE_MANAGEMENT"),
    ("dead animal on road", "WASTE_MANAGEMENT"),
    ("dead dog rotting on pavement", "WASTE_MANAGEMENT"),
    ("rotting trash smell", "WASTE_MANAGEMENT"),
    ("foul smell from garbage", "WASTE_MANAGEMENT"),
    ("street not swept by sanitation worker", "WASTE_MANAGEMENT"),
    ("debris dumped on footpath", "WASTE_MANAGEMENT"),
    ("construction rubble on roadside", "WASTE_MANAGEMENT"),
    ("bio medical waste disposed openly", "WASTE_MANAGEMENT"),
    ("commercial kitchen waste dumped", "WASTE_MANAGEMENT"),
    ("tree trimmings and green waste dumped", "WASTE_MANAGEMENT"),
    ("illegal garbage dumping area", "WASTE_MANAGEMENT"),

    # DRAINAGE - sewer, storm water, gutters, waterlogging
    ("drainage", "DRAINAGE"),
    ("drain clogged", "DRAINAGE"),
    ("blocked drain", "DRAINAGE"),
    ("gutter", "DRAINAGE"),
    ("gutter overflow", "DRAINAGE"),
    ("sewage overflow", "DRAINAGE"),
    ("sewer line blocked", "DRAINAGE"),
    ("sewage water on street", "DRAINAGE"),
    ("manhole overflowing", "DRAINAGE"),
    ("manhole cover missing", "DRAINAGE"),
    ("open gutter dangerous", "DRAINAGE"),
    ("waterlogging", "DRAINAGE"),
    ("water logging", "DRAINAGE"),
    ("water logging in front of house", "DRAINAGE"),
    ("water logging on street after rain", "DRAINAGE"),
    ("stagnant rain water on road", "DRAINAGE"),
    ("storm water drain chocked", "DRAINAGE"),
    ("foul smell from open sewer", "DRAINAGE"),
    ("sewage backflow into house", "DRAINAGE"),
    ("nullah blocked with silt", "DRAINAGE"),
    ("culvert blocked with mud causing flooding", "DRAINAGE"),
    ("rainwater stagnant breeding mosquitoes", "DRAINAGE"),
    ("drain slab broken", "DRAINAGE"),

    # STREET_LIGHT - lighting, poles, fixtures
    ("street light", "STREET_LIGHT"),
    ("streetlight", "STREET_LIGHT"),
    ("street lights", "STREET_LIGHT"),
    ("streetlights", "STREET_LIGHT"),
    ("street light not working", "STREET_LIGHT"),
    ("dark street", "STREET_LIGHT"),
    ("pitch dark on colony road", "STREET_LIGHT"),
    ("broken street light", "STREET_LIGHT"),
    ("bulb fused on pole", "STREET_LIGHT"),
    ("lamp post light off", "STREET_LIGHT"),
    ("flickering street light", "STREET_LIGHT"),
    ("street light bulb burnt out", "STREET_LIGHT"),
    ("electric light pole leaning", "STREET_LIGHT"),
    ("wire hanging from light pole", "STREET_LIGHT"),
    ("high mast lighting defunct", "STREET_LIGHT"),
    ("street light on during daytime", "STREET_LIGHT"),
    ("no lighting near bus stop unsafe", "STREET_LIGHT"),
    ("led street light defective", "STREET_LIGHT"),
    ("light pole damaged by truck", "STREET_LIGHT"),

    # PUBLIC_SPACE - parks, gardens, playgrounds, community facilities
    ("park", "PUBLIC_SPACE"),
    ("public park", "PUBLIC_SPACE"),
    ("playground", "PUBLIC_SPACE"),
    ("children park", "PUBLIC_SPACE"),
    ("park swing broken", "PUBLIC_SPACE"),
    ("playground slide damaged", "PUBLIC_SPACE"),
    ("broken bench in park", "PUBLIC_SPACE"),
    ("park benches damaged", "PUBLIC_SPACE"),
    ("open gym equipment broken", "PUBLIC_SPACE"),
    ("public garden neglected", "PUBLIC_SPACE"),
    ("overgrown grass in park", "PUBLIC_SPACE"),
    ("park walking track damaged", "PUBLIC_SPACE"),
    ("jogging track tiles broken", "PUBLIC_SPACE"),
    ("fountain in public square broken", "PUBLIC_SPACE"),
    ("public toilet in garden dirty and locked", "PUBLIC_SPACE"),
    ("community hall roof damaged", "PUBLIC_SPACE"),
    ("park boundary wall collapsed", "PUBLIC_SPACE"),
    ("gazebo in public park collapsed", "PUBLIC_SPACE"),
    ("statue in municipal park neglected", "PUBLIC_SPACE"),
    ("botanical garden flowers destroyed", "PUBLIC_SPACE"),
    ("recreational center basketball hoop broken", "PUBLIC_SPACE")
]

# Multiply seed data so single words & high frequency patterns have strong representation
seed_multiplied = []
for _ in range(6):
    seed_multiplied.extend(expert_seed_data)

df_seed = pd.DataFrame(seed_multiplied, columns=["complaint_text", "category"])

# Balanced PUBLIC_SPACE extra entries
cleaned_path = os.path.join(PROJECT_ROOT, "dataset", "processed", "cleaned_complaints.csv")
if os.path.exists(cleaned_path):
    df_cleaned = pd.read_csv(cleaned_path)
    ps_samples = df_cleaned[df_cleaned['mapped_category'] == 'PUBLIC_SPACE'][['clean_text', 'mapped_category']].rename(
        columns={'clean_text': 'complaint_text', 'mapped_category': 'category'}
    )
else:
    ps_samples = pd.DataFrame()

combined = pd.concat([df_master, df_seed, ps_samples], ignore_index=True)
combined['complaint_text'] = combined['complaint_text'].astype(str).str.strip()
combined = combined[combined['complaint_text'] != '']
combined = combined[combined['category'].isin(FINAL_CATEGORIES)]
combined = combined.drop_duplicates(subset=['complaint_text'])

print("\nBalanced Class Distribution:")
print(combined['category'].value_counts())

X = combined['complaint_text'].values
y = combined['category'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=42
)

# Vectorizer with min_df=1 so every civic keyword is included
vectorizer = TfidfVectorizer(
    ngram_range=(1, 3),
    sublinear_tf=True,
    min_df=1,
    max_features=25000,
    lowercase=True,
    stop_words='english',
    strip_accents='unicode'
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

print(f"\nVocabulary size: {len(vectorizer.vocabulary_)} features")
for test_w in ["pothole", "potholes", "streetlight", "streetlights", "waterlogging", "bitumen", "manhole"]:
    print(f"Feature '{test_w}' present: {test_w in vectorizer.vocabulary_}")

base_svm = LinearSVC(C=1.0, random_state=42, max_iter=3000)
calib_clf = CalibratedClassifierCV(estimator=base_svm, cv=3)
calib_clf.fit(X_train_vec, y_train)

y_pred = calib_clf.predict(X_test_vec)
acc = accuracy_score(y_test, y_pred)
macro_f1 = f1_score(y_test, y_pred, average='macro')

print(f"\nModel Performance on Test Set:")
print(f"Accuracy : {acc * 100:.2f}%")
print(f"Macro F1 : {macro_f1 * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, labels=FINAL_CATEGORIES, digits=4))

# Save artifacts
joblib.dump(calib_clf, os.path.join(MODELS_DIR, "classifier.joblib"))
joblib.dump(vectorizer, os.path.join(MODELS_DIR, "vectorizer.joblib"))

model_metadata = {
    "model_name": "Calibrated LinearSVC (Enhanced Civic Engine)",
    "feature_type": "tfidf",
    "categories": FINAL_CATEGORIES,
    "accuracy": round(float(acc), 4),
    "macro_f1": round(float(macro_f1), 4),
    "total_training_samples": len(combined)
}

with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
    json.dump(model_metadata, f, indent=4)

# Pipeline
pipeline = Pipeline([
    ('vectorizer', vectorizer),
    ('classifier', calib_clf)
])
joblib.dump(pipeline, os.path.join(BASE_DIR, "complaint_model.joblib"))

print("\nModel trained & saved successfully to ai_service/models!")
