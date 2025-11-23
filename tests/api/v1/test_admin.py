import pytest
from fastapi import status

def test_list_users_as_admin(client, admin_headers, test_user):
    response = client.get("/api/v1/admin/users", headers=admin_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert any(user["email"] == "test@example.com" for user in data)

def test_list_users_as_regular_user(client, auth_headers):
    response = client.get("/api/v1/admin/users", headers=auth_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_list_users_unauthorized(client):
    response = client.get("/api/v1/admin/users")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_update_user_role_as_admin(client, admin_headers, test_user):
    response = client.put(
        f"/api/v1/admin/users/{test_user.id}",
        json={"role": "admin"},
        headers=admin_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["role"] == "admin"

def test_update_user_role_as_regular_user(client, auth_headers, test_user):
    response = client.put(
        f"/api/v1/admin/users/{test_user.id}",
        json={"role": "admin"},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_update_user_status(client, admin_headers, test_user):
    response = client.put(
        f"/api/v1/admin/users/{test_user.id}",
        json={"is_active": False},
        headers=admin_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["is_active"] is False

def test_delete_user_as_admin(client, admin_headers, test_user):
    response = client.delete(f"/api/v1/admin/users/{test_user.id}", headers=admin_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["ok"] is True

def test_delete_self_as_admin(client, admin_headers, admin_user):
    response = client.delete(f"/api/v1/admin/users/{admin_user.id}", headers=admin_headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "cannot delete yourself" in response.json()["detail"].lower()

def test_delete_nonexistent_user(client, admin_headers):
    response = client.delete("/api/v1/admin/users/99999", headers=admin_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
