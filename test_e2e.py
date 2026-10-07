import requests
import json
import time

API_URL = "http://localhost:5000/api"

print("--- SGCS E2E Automation Test ---")
session = requests.Session()

import time
uid = str(int(time.time()))

# 1. Create a Citizen
citizen = {"fullName": "Test Citizen", "email": f"citizen_{uid}@test.com", "password": "Password@123", "role": "CITIZEN", "phone": "9876543210", "ward": "Ward 1 - Central"}
res = session.post(f"{API_URL}/auth/register", json=citizen)
print("Register Citizen:", res.status_code, res.text)

# Login Citizen
res = session.post(f"{API_URL}/auth/login", json={"email": f"citizen_{uid}@test.com", "password": "Password@123"})
print("Login Citizen:", res.status_code, res.text)
citizen_token = res.json().get("token")
print("Citizen Auth:", "Success" if citizen_token else "Failed")

# 2. Submit a Complaint
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
print("Submit Complaint:", res.status_code, res.text)
try:
    complaint_body = res.json()
    complaint_id = complaint_body.get("id")
    print("Complaint Created:", complaint_id)
    print("AI Suggested Category:", complaint_body.get("aiSuggestedCategory"))
    print("AI Confidence:", complaint_body.get("aiConfidence"))
    print("AI Model:", complaint_body.get("aiModel"))
    print("AI Status:", complaint_body.get("aiStatus"))
except Exception as e:
    print("Failed to decode complaint:", res.text)
    complaint_id = None

# Create a Councillor in Ward 1 - Central 
councillor = {"fullName": "Jane Councillor", "email": f"councillor_{uid}@test.com", "password": "Password@123", "role": "COUNCILLOR", "phone": "9876543211", "ward": f"Ward Test {uid}"}
res = session.post(f"{API_URL}/auth/register", json=councillor)
print("Register Councillor:", res.status_code, res.text)

# Create a Worker in Ward 1 - Central
worker = {"fullName": "Bob Worker", "email": f"worker_{uid}@test.com", "password": "Password@123", "role": "WORKER", "phone": "9876543212", "ward": f"Ward Test {uid}", "specialization": "ROAD"}
res = session.post(f"{API_URL}/auth/register", json=worker)
print("Register Worker:", res.status_code, res.text)
try:
    worker_id = res.json().get("id")
    print("Worker ID:", worker_id)
except:
    worker_id = None

# 3. Councillor reviews AI Category
res = session.post(f"{API_URL}/auth/login", json={"email": f"councillor_{uid}@test.com", "password": "Password@123"})
c_token = res.json().get("token")
c_headers = {"Authorization": f"Bearer {c_token}", "Content-Type": "application/json"}

# Confirm category
if complaint_id:
    res = session.post(f"{API_URL}/complaints/{complaint_id}/ai-category", headers=c_headers, json={"category": "ROAD"})
    print("Councillor AI Confirm:", res.status_code, res.text)

# 4. Councillor Assigns worker
if complaint_id and worker_id:
    assign_payload = {
        "workerId": worker_id,
        "workerName": "Bob Worker",
        "priority": "HIGH",
        "dueDate": "2030-01-01"
    }
    res = session.post(f"{API_URL}/complaints/{complaint_id}/assign", headers=c_headers, json=assign_payload)
    print("Assign Worker:", res.status_code, res.text)

# 5. Worker Starts & Completes Task
res = session.post(f"{API_URL}/auth/login", json={"email": f"worker_{uid}@test.com", "password": "Password@123"})
w_token = res.json().get("token")
w_headers = {"Authorization": f"Bearer {w_token}", "Content-Type": "application/json"}

if complaint_id:
    res = session.post(f"{API_URL}/complaints/{complaint_id}/start", headers=w_headers)
    print("Worker Start Task:", res.status_code, res.text)
    
    comp_payload = {
        "notes": "Fixed the pothole",
        "afterImage": "data:image/png;base64,xxxxx",
    }
    res = session.post(f"{API_URL}/complaints/{complaint_id}/complete", headers=w_headers, json=comp_payload)
    print("Worker Complete Task:", res.status_code, res.text)

# 6. Councillor Approves Task
if complaint_id:
    res = session.post(f"{API_URL}/complaints/{complaint_id}/approve", headers=c_headers)
    print("Councillor Approve Task:", res.status_code, res.text)

# Get Final Complaint Details
if complaint_id:
    res = session.get(f"{API_URL}/complaints/{complaint_id}", headers=headers)
    final_data = res.json()
    print("---- Final Complaint State ----")
    print("Status:", final_data.get("status"))
    print("Category:", final_data.get("category"))
    print("Assigned to:", final_data.get("assignedWorkerName"))

print("E2E Test Complete.")
