from config.firebase_config import get_db


def main():
    db = get_db()
    print("Connected to Firebase:", db)


if __name__ == "__main__":
    main()
