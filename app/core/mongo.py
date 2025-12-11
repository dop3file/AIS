from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.read_preferences import ReadPreference
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        self.client = AsyncIOMotorClient(
            "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=rs0",
            read_preference=ReadPreference.SECONDARY_PREFERRED
        )
        self.db = self.client.ais_audit_db
        print("Connected to MongoDB Replica Set")

    def close(self):
        if self.client:
            self.client.close()
            print("Closed MongoDB connection")

mongo_db = MongoDB()

async def get_mongo_db():
    return mongo_db.db
