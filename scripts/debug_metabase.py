import requests
import json

METABASE_URL = "http://localhost:3000"
SESSION_URL = f"{METABASE_URL}/api/session"
DASHBOARD_URL = f"{METABASE_URL}/api/dashboard"
COLLECTION_URL = f"{METABASE_URL}/api/collection"

ADMIN_EMAIL = "admin@university.edu"
ADMIN_PASSWORD = "StrongPassword123!"

def login():
    payload = {
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    try:
        response = requests.post(SESSION_URL, json=payload)
        response.raise_for_status()
        return response.json().get("id")
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def list_dashboards(session_id):
    headers = {"X-Metabase-Session": session_id}
    res = requests.get(DASHBOARD_URL, headers=headers)
    res.raise_for_status()
    dashboards = res.json()
    print(f"Found {len(dashboards)} dashboards:")
    for d in dashboards:
        print(f"- ID: {d['id']}, Name: '{d['name']}', Collection ID: {d.get('collection_id')}")

def list_collections(session_id):
    headers = {"X-Metabase-Session": session_id}
    res = requests.get(COLLECTION_URL, headers=headers)
    res.raise_for_status()
    collections = res.json()
    print(f"Found {len(collections)} collections:")
    for c in collections:
        print(f"- ID: {c['id']}, Name: '{c['name']}'")

if __name__ == "__main__":
    session_id = login()
    if session_id:
        list_collections(session_id)
        list_dashboards(session_id)
