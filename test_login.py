import requests
import json

# Test the login endpoint
url = "http://localhost:8000/api/auth/login/"

# First, let's test with a known user
test_credentials = {
    "email": "test@example.com",
    "password": "testpass123"
}

print("Testing login endpoint...")
print(f"URL: {url}")
print(f"Credentials: {test_credentials}")
print("-" * 50)

try:
    # Test OPTIONS request (CORS preflight)
    print("\n1. Testing OPTIONS request (CORS preflight):")
    options_response = requests.options(url, headers={
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST'
    })
    print(f"Status Code: {options_response.status_code}")
    print(f"Headers: {dict(options_response.headers)}")
    print("-" * 50)
    
    # Test POST request
    print("\n2. Testing POST request:")
    post_response = requests.post(url, json=test_credentials)
    print(f"Status Code: {post_response.status_code}")
    print(f"Response: {json.dumps(post_response.json(), indent=2)}")
    print(f"Headers: {dict(post_response.headers)}")
    
except requests.exceptions.ConnectionError as e:
    print(f"\n❌ Connection Error: {e}")
    print("Make sure Django server is running on http://localhost:8000")
except Exception as e:
    print(f"\n❌ Error: {e}")
