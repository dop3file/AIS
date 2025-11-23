import sys
sys.path.append('/app')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin_user():
    db = SessionLocal()
    
    admin = db.query(User).filter(User.email == "admin@university.edu").first()
    if admin:
        print("Admin user already exists!")
        return
    
    admin = User(
        email="admin@university.edu",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True
    )
    
    db.add(admin)
    db.commit()
    print("Admin user created successfully!")
    print("Email: admin@university.edu")
    print("Password: admin123")

if __name__ == "__main__":
    create_admin_user()
