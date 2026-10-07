# SGCS AI Complaint Classification Report

## 1. Dataset Details
- **Dataset File**: `bmc_raw_complaints.csv`
- **Original Row Count**: 1250 (Synthetic mapping based on `bmc_data_dictionary.csv`)
- **Format**: CSV
- **Features Used**: `complaint_text`, `complaint_category`

## 2. Cleaning & Preprocessing
- Removed empty descriptions and handled missing records.
- Dropped duplicate text records to prevent information leakage between train/test splits.
- Normalized dataset lowering casing and regex filtering HTML tags / extra whitespace.
- **Cleaned Row Count**: ~544 unique realistic string templates (after exact deduplication).

## 3. Category Mapping
- Raw `Pothole / Road Damage` ➜ **ROAD**
- Raw `Solid Waste / Garbage` ➜ **WASTE_MANAGEMENT**
- Raw `Street Light Failure` ➜ **STREET_LIGHT**
- Raw `Water Supply Disruption` ➜ **WATER_SUPPLY**
- Raw `Drainage / Flooding` ➜ **DRAINAGE**
- Raw `Park / Public Space` ➜ **PUBLIC_SPACE**

## 4. Modeling & Training Process
- **Algorithm**: `TF-IDF Vectorizer (ngram 1-2)` + `Logistic Regression (C=1.0, max_iter=1000)`.
- **Class Balancing**: Used `class_weight='balanced'` in Logistic Regression.
- **Data Splitting**: Stratified splitting BEFORE tf-idf fitting to ensure zero data leakage.
    - Training Samples: 434
    - Validation Samples: 55
    - Test Samples: 55

## 5. Evaluation Metrics (Test Set)
- **Accuracy**: 1.000 (100.0%)
- **Macro F1**: 1.000
- **Weighted F1**: 1.000
*(Note: Metrics are perfect due to the synthesized pattern of the data. For real-world noisy data, expect ~85-92%)*

## 6. Confusion Matrix & Per-Class Performance
| Category | Precision | Recall | F1-Score |
|---|---|---|---|
| DRAINAGE | 1.00 | 1.00 | 1.00 |
| PUBLIC_SPACE | 1.00 | 1.00 | 1.00 |
| ROAD | 1.00 | 1.00 | 1.00 |
| STREET_LIGHT | 1.00 | 1.00 | 1.00 |
| WASTE_MANAGEMENT | 1.00 | 1.00 | 1.00 |
| WATER_SUPPLY | 1.00 | 1.00 | 1.00 |

## 7. Sample API / UI Integration Check
*Example Tests via Endpoint:*
- `"There is a large pothole near the college gate."` ➜ `ROAD (93% confidence)`
- `"Garbage has not been collected."` ➜ `WASTE_MANAGEMENT (94% confidence)`
- `"The street lamp near my house is not working."` ➜ `STREET_LIGHT (95% confidence)`

## 8. API Architecture
- **FastAPI Endpoints**: 
    - `POST /ai/classify-complaint`
    - `POST /ai/duplicate-check`
- Loads `complaint_classifier.joblib` once into memory at startup.

## 9. Frontend Integration
- Implemented `useDebounce(750ms)` in React (`SubmitComplaint.tsx`).
- React calls FastAPI `/ai/classify-complaint` silently while the citizen types.
- UI reveals a professional Assistant card when prediction confidence is >= 80%.
- AI automatically populates the dropdown category, but allows manual override by the citizen.
- `ComplaintService.java` automatically runs Duplicate verification alongside AI scoring via FastAPI.

## 10. Limitations & Future Work
- Hardcoded rules vs extreme abbreviations (e.g. "strt lgt no work").
- Expand vectorizer dataset for regional languages (Marathi, Hindi).
