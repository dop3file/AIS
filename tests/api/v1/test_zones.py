import pytest
from fastapi import status
from app.models.zone import BroadcastZone

@pytest.fixture
def test_zone(db_session):
    zone = BroadcastZone(
        name="Test Zone",
        description="Test Description",
        location="Test Building"
    )
    db_session.add(zone)
    db_session.commit()
    db_session.refresh(zone)
    return zone

def test_create_zone(client, auth_headers):
    response = client.post(
        "/api/v1/zones/",
        json={
            "name": "New Zone",
            "description": "New Description",
            "location": "New Building"
        },
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "New Zone"
    assert data["description"] == "New Description"
    assert "id" in data

def test_create_zone_unauthorized(client):
    response = client.post(
        "/api/v1/zones/",
        json={
            "name": "New Zone",
            "description": "New Description",
            "location": "New Building"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_list_zones(client, auth_headers, test_zone):
    response = client.get("/api/v1/zones/", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert data[0]["name"] == "Test Zone"

def test_get_zone(client, auth_headers, test_zone):
    response = client.get(f"/api/v1/zones/{test_zone.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_zone.id
    assert data["name"] == "Test Zone"

def test_get_nonexistent_zone(client, auth_headers):
    response = client.get("/api/v1/zones/99999", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_update_zone(client, auth_headers, test_zone):
    response = client.put(
        f"/api/v1/zones/{test_zone.id}",
        json={
            "name": "Updated Zone",
            "description": "Updated Description",
            "location": "Updated Building"
        },
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Zone"
    assert data["description"] == "Updated Description"

def test_delete_zone(client, auth_headers, test_zone):
    response = client.delete(f"/api/v1/zones/{test_zone.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    
    # Verify deletion
    response = client.get(f"/api/v1/zones/{test_zone.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
