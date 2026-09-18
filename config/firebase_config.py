import os

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore

load_dotenv()

_app = None


def get_db():
    global _app
    if _app is None:
        cred_path = os.environ["FIREBASE_CREDENTIALS_PATH"]
        cred = credentials.Certificate(cred_path)
        _app = firebase_admin.initialize_app(cred)
    return firestore.client()
