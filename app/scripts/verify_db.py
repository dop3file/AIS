from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.zone import BroadcastZone
from app.models.audio import AudioFile
from app.models.notification import Notification

def verify_data():
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        zone_count = db.query(BroadcastZone).count()
        audio_count = db.query(AudioFile).count()
        notification_count = db.query(Notification).count()
        
        print(f"Users: {user_count}")
        print(f"Zones: {zone_count}")
        print(f"Audio Files: {audio_count}")
        print(f"Notifications: {notification_count}")
        
        if user_count > 0:
            print("\nSample Users:")
            for user in db.query(User).limit(5).all():
                print(f"- {user.username} ({user.email})")
                
    except Exception as e:
        print(f"Error verifying data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_data()
