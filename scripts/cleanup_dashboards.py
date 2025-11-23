import requests

METABASE_URL = "http://localhost:3000"
SESSION_URL = f"{METABASE_URL}/api/session"
DASHBOARD_URL = f"{METABASE_URL}/api/dashboard"

ADMIN_EMAIL = "admin@university.edu"
ADMIN_PASSWORD = "StrongPassword123!"

def login():
    payload = {
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(SESSION_URL, json=payload)
    response.raise_for_status()
    return response.json().get("id")

def cleanup_dashboards(session_id):
    headers = {"X-Metabase-Session": session_id}
    res = requests.get(DASHBOARD_URL, headers=headers)
    res.raise_for_status()
    dashboards = res.json()
    
    system_dashboards = [d for d in dashboards if d['name'] in ["System Overview", "Обзор системы"]]
    system_dashboards.sort(key=lambda x: x['id'], reverse=True)
    
    if not system_dashboards:
        print("No dashboards found to clean up.")
        return

    latest_dashboard = system_dashboards[0]
    print(f"Keeping latest dashboard: {latest_dashboard['name']} (ID: {latest_dashboard['id']})")
    
    for d in system_dashboards[1:]:
        print(f"Deleting duplicate dashboard: {d['name']} (ID: {d['id']})")
        requests.delete(f"{DASHBOARD_URL}/{d['id']}", headers=headers)

if __name__ == "__main__":
    try:
        session_id = login()
        cleanup_dashboards(session_id)
    except Exception as e:
        print(f"Error: {e}")
