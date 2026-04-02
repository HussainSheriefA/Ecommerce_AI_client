import requests

# Test the registration endpoint
url = "http://localhost:8000/api/auth/register/"
data = {
    "email": "test@example.com",
    "name": "Test User",
    "password": "testpass123",
    "password_confirm": "testpass123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
