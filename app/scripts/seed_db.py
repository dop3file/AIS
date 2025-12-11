import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.zone import BroadcastZone
from app.models.audio import AudioFile
from app.models.notification import Notification, NotificationStatus
from app.core.security import get_password_hash # Assuming this exists, otherwise I'll mock it or use a simple hash

fake = Faker()

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        print("Seeding database...")
        
        # 1. Create Users
        print("Creating users...")
        users = []
        
        # Admin
        if not db.query(User).filter((User.email == "admin@example.com") | (User.username == "admin")).first():
            admin = User(
                email="admin@example.com",
                username="admin",
                hashed_password="hashed_secret_password",
                role=UserRole.ADMIN,
                is_active=True
            )
            users.append(admin)
        
        # Regular Users
        for _ in range(10):
            profile = fake.simple_profile()
            # Check if email or username exists
            if not db.query(User).filter((User.email == profile['mail']) | (User.username == profile['username'])).first():
                user = User(
                    email=profile['mail'],
                    username=profile['username'],
                    hashed_password="hashed_secret_password",
                    role=UserRole.USER,
                    is_active=True
                )
                users.append(user)
        
        db.add_all(users)
        db.commit()
        
        # 2. Create Broadcast Zones
        print("Creating broadcast zones...")
        zones = []
        zone_names = ["Main Hall", "Cafeteria", "Parking Lot", "Library", "Gym", "Conference Room A", "Conference Room B", "Lobby"]
        
        for name in zone_names:
            if not db.query(BroadcastZone).filter(BroadcastZone.name == name).first():
                zone = BroadcastZone(
                    name=name,
                    description=fake.sentence(),
                    location=f"Building {random.choice(['A', 'B', 'C'])}"
                )
                zones.append(zone)
            
        db.add_all(zones)
        db.commit()
        
        # 3. Create Audio Files
        print("Creating audio files...")
        audio_files = []
        audio_types = [
            ("emergency_alarm.mp3", 15.5, "audio/mpeg"),
            ("morning_announcement.wav", 45.0, "audio/wav"),
            ("closing_time.mp3", 30.0, "audio/mpeg"),
            ("fire_drill.wav", 60.0, "audio/wav"),
            ("welcome_message.mp3", 20.0, "audio/mpeg"),
            ("lunch_break.mp3", 10.0, "audio/mpeg"),
            ("meeting_start.wav", 5.0, "audio/wav"),
            ("system_test.mp3", 2.0, "audio/mpeg")
        ]
        
        existing_keys = {a.s3_key for a in db.query(AudioFile).all()}
        
        for filename, duration, content_type in audio_types:
            # Generate a unique key
            s3_key = f"audio/{fake.uuid4()}/{filename}"
            if s3_key not in existing_keys:
                audio = AudioFile(
                    filename=filename,
                    s3_key=s3_key,
                    duration=duration,
                    content_type=content_type
                )
                audio_files.append(audio)
            
        db.add_all(audio_files)
        db.commit()
        
        # 4. Create Notifications
        print("Creating notifications...")
        notifications = []
        
        # Refresh lists to get IDs
        all_users = db.query(User).all()
        all_zones = db.query(BroadcastZone).all()
        all_audio = db.query(AudioFile).all()
        
        if all_users and all_zones and all_audio:
            for _ in range(20):
                status = random.choice(list(NotificationStatus))
                is_recurring = random.choice([True, False])
                
                scheduled_time = fake.date_time_between(start_date='-7d', end_date='+7d')
                
                recurrence_pattern = None
                recurrence_end_date = None
                if is_recurring:
                    recurrence_pattern = random.choice(["daily", "weekly", "monthly"])
                    recurrence_end_date = scheduled_time + timedelta(days=30)
                
                notification = Notification(
                    message=fake.sentence(),
                    scheduled_time=scheduled_time,
                    status=status,
                    is_recurring=is_recurring,
                    recurrence_pattern=recurrence_pattern,
                    recurrence_end_date=recurrence_end_date,
                    audio_file_id=random.choice(all_audio).id,
                    zone_id=random.choice(all_zones).id
                )
                notifications.append(notification)
                
            db.add_all(notifications)
            db.commit()
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_data()
