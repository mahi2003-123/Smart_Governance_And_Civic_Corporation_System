import requests
import json
import subprocess
import time

BASE_URL = "http://127.0.0.1:8005"

test_cases = [
    {"text": "There is a large pothole near the college entrance.", "expected": "ROAD"},
    {"text": "Water is leaking continuously from the pipeline near the junction.", "expected": "WATER_SUPPLY"},
    {"text": "Garbage has not been collected from our street for several days.", "expected": "WASTE_MANAGEMENT"},
    {"text": "The drainage channel is blocked and overflowing during rain.", "expected": "DRAINAGE"},
    {"text": "The street light near the bus stop is not working.", "expected": "STREET_LIGHT"},
    {"text": "The benches in the public park are broken and need repair.", "expected": "PUBLIC_SPACE"}
]

print("Testing /health ...")
try:
    health_resp = requests.get(f"{BASE_URL}/health", timeout=5)
    print(health_resp.json())
except Exception as e:
    print("Health check failed:", e)

print("\nTesting /predict with empty text ...")
try:
    empty_resp = requests.post(f"{BASE_URL}/predict", json={"complaint_text": "   "})
    print("Status code:", empty_resp.status_code)
    print("Response:", empty_resp.json())
except Exception as e:
    print("Empty text test failed:", e)


print("\nTesting the 6 exact categories and comparing with predict.py ...")

all_matched = True

for case in test_cases:
    text = case["text"]
    expected = case["expected"]
    
    # 1. Ask FastAPI
    api_resp = requests.post(f"{BASE_URL}/predict", json={"complaint_text": text}).json()
    
    # 2. Ask predict.py
    cmd = ["python", "predict.py", text]
    cli_result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        cli_resp = json.loads(cli_result.stdout)
    except json.JSONDecodeError:
        print("Error parsing CLI output:", cli_result.stdout)
        all_matched = False
        continue

    print(f"\n[Test Case: {expected}]")
    print("Complaint:", text)
    print("API Response:", api_resp)
    print("CLI Response:", cli_resp)
    
    if api_resp.get("category") == cli_resp.get("category"):
        print("-> Category match: PASS")
    else:
        print("-> Category match: FAIL")
        all_matched = False

    confidence_diff = abs(api_resp.get("confidence", 0) - cli_resp.get("confidence", 0))
    if confidence_diff < 0.001:
        print("-> Confidence match: PASS")
    else:
        print("-> Confidence match: FAIL")
        all_matched = False

print("\nFinal verdict on API vs CLI match:", "YES" if all_matched else "NO")
