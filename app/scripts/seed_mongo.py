import asyncio
import random
from datetime import datetime, timedelta
from app.core.mongo import mongo_db
from app.schemas.audit import AuditLog

async def seed_audit_logs():
    print("Connecting to MongoDB...")
    mongo_db.connect()
    db = mongo_db.db
    
    print("Seeding Audit Logs...")
    logs = []
    event_types = ["user_login", "file_upload", "notification_created", "zone_updated", "system_alert"]
    severities = ["info", "warning", "error", "critical"]
    
    for _ in range(50):
        log = AuditLog(
            event_type=random.choice(event_types),
            timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 10000)),
            user_id=random.randint(1, 10),
            details={
                "ip": f"192.168.1.{random.randint(1, 255)}",
                "browser": random.choice(["Chrome", "Firefox", "Safari"]),
                "action_taken": "none"
            },
            severity=random.choice(severities)
        )
        logs.append(log.model_dump(by_alias=True))
    
    if logs:
        # Use the collection name 'audit_logs' (implied by convention or we can define it)
        # Let's assume 'audit_logs'
        result = await db.audit_logs.insert_many(logs)
        print(f"Inserted {len(result.inserted_ids)} audit logs.")
    
    mongo_db.close()

if __name__ == "__main__":
    asyncio.run(seed_audit_logs())
