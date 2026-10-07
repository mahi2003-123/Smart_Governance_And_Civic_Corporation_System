import joblib
model=joblib.load('complaint_model.joblib')
print('PREDICTION=', model.predict(['deep pathole']))
