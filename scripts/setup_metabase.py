import requests
import time
import os

METABASE_URL = "http://localhost:3000"
SETUP_TOKEN_URL = f"{METABASE_URL}/api/session/properties"
SETUP_URL = f"{METABASE_URL}/api/setup"
SESSION_URL = f"{METABASE_URL}/api/session"
DATABASE_URL = f"{METABASE_URL}/api/database"
CARD_URL = f"{METABASE_URL}/api/card"
DASHBOARD_URL = f"{METABASE_URL}/api/dashboard"

ADMIN_EMAIL = "admin@university.edu"
ADMIN_PASSWORD = "StrongPassword123!"
ADMIN_NAME = "Admin User"

DB_DETAILS = {
    "engine": "postgres",
    "name": "AIS Database",
    "details": {
        "host": "db",
        "port": 5432,
        "dbname": "ais_db",
        "user": "postgres",
        "password": "postgres"
    }
}

def wait_for_metabase():
    print("Waiting for Metabase to be ready...")
    for i in range(60):
        try:
            response = requests.get(f"{METABASE_URL}/api/health")
            if response.status_code == 200:
                print("Metabase is ready!")
                return
        except requests.exceptions.ConnectionError:
            pass
        time.sleep(2)
    raise Exception("Metabase failed to start")

def get_setup_token():
    response = requests.get(SETUP_TOKEN_URL)
    response.raise_for_status()
    return response.json().get("setup-token")

def setup_metabase(token):
    payload = {
        "token": token,
        "user": {
            "first_name": "Admin",
            "last_name": "User",
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        },
        "prefs": {
            "site_name": "University Audio System Analytics",
            "allow_tracking": False,
            "site_locale": "ru"
        },
        "database": DB_DETAILS
    }
    response = requests.post(SETUP_URL, json=payload)
    if response.status_code == 403 or (response.status_code == 400 and "already set up" in response.text):
        print("Metabase already set up.")
        return None
    if not response.ok:
        print(f"Setup failed: {response.text}")
    response.raise_for_status()
    return response.json().get("id")

def login():
    payload = {
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(SESSION_URL, json=payload)
    response.raise_for_status()
    return response.json().get("id")

def create_dashboard(session_id, db_id):
    headers = {"X-Metabase-Session": session_id}
    
    # Create Dashboard
    dash_payload = {
        "name": "System Overview",
        "description": "Comprehensive system analytics",
        "parameters": []
    }
    dash_res = requests.post(DASHBOARD_URL, json=dash_payload, headers=headers)
    dash_res.raise_for_status()
    dashboard_id = dash_res.json().get("id")
    print(f"Created Dashboard: {dashboard_id}")

    meta_res = requests.get(f"{DATABASE_URL}/{db_id}/metadata", headers=headers)
    meta_res.raise_for_status()
    metadata = meta_res.json()
    tables = {t['name']: t['id'] for t in metadata['tables']}
    print(f"Found tables: {tables}")

    if 'broadcast_zones' in tables:
        create_card(headers, dashboard_id, "Total Zones", tables['broadcast_zones'], db_id, display="scalar", position=(0, 0, 4, 4))
    
    if 'audio_files' in tables:
        create_card(headers, dashboard_id, "Total Audio Files", tables['audio_files'], db_id, display="scalar", position=(0, 4, 4, 4))

    if 'notifications' in tables:
        create_card(headers, dashboard_id, "Total Notifications", tables['notifications'], db_id, display="scalar", position=(0, 8, 4, 4))

    if 'audio_files' in tables:
        create_card(headers, dashboard_id, "Audio Types", tables['audio_files'], db_id, 
                   display="pie", 
                   query={"source-table": tables['audio_files'], "aggregation": [["count"]], "breakout": [["field", get_field_id(metadata, 'audio_files', 'content_type'), None]]},
                   position=(4, 0, 6, 8))
        
        create_card(headers, dashboard_id, "Recent Audio Uploads", tables['audio_files'], db_id,
                   display="table",
                   query={"source-table": tables['audio_files'], "limit": 5, "order-by": [["desc", ["field", get_field_id(metadata, 'audio_files', 'id'), None]]]},
                   position=(12, 0, 6, 12))

    if 'notifications' in tables:
        create_card(headers, dashboard_id, "Notification Status", tables['notifications'], db_id,
                   display="bar",
                   query={"source-table": tables['notifications'], "aggregation": [["count"]], "breakout": [["field", get_field_id(metadata, 'notifications', 'status'), None]]},
                   position=(4, 8, 6, 8))
        
        create_card(headers, dashboard_id, "Recent Notifications", tables['notifications'], db_id,
                   display="table",
                   query={"source-table": tables['notifications'], "limit": 5, "order-by": [["desc", ["field", get_field_id(metadata, 'notifications', 'scheduled_time'), None]]]},
                   position=(12, 8, 6, 12))

def get_field_id(metadata, table_name, field_name):
    for t in metadata['tables']:
        if t['name'] == table_name:
            for f in t['fields']:
                if f['name'] == field_name:
                    return f['id']
    return None

def create_card(headers, dashboard_id, name, table_id, db_id, display="scalar", query=None, position=(0,0,4,4)):
    if query is None:
        query = {"source-table": table_id, "aggregation": [["count"]]}
        
    payload = {
        "name": name,
        "dataset_query": {
            "database": db_id,
            "type": "query",
            "query": query
        },
        "display": display,
        "visualization_settings": {}
    }
    res = requests.post(CARD_URL, json=payload, headers=headers)
    res.raise_for_status()
    card_id = res.json().get("id")
    
    # Add to dashboard
    dash_card_payload = {
        "cardId": card_id,
        "row": position[0],
        "col": position[1],
        "sizeX": position[3], # Width
        "sizeY": position[2]  # Height
    }
    requests.post(f"{DASHBOARD_URL}/{dashboard_id}/cards", json=dash_card_payload, headers=headers)
    print(f"Added card '{name}' to dashboard.")



if __name__ == "__main__":
    wait_for_metabase()
    
    try:
        token = get_setup_token()
        if token:
            print("Setting up Metabase...")
            setup_metabase(token)
        
        print("Logging in...")
        session_id = login()
        
        headers = {"X-Metabase-Session": session_id}
        res = requests.get(DATABASE_URL, headers=headers)
        res.raise_for_status()
        dbs = res.json()
        print(f"Databases found: {dbs}")
        
        if isinstance(dbs, dict) and 'data' in dbs:
             dbs = dbs['data']

        db_id = next((db['id'] for db in dbs if db['name'] == "AIS Database"), None)
        
        if db_id:
            print(f"Found Database ID: {db_id}")
        else:
            print("Database not found. Adding it now...")
            db_payload = DB_DETAILS
            res = requests.post(DATABASE_URL, json=db_payload, headers=headers)
            res.raise_for_status()
            db_id = res.json().get("id")
            print(f"Created Database ID: {db_id}")

        create_dashboard(session_id, db_id)
            
    except Exception as e:
        print(f"Error: {e}")
