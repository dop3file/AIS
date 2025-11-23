import pytest
from datetime import datetime, timedelta
from fastapi import status
from app.models.notification import Notification
from app.models.audio import AudioFile
from app.models.zone import BroadcastZone

@pytest.fixture
def test_audio(db_session):
    audio = AudioFile(
        filename="test.mp3",
        s3_key="test-key.mp3",
        duration=180,
        content_type="audio/mpeg"
    )
    db_session.add(audio)
    db_session.commit()
    db_session.refresh(audio)
    return audio

@pytest.fixture
def test_zone_for_notification(db_session):
    zone = BroadcastZone(
        name="Test Zone",
        description="Test",
        location="Building A"
    )
    db_session.add(zone)
    db_session.commit()
    db_session.refresh(zone)
    return zone

def test_create_notification(client, auth_headers, test_audio, test_zone_for_notification):
    scheduled_time = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    response = client.post(
        "/api/v1/notifications/",
        json={
            "message": "Test Notification",
            "scheduled_time": scheduled_time,
            "audio_file_id": test_audio.id,
            "zone_id": test_zone_for_notification.id
        },
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["message"] == "Test Notification"
    assert data["status"] == "pending"

def test_create_recurring_notification(client, auth_headers, test_audio, test_zone_for_notification):
    scheduled_time = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    end_date = (datetime.utcnow() + timedelta(days=30)).isoformat()
    
    response = client.post(
        "/api/v1/notifications/",
        json={
            "message": "Daily Notification",
            "scheduled_time": scheduled_time,
            "audio_file_id": test_audio.id,
            "zone_id": test_zone_for_notification.id,
            "is_recurring": True,
            "recurrence_pattern": "daily",
            "recurrence_end_date": end_date
        },
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["is_recurring"] is True
    assert data["recurrence_pattern"] == "daily"

def test_list_notifications(client, auth_headers, test_audio, test_zone_for_notification):
    # Create a notification first
    scheduled_time = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    client.post(
        "/api/v1/notifications/",
        json={
            "message": "Test",
            "scheduled_time": scheduled_time,
            "audio_file_id": test_audio.id,
            "zone_id": test_zone_for_notification.id
        },
        headers=auth_headers
    )
    
    response = client.get("/api/v1/notifications/", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0

def test_create_notification_unauthorized(client, test_audio, test_zone_for_notification):
    scheduled_time = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    response = client.post(
        "/api/v1/notifications/",
        json={
            "message": "Test",
            "scheduled_time": scheduled_time,
            "audio_file_id": test_audio.id,
            "zone_id": test_zone_for_notification.id
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
