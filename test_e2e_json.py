import requests
import json
import time

API_URL = "http://localhost:5000/api"
session = requests.Session()
uid = str(int(time.time()))
out = {}

citizen = {"fullName": "Test Citizen", "email": f"citizen_{uid}@test.com", "password": "Password@123", "role": "CITIZEN", "phone": "9876543210", "ward": "Ward 1 - Central"}
res = session.post(f"{API_URL}/auth/register", json=citizen)
out['register_citizen'] = res.status_code

res = session.post(f"{API_URL}/auth/login", json={"email": f"citizen_{uid}@test.com", "password": "Password@123"})
citizen_token = res.json().get("token")
out['citizen_token'] = citizen_token is not None

headers = {"Authorization": f"Bearer {citizen_token}", "Content-Type": "application/json"}
complaint_payload = {
    "title": "Massive pothole test",
    "category": "Other",
    "priority": "MEDIUM",
    "description": "There is a very large pothole near the college that needs to be fixed immediately.",
    "ward": "Ward 1 - Central",
    "locationAddress": "College Gate"
}
res = session.post(f"{API_URL}/complaints", headers=headers, json=complaint_payload)
out['submit_complaint_status'] = res.status_code
try:
    complaint_body = res.json()
    complaint_id = complaint_body.get("id")
    out['complaint_id'] = complaint_id
    out['ai_sug'] = complaint_body.get("aiSuggestedCategory")
    out['ai_conf'] = complaint_body.get("aiConfidence")
    out['ai_mod'] = complaint_body.get("aiModel")
    out['ai_stat'] = complaint_body.get("aiStatus")
except Exception as e:
    complaint_id = None
    out['complaint_err'] = res.text

councillor = {"fullName": "Jane Councillor", "email": f"councillor_{uid}@test.com", "password": "Password@123", "role": "COUNCILLOR", "phone": "9876543211", "ward": f"Ward Test {uid}"}
res = session.post(f"{API_URL}/auth/register", json=councillor)
out['register_councillor'] = res.status_code

worker = {"fullName": "Bob Worker", "email": f"worker_{uid}@test.com", "password": "Password@123", "role": "WORKER", "phone": "9876543212", "ward": f"Ward Test {uid}", "specialization": "ROAD"}
res = session.post(f"{API_URL}/auth/register", json=worker)
out['register_worker'] = res.status_code
worker_id = res.json().get("id")

res = session.post(f"{API_URL}/auth/login", json={"email": f"councillor_{uid}@test.com", "password": "Password@123"})
c_token = res.json().get("token")
c_headers = {"Authorization": f"Bearer {c_token}", "Content-Type": "application/json"}

if complaint_id:
    res = session.post(f"{API_URL}/complaints/{complaint_id}/ai-category", headers=c_headers, json={"category": "ROAD"})
    out['ai_confirm'] = res.status_code

if complaint_id and worker_id:
    assign_payload = {"workerId": worker_id, "workerName": "Bob Worker", "priority": "HIGH", "dueDate": "2030-01-01T18:00:00"}
    res = session.post(f"{API_URL}/complaints/{complaint_id}/assign", headers=c_headers, json=assign_payload)
    out['assign'] = res.status_code

res = session.post(f"{API_URL}/auth/login", json={"email": f"worker_{uid}@test.com", "password": "Password@123"})
w_token = res.json().get("token")
w_headers = {"Authorization": f"Bearer {w_token}", "Content-Type": "application/json"}

if complaint_id:
    res = session.post(f"{API_URL}/complaints/{complaint_id}/start", headers=w_headers)
    out['task_start'] = res.status_code
    
    comp_payload = {"notes": "Fixed the pothole", "afterImage": "data:image/png;base64,xxxxx"}
    res = session.post(f"{API_URL}/complaints/{complaint_id}/complete", headers=w_headers, json=comp_payload)
    out['task_complete'] = res.status_code

if complaint_id:
    res = session.post(f"{API_URL}/complaints/{complaint_id}/approve", headers=c_headers)
    out['approve'] = res.status_code

    res = session.get(f"{API_URL}/complaints/{complaint_id}", headers=headers)
    final_data = res.json()
    out['final_status'] = final_data.get("status")
    out['final_cat'] = final_data.get("category")
    out['final_worker'] = final_data.get("assignedWorkerName")

with open("test_e2e_results.json", "w") as f:
    json.dump(out, f, indent=2)
print("done")
