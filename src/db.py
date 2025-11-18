import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("❌ Missing Mongo URI in .env")

client = MongoClient(MONGO_URI)
db = client["email_automation"]
emails_collection = db["emails"]

