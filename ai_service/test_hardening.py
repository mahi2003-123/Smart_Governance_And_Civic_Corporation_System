import os
import unittest

# Configure test environment
TEST_KEY = "test-internal-secret-key-12345"
os.environ["AI_INTERNAL_KEY"] = TEST_KEY

from fastapi.testclient import TestClient
from app import app

class TestAiHardening(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_health_public_and_status_only(self):
        """Requirement 1: /health must be public and return only status"""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data, {"status": "UP"})
        self.assertNotIn("model_loaded", data)

    def test_predict_requires_key(self):
        """Requirement 1: /predict requires X-Internal-Key"""
        # Without header
        res_no_key = self.client.post("/predict", json={"complaint_text": "Pothole on main road"})
        self.assertEqual(res_no_key.status_code, 401)

        # With wrong header
        res_wrong_key = self.client.post(
            "/predict",
            headers={"X-Internal-Key": "wrong-secret-key"},
            json={"complaint_text": "Pothole on main road"}
        )
        self.assertEqual(res_wrong_key.status_code, 401)

    def test_classify_endpoints_require_key(self):
        """Requirement 1: /classify and /ai/classify-complaint require X-Internal-Key"""
        for endpoint in ["/classify", "/ai/classify-complaint"]:
            res_no_key = self.client.post(endpoint, json={"complaint_text": "Streetlight broken"})
            self.assertEqual(res_no_key.status_code, 401)

            res_wrong_key = self.client.post(
                endpoint,
                headers={"X-Internal-Key": "bad-key"},
                json={"complaint_text": "Streetlight broken"}
            )
            self.assertEqual(res_wrong_key.status_code, 401)

    def test_duplicate_check_requires_key(self):
        """Requirement 1: /duplicate-check and /ai/duplicate-check require X-Internal-Key"""
        for endpoint in ["/duplicate-check", "/ai/duplicate-check"]:
            payload = {
                "new_complaint": "Water leakage in pipe",
                "existing_complaints": []
            }
            res_no_key = self.client.post(endpoint, json=payload)
            self.assertEqual(res_no_key.status_code, 401)

            res_wrong_key = self.client.post(
                endpoint,
                headers={"X-Internal-Key": "bad-key"},
                json=payload
            )
            self.assertEqual(res_wrong_key.status_code, 401)

    def test_duplicate_check_works_with_valid_key(self):
        """Requirement 1: Duplicate check succeeds with valid internal key"""
        payload = {
            "new_complaint": "Water pipeline leakage near town hall",
            "new_ward": "Ward 1",
            "new_location": "Town Hall",
            "new_category": "WATER_SUPPLY",
            "existing_complaints": [
                {
                    "id": "cmp-101",
                    "text": "Water pipeline broken near town hall leaking continuously",
                    "ward": "Ward 1",
                    "location": "Town Hall",
                    "category": "WATER_SUPPLY",
                    "status": "PENDING"
                }
            ]
        }
        response = self.client.post(
            "/duplicate-check",
            headers={"X-Internal-Key": TEST_KEY},
            json=payload
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("possible_duplicate_id", data)
        self.assertEqual(data["possible_duplicate_id"], "cmp-101")
        self.assertGreater(data["similarity"], 0.4)

    def test_oversized_complaint_text_rejected(self):
        """Requirement 1: Complaint text > 2000 chars gets 413 or 422"""
        huge_text = "A" * 2005
        response = self.client.post(
            "/predict",
            headers={"X-Internal-Key": TEST_KEY},
            json={"complaint_text": huge_text}
        )
        self.assertIn(response.status_code, (413, 422))

    def test_oversized_existing_complaints_list_rejected(self):
        """Requirement 1: existing_complaints > 500 items gets 413 or 422"""
        oversized_list = [{"id": f"c_{i}", "text": "leak"} for i in range(505)]
        response = self.client.post(
            "/duplicate-check",
            headers={"X-Internal-Key": TEST_KEY},
            json={
                "new_complaint": "Water leakage",
                "existing_complaints": oversized_list
            }
        )
        self.assertIn(response.status_code, (413, 422))

    def test_oversized_item_text_in_duplicate_check_rejected(self):
        """Requirement 1: text per item > 2000 chars gets 413 or 422"""
        huge_item_text = "B" * 2010
        response = self.client.post(
            "/duplicate-check",
            headers={"X-Internal-Key": TEST_KEY},
            json={
                "new_complaint": "Valid short text",
                "existing_complaints": [{"id": "c_1", "text": huge_item_text}]
            }
        )
        self.assertIn(response.status_code, (413, 422))

    def test_no_cors_headers_returned(self):
        """Requirement 1: Replace CORS * with no CORS middleware at all"""
        response = self.client.options(
            "/health",
            headers={
                "Origin": "https://malicious-website.com",
                "Access-Control-Request-Method": "GET"
            }
        )
        self.assertNotIn("access-control-allow-origin", response.headers)

if __name__ == "__main__":
    unittest.main()
