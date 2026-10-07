# AI/ML Complaint Classification Service

This service automatically predicts the issue category of a municipal complaint based on its description text using Natural Language Processing (NLP). It also detects potential duplicate complaints.

## Dataset
- **Source / File Name**: `dataset/bmc_raw_complaints.csv`
- **Original Row Count**: 1250 (synthetic/mapped from dictionary)
- **Cleaned Row Count**: ~1190
- **Dataset Columns**: `complaint_id`, `complaint_date`, `ward_code`, `complaint_category`, `complaint_text`, `severity`, `status`
- **Category Mapping**:
  - `Pothole / Road Damage` -> `ROAD`
  - `Solid Waste / Garbage` -> `WASTE_MANAGEMENT`
  - `Street Light Failure` -> `STREET_LIGHT`
  - `Water Supply Disruption` -> `WATER_SUPPLY`
  - `Drainage / Flooding` -> `DRAINAGE`
  - `Park / Public Space` -> `PUBLIC_SPACE`
  - `Dead Animal` -> `IGNORE` (excluded)

## Training
- **Cleaning Steps**: Normalization, Stop word removal, Empty string removal, Duplicate string processing.
- **Train / Validation / Test Split**: 80% Train, 10% Validation, 10% Testing (stratified split before vectorizer to prevent leakage).
- **Algorithm**: `TF-IDF Vectorizer (n-grams 1-2)` + `Logistic Regression (class_weight='balanced')`.
- **Model File**: `models/complaint_classifier.joblib`

## Evaluation
- See `reports/classification_report.txt` for live metrics.
- Typically Accuracy > 90% and Macro F1 > 90%.

## FastAPI Endpoints
- **Health Check**: `GET /ai/health`
- **Classification**: `POST /ai/classify-complaint`
- **Duplicate Check**: `POST /ai/duplicate-check`

### Example Request (Classification)
```json
{
  "description": "There is a huge pothole near the college gate"
}
```
### Example Prediction
```json
{
  "category": "ROAD",
  "confidence": 0.94
}
```

## How to Run Service
1. Install dependencies: `pip install -r requirements.txt`
2. Run FastAPI: `uvicorn app:app --host 0.0.0.0 --port 8000`

## How to Train / Retrain
1. Ensure the raw dataset is placed at `../dataset/bmc_raw_complaints.csv`.
2. Run the script: `python training/train_complaint_classifier.py`
3. The model will be overwritten at `models/complaint_classifier.joblib` and metrics saved to `reports/`.

## Limitations
- The model is a baseline logistic regression based on civic data adapted to SGCS categories.
- Extreme misspellings may cause low confidence (fallback to human).
