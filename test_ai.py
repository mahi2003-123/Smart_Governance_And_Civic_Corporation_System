import joblib

model = joblib.load('ai_service/models/complaint_classifier.joblib')
txt = 'cleann the pond waste'
pred = model.predict([txt])[0]
with open('ai_out.txt', 'w') as f:
    f.write(f"Prediction: {pred}\n")
    for c, p in zip(model.classes_, model.predict_proba([txt])[0]):
        f.write(f"{c}: {p}\n")
