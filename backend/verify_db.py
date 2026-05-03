#!/usr/bin/env python3
"""Verify MongoDB database contents."""
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load config from current directory
load_dotenv('.env', override=True)

uri = os.getenv('MONGODB_URI')
if not uri:
    print("ERROR: MONGODB_URI not set in .env")
    exit(1)

print(f"Connecting to: {uri.split('@')[0]}@...")
client = MongoClient(uri, serverSelectionTimeoutMS=5000)

try:
    # Verify connection
    client.admin.command('ping')
    print("✓ Connected to MongoDB Atlas\n")
    
    # Check stress_predictions database
    db_target = client['stress_predictions']
    count_target = db_target['predictions'].count_documents({})
    print(f"✓ stress_predictions.predictions: {count_target} documents")
    
    if count_target > 0:
        latest = db_target['predictions'].find_one(sort=[('created_at', -1)])
        stress = latest['prediction']['stress_level']
        print(f"  Latest: stress_level={stress}")
    
    print()
    
    # Check old database
    db_old = client['edu_monitor_ai']
    count_old = db_old['predictions'].count_documents({})
    print(f"  edu_monitor_ai.predictions: {count_old} documents (OLD)")
    
    print("\n" + "="*50)
    if count_target > 0 and count_old >= 3:
        print("✓ SUCCESS: New data is now in stress_predictions!")
        print("  (Old data remains in edu_monitor_ai)")
    elif count_target > count_old:
        print("✓ PROGRESS: More data in stress_predictions than old DB")
    else:
        print("⚠ WARNING: Data still going to edu_monitor_ai")
    
except Exception as e:
    print(f"✗ Error: {e}")
