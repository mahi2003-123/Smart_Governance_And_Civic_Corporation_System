import requests
import json
import time

API_URL = "http://localhost:5000/api"
session = requests.Session()
uid = str(int(time.time()))
out = {}

# 1. Create a Citizen
citizen = {"fullName": "Test Citizen", "email": f"c_{uid}@t.com", "password": "Password@123", "role": "CITIZEN", "phone": "9800000000", "ward": "Ward 1 - Central"}
res = session.post(f"{API_URL}/auth/register", json=citizen)
c_tok = session.post(f"{API_URL}/auth/login", json={"email": citizen["email"], "password": "Password@123"}).json().get("token")
headers = {"Authorization": f"Bearer {c_tok}", "Content-Type": "application/json"}

# 2. Master Complaint
doc1 = {
    "title": "Broken Water Pipe Main Street",
    "category": "Other",
    "priority": "HIGH",
    "description": "Massive water leak near the grand central library. Main street is flooding.",
    "ward": "Ward 1 - Central",
    "locationAddress": "Grand Central Library, Main St"
}
res1 = session.post(f"{API_URL}/complaints", headers=headers, json=doc1)
m_id = res1.json().get("id")
out["master_status"] = res1.status_code

# 3. Duplicate Complaint (same ward, same location, same description)
doc2 = {
    "title": "Water Pipe burst",
    "category": "WATER_SUPPLY",
    "priority": "MEDIUM",
    "description": "There is a huge water leak at Grand Central. Road is completely flooded.",
    "ward": "Ward 1 - Central",
    "locationAddress": "Grand Centrl Library, Main Street" # Slight typo to test loc sim
}
res2 = session.post(f"{API_URL}/complaints", headers=headers, json=doc2)
out["dup1"] = res2.json().get("possibleDuplicateId")
out["dup1_sim"] = res2.json().get("duplicateSimilarityScore")

# 4. Same Ward, Missing Location (should NOT be duplicate)
doc3 = {
    "title": "Water Pipe burst somewhere",
    "category": "WATER_SUPPLY",
    "priority": "MEDIUM",
    "description": "Massive water leak near the grand central library. Main street is flooding.",
    "ward": "Ward 1 - Central",
    "locationAddress": "" 
}
res3 = session.post(f"{API_URL}/complaints", headers=headers, json=doc3)
out["dup2_missing_loc"] = res3.json().get("possibleDuplicateId")

# 5. Different Ward, Exact Same Details (should NOT be duplicate)
doc4 = dict(doc1)
doc4["ward"] = "Ward 2 - South"
res4 = session.post(f"{API_URL}/complaints", headers=headers, json=doc4)
out["dup3_diff_ward"] = res4.json().get("possibleDuplicateId")

# Save results
with open("test_dup_results.json", "w") as f:
    json.dump(out, f, indent=2)
print("Duplicate Test Complete")
