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
PROJECT_ROOT = os.path.dirname(BASE_DIR)
AI_SERVICE_DIR = os.path.join(PROJECT_ROOT, "ai_service")
MODELS_DIR = os.path.join(AI_SERVICE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "processed"), exist_ok=True)

FINAL_CATEGORIES = ["ROAD", "WATER_SUPPLY", "WASTE_MANAGEMENT", "DRAINAGE", "STREET_LIGHT", "PUBLIC_SPACE"]

print("==================================================")
print("SGCS AI DATASET COMPILATION & MODEL TRAINING")
print("==================================================")

# 1. Load manual_complaints_5000.csv
manual_path = os.path.join(BASE_DIR, "manual_complaints_5000.csv")
df_manual = pd.read_csv(manual_path)
cat_map = {
    'Road Damage': 'ROAD',
    'Water Leakage': 'WATER_SUPPLY',
    'Garbage': 'WASTE_MANAGEMENT',
    'Drainage Blockage': 'DRAINAGE',
    'Streetlight Fault': 'STREET_LIGHT'
}
df_manual['category'] = df_manual['category'].map(cat_map)

# 2. Generate comprehensive PUBLIC_SPACE complaints (1,000+ realistic varied entries)
public_space_templates = [
    # Parks & Green Spaces
    "The municipal park {location} has {issue}.",
    "Children playground in {location} has {playground_issue}.",
    "Walking track and jogging path in {location} {path_issue}.",
    "Public garden {location} is completely neglected with {garden_issue}.",
    "Benches in {location} are {bench_issue}.",
    "Open gymnasium equipment in {location} is {gym_issue}.",
    "Fencing and boundary wall of {location} {fence_issue}.",
    "Community hall and public library {location} {building_issue}.",
    "Fountain in public square {location} {fountain_issue}.",
    "Botanical garden {location} has {greenery_issue}.",
    "The recreational grounds in {location} have {ground_issue}.",
    "Public park lights and gazebo in {location} {gazebo_issue}."
]

locations = [
    "Ward 1 central park", "Riverside promenade park", "East Hill community garden", 
    "Green Valley children park", "town municipal square", "heritage park", 
    "sector 4 public playground", "botanical garden", "lake view park", 
    "civic center lawn", "neighbourhood park", "freedom park", 
    "Gandhi memorial garden", "rotary public park", "ward sports complex"
]

issues = [
    "overgrown wild bushes and fallen tree branches blocking visitor paths",
    "broken benches, damaged pavements, and uncleaned fountain",
    "no security and boundary fencing torn down allowing stray animals",
    "vandalized signage, broken lampposts, and damaged footpaths",
    "collapsed gazebo structure making it unsafe for senior citizens",
    "fallen eucalyptus tree across the main walking promenade",
    "damaged entrance gate with sharp metal protruding outwards",
    "unmaintained public garden with dead flower beds and overgrown grass"
]

playground_issues = [
    "broken swing set chains with sharp hooks dangerous for kids",
    "cracked plastic slide with razor sharp edges causing injuries",
    "rusted see-saw with missing handles and bolts",
    "jungle gym climbing frame unstable and shaking violently",
    "rubber matting in toddler area torn off and exposing concrete",
    "merry-go-round jammed and completely immovable",
    "sandbox contaminated and boundary timber rotted away",
    "swings snapped and lying on the ground for two weeks"
]

path_issues = [
    "is full of broken paver blocks causing joggers and elders to trip",
    "has deep puddles and cracked concrete paving tiles",
    "is covered in thick mud and overgrown roots pushing through tiles",
    "has loose granite slabs that wobble and pinch pedestrians feet",
    "walking promenade surface eroded and needs urgent resurfacing",
    "pathway curb stones dislodged and rolling onto the turf"
]

garden_issues = [
    "dry grass, unpruned hedges, and dead trees about to fall",
    "irrigation sprinkler heads snapped and spraying water onto walkways",
    "flower beds trampled by stray cattle because gates are missing",
    "horticulture department has not tended or watered flower beds for months",
    "wild weeds and thorny creepers encroaching onto the seating lawns"
]

bench_issues = [
    "completely broken, cracked in half, and vandalized with spray paint",
    "stolen concrete seating slabs with exposed metal reinforcement rebar",
    "splintered wooden planks making them impossible to sit on",
    "rusted cast iron frame collapsed under seating weight"
]

gym_issues = [
    "rusted pulleys, snapped cables, and missing weight plates",
    "elliptical cross-trainer pedal broken off and dangerous to use",
    "pull-up bars loose from foundation concrete base",
    "seated chest press handles detached and hanging loose"
]

fence_issues = [
    "is broken down and stray cows and dogs wander through playground",
    "chain-link perimeter fence cut and vandalized by miscreants",
    "brick boundary wall leaning perilously towards adjacent footpath",
    "iron railing rusted through and missing several vertical bars"
]

building_issues = [
    "doors broken, ceiling plaster peeling off, and fans not working",
    "washrooms in community center locked and taps completely missing",
    "civic stage wooden floor termite-eaten and collapsing underfoot",
    "reading room benches broken and glass windows shattered"
]

fountain_issues = [
    "is dysfunctional with stagnant mosquito-breeding water",
    "jet nozzles clogged and surrounding decorative tiles chipped",
    "submersible pump burnt out and electrical wires left submerged",
    "pond basin cracked and water seeping into park walkways"
]

greenery_issues = [
    "fallen tree limbs dangling dangerously over visitor resting sheds",
    "medicinal plant section completely overgrown with wild shrubs",
    "lawns yellowed and dying due to broken automated watering system",
    "dead palm tree leaning towards children play area"
]

ground_issue = [
    "football goalpost rusted and netting completely shredded",
    "basketball hoop backboard shattered and rim bent downwards",
    "cricket practice net torn and synthetic turf peeling up",
    "spectator stands concrete steps crumbled and unsafe to sit"
]

gazebo_issue = [
    "roof shingles blown away and timber rafters rotting in the rain",
    "structural support pillar cracked and needs immediate bracing",
    "seating ledge broken and covered in bird droppings and debris",
    "central dome lantern fixture smashed and dangling by live wires"
]

import random
random.seed(42)

ps_records = []
for _ in range(1050):
    loc = random.choice(locations)
    t_idx = random.randint(0, 11)
    if t_idx == 0:
        text = f"The municipal park at {loc} has {random.choice(issues)}."
    elif t_idx == 1:
        text = f"Children playground in {loc} has {random.choice(playground_issues)}."
    elif t_idx == 2:
        text = f"Walking track and jogging path in {loc} {random.choice(path_issues)}."
    elif t_idx == 3:
        text = f"Public garden {loc} is completely neglected with {random.choice(garden_issues)}."
    elif t_idx == 4:
        text = f"Benches in {loc} are {random.choice(bench_issues)}."
    elif t_idx == 5:
        text = f"Open gymnasium equipment in {loc} is {random.choice(gym_issues)}."
    elif t_idx == 6:
        text = f"Fencing and boundary wall of {loc} {random.choice(fence_issues)}."
    elif t_idx == 7:
        text = f"Community hall and public library {loc} {random.choice(building_issues)}."
    elif t_idx == 8:
        text = f"Fountain in public square {loc} {random.choice(fountain_issues)}."
    elif t_idx == 9:
        text = f"Botanical garden {loc} has {random.choice(greenery_issues)}."
    elif t_idx == 10:
        text = f"The recreational grounds in {loc} have {random.choice(ground_issue)}."
    else:
        text = f"Public park gazebo in {loc} {random.choice(gazebo_issue)}."
    ps_records.append({'complaint_text': text, 'category': 'PUBLIC_SPACE'})

df_ps = pd.DataFrame(ps_records)

# 3. Add high-frequency citizen short phrases and real expressions across all 6 classes
short_expressions = [
    # ROAD
    ('Huge pothole on road', 'ROAD'),
    ('Potholes causing accidents on main road', 'ROAD'),
    ('Road is completely damaged with deep craters', 'ROAD'),
    ('Asphalt peeling off after rain on street', 'ROAD'),
    ('Dangerous speed breaker without warning signs', 'ROAD'),
    ('Footpath pavers broken and missing', 'ROAD'),
    ('Cave in on roadway near junction', 'ROAD'),
    ('Tar road washed away in heavy rain', 'ROAD'),
    ('Road divider damaged and broken concrete blocks', 'ROAD'),
    ('Uneven road surface making bike skid', 'ROAD'),
    ('Manhole cover sunken below road level', 'ROAD'),
    ('Gravel loose on road causing slips', 'ROAD'),
    ('Road construction left unfinished for months', 'ROAD'),
    ('Heavy vehicle damage to colony street', 'ROAD'),
    ('Muddy unpaved road impossible to walk on', 'ROAD'),
    ('Deep ditch on roadside needs asphalt patch', 'ROAD'),

    # WATER_SUPPLY
    ('No drinking water supply since two days', 'WATER_SUPPLY'),
    ('Water pipeline burst and clean water gushing on street', 'WATER_SUPPLY'),
    ('Low water pressure in municipal pipeline', 'WATER_SUPPLY'),
    ('Contaminated muddy water coming from tap', 'WATER_SUPPLY'),
    ('Drinking water has foul chemical smell', 'WATER_SUPPLY'),
    ('Main valve leakage flooding nearby houses', 'WATER_SUPPLY'),
    ('Erratic water supply timings without prior notice', 'WATER_SUPPLY'),
    ('Water meter broken and water leaking continuously', 'WATER_SUPPLY'),
    ('Colony borewell pump motor burnt out', 'WATER_SUPPLY'),
    ('Municipal tap leaking non stop in public area', 'WATER_SUPPLY'),
    ('Need water tanker urgently due to pipeline repair', 'WATER_SUPPLY'),
    ('Dirty brown tap water causing sickness', 'WATER_SUPPLY'),
    ('Underground drinking water pipe ruptured', 'WATER_SUPPLY'),

    # WASTE_MANAGEMENT
    ('Garbage dump not cleared for one week', 'WASTE_MANAGEMENT'),
    ('Overflowing dustbin on street corner stinking badly', 'WASTE_MANAGEMENT'),
    ('Trash scattered across public road by stray animals', 'WASTE_MANAGEMENT'),
    ('Dead dog carcass lying on sidewalk rotting', 'WASTE_MANAGEMENT'),
    ('Door to door garbage collection vehicle not coming', 'WASTE_MANAGEMENT'),
    ('Illegal garbage dumping by commercial restaurants', 'WASTE_MANAGEMENT'),
    ('Plastic waste burning emitting hazardous black smoke', 'WASTE_MANAGEMENT'),
    ('Foul stench from roadside garbage mound', 'WASTE_MANAGEMENT'),
    ('Sanitation worker not sweeping street leaves and trash', 'WASTE_MANAGEMENT'),
    ('Hospital bio waste dumped in open municipal bin', 'WASTE_MANAGEMENT'),
    ('Green waste and tree cuttings dumped on pavement', 'WASTE_MANAGEMENT'),
    ('Dead cow lying near bus stop urgent disposal needed', 'WASTE_MANAGEMENT'),

    # DRAINAGE
    ('Drainage choked and sewage overflowing on street', 'DRAINAGE'),
    ('Gutter overflowing with filthy black water', 'DRAINAGE'),
    ('Stormwater drain clogged with plastic silt and debris', 'DRAINAGE'),
    ('Severe waterlogging on road after mild rain', 'DRAINAGE'),
    ('Sewage backflow into residential toilets and bathrooms', 'DRAINAGE'),
    ('Open drain emitting intolerable gutter odor', 'DRAINAGE'),
    ('Manhole overflowing with human waste during monsoon', 'DRAINAGE'),
    ('Drainage slab broken pedestrian fell inside', 'DRAINAGE'),
    ('Stagnant sewage water breeding dengue mosquitoes', 'DRAINAGE'),
    ('Desilted drain mud dumped on road not cleared', 'DRAINAGE'),
    ('Culvert pipe blocked by debris causing road flooding', 'DRAINAGE'),
    ('Underground sewer line collapsed under pavement', 'DRAINAGE'),

    # STREET_LIGHT
    ('Street lights not working dark and unsafe at night', 'STREET_LIGHT'),
    ('Streetlight bulb fused on main colony road', 'STREET_LIGHT'),
    ('Electric light pole damaged and leaning dangerously', 'STREET_LIGHT'),
    ('Hanging live electric wires from streetlight pole', 'STREET_LIGHT'),
    ('Street lights blinking constantly causing disturbance', 'STREET_LIGHT'),
    ('Street lights remain on during daytime wasting power', 'STREET_LIGHT'),
    ('Entire street plunged into complete darkness at night', 'STREET_LIGHT'),
    ('LED street light fixture fallen onto the footpath', 'STREET_LIGHT'),
    ('No lighting near bus stand risk of chain snatching', 'STREET_LIGHT'),
    ('Lamppost timer dysfunctional lights turn on late night', 'STREET_LIGHT'),
    ('Dark alleyway needs new streetlight installation', 'STREET_LIGHT'),
    ('Underground electrical cable fault in street lighting', 'STREET_LIGHT'),

    # PUBLIC_SPACE
    ('Park benches vandalized and broken in municipal garden', 'PUBLIC_SPACE'),
    ('Children park swing set broken and unsafe for kids', 'PUBLIC_SPACE'),
    ('Jogging track tiles broken and uneven in town park', 'PUBLIC_SPACE'),
    ('Public garden fountain defunct and filled with green scum', 'PUBLIC_SPACE'),
    ('Open gym fitness equipment rusted and unserviceable', 'PUBLIC_SPACE'),
    ('Park boundary wall collapsed stray animals entering', 'PUBLIC_SPACE'),
    ('Community recreation hall roof leaking and doors broken', 'PUBLIC_SPACE'),
    ('Overgrown weeds and thorny bushes in children playground', 'PUBLIC_SPACE'),
    ('Public park gazebos tiles broken and structure collapsing', 'PUBLIC_SPACE'),
    ('Playground slide has sharp metal crack dangerous for toddlers', 'PUBLIC_SPACE'),
    ('Public library reading room fan and seating damaged', 'PUBLIC_SPACE'),
    ('Statue in public roundabout damaged and neglected', 'PUBLIC_SPACE'),
    ('Botanical garden flower beds destroyed by cattle', 'PUBLIC_SPACE'),
    ('Public park toilet doors broken and taps missing', 'PUBLIC_SPACE')
]

df_short = pd.DataFrame(short_expressions, columns=['complaint_text', 'category'])

# 4. Merge all sources
master_df = pd.concat([df_manual, df_ps, df_short], ignore_index=True)
master_df['complaint_text'] = master_df['complaint_text'].astype(str).str.strip()
master_df = master_df[master_df['complaint_text'] != '']
master_df = master_df.drop_duplicates(subset=['complaint_text'])
master_df = master_df[master_df['category'].isin(FINAL_CATEGORIES)]

master_path_out = os.path.join(BASE_DIR, "processed", "SGCS_AI_MASTER_DATASET.csv")
master_df.to_csv(master_path_out, index=False)

print("\nFinal Balanced Dataset Summary:")
print(f"Total Rows: {len(master_df)}")
print("Class Distribution:")
print(master_df['category'].value_counts())

# 5. Train Calibrated LinearSVC Classifier Pipeline
print("\nTraining Classifier...")
X = master_df['complaint_text'].values
y = master_df['category'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=42
)

vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    sublinear_tf=True,
    min_df=2,
    max_features=20000,
    lowercase=True,
    stop_words='english',
    strip_accents='unicode'
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

base_svm = LinearSVC(C=1.0, random_state=42, max_iter=2000)
calib_clf = CalibratedClassifierCV(estimator=base_svm, cv=3)
calib_clf.fit(X_train_vec, y_train)

y_pred = calib_clf.predict(X_test_vec)
acc = accuracy_score(y_test, y_pred)
macro_f1 = f1_score(y_test, y_pred, average='macro')

print(f"\nModel Performance:")
print(f"Accuracy : {acc * 100:.2f}%")
print(f"Macro F1 : {macro_f1 * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, labels=FINAL_CATEGORIES, digits=4))

# 6. Save Model Artifacts
print("\nSaving Production Model Artifacts...")
joblib.dump(calib_clf, os.path.join(MODELS_DIR, "classifier.joblib"))
joblib.dump(vectorizer, os.path.join(MODELS_DIR, "vectorizer.joblib"))

model_metadata = {
    "model_name": "Calibrated LinearSVC",
    "feature_type": "tfidf",
    "categories": FINAL_CATEGORIES,
    "accuracy": round(float(acc), 4),
    "macro_f1": round(float(macro_f1), 4),
    "total_training_samples": len(master_df)
}
with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
    json.dump(model_metadata, f, indent=4)

# Monolithic pipeline for backward compatibility
pipeline = Pipeline([
    ('vectorizer', vectorizer),
    ('classifier', calib_clf)
])
joblib.dump(pipeline, os.path.join(AI_SERVICE_DIR, "complaint_model.joblib"))

print("Successfully trained and saved high-performance AI classifier!")
