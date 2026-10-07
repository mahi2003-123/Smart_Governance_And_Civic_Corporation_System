import requests; print('API=', requests.post('http://localhost:8000/ai/classify-complaint', json={'description': 'deep pathole'}).json())
