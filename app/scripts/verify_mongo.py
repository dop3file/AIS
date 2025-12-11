import asyncio
from app.core.mongo import mongo_db
from app.schemas.audit import AuditLog

async def verify_audit_logs():
    print("Connecting to MongoDB...")
    mongo_db.connect()
    db = mongo_db.db
    
    print("Verifying Audit Logs (Reading from Secondary Preferred)...")
    
    # Count documents
    count = await db.audit_logs.count_documents({})
    print(f"Total Audit Logs: {count}")
    
    if count > 0:
        print("\nSample Logs:")
        cursor = db.audit_logs.find().sort("timestamp", -1).limit(5)
        async for doc in cursor:
            # Convert _id to string for display if needed, but Pydantic handles it
            log = AuditLog(**doc)
            print(f"- [{log.timestamp}] {log.event_type} ({log.severity}): User {log.user_id}")
            
    mongo_db.close()

if __name__ == "__main__":
    asyncio.run(verify_audit_logs())
