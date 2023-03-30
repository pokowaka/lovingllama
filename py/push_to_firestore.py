import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import json


# Application Default credentials are automatically created.
cred = credentials.Certificate('../firebase-admin.json')
app = firebase_admin.initialize_app(cred)
db = firestore.client()

seed_tasks = [json.loads(l) for l in open('seed_metta.jsonl', "r")]
seed_instruction_data = [
        {
            "question": t["instruction"].strip(),
            "answer": t["instances"][0]["output"].strip(),
            "context": "",
            "generated_by": None,
            "votes": 0,
            "users": [],
        }
        for t in seed_tasks
    ]

for entry in seed_instruction_data:
    # print(entry)
    update_time, city_ref = db.collection(u'entries').add(entry)
    print(f'Added document with id {city_ref.id}')
    
