
import sqlite3
import json
import os

from datetime import datetime, timezone

# --------------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_DIR = os.path.join(BASE_DIR, "database")
DATABASE_PATH = os.path.join(DATABASE_DIR, "crops.db")


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def get_connection():
    """Create and return a SQLite database connection."""

    os.makedirs(DATABASE_DIR, exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    return connection


def _create_history_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendation_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_data TEXT NOT NULL,
            recommended_crops TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)


# --------------------------------------------------
# DATABASE INITIALIZATION
# --------------------------------------------------

def initialize_database():
    """Create database tables if they do not exist."""

    connection = get_connection()
    cursor = connection.cursor()

    # Crop catalog table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop_name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = 'recommendation_history'
    """)
    history_table_exists = cursor.fetchone() is not None

    if history_table_exists:
        cursor.execute("PRAGMA table_info(recommendation_history)")
        history_columns = {
            row["name"] for row in cursor.fetchall()
        }

        if "input_data" not in history_columns:
            cursor.execute(
                "ALTER TABLE recommendation_history "
                "RENAME TO recommendation_history_legacy"
            )
            _create_history_table(cursor)

            cursor.execute(
                "SELECT * FROM recommendation_history_legacy"
            )
            legacy_records = cursor.fetchall()

            for record in legacy_records:
                legacy_input = {
                    "N": record["nitrogen"],
                    "P": record["phosphorus"],
                    "K": record["potassium"],
                    "temperature": record["temperature"],
                    "humidity": record["humidity"],
                    "ph": record["ph"],
                    "rainfall": record["rainfall"]
                }
                cursor.execute("""
                    INSERT INTO recommendation_history (
                        id, input_data, recommended_crops, created_at
                    )
                    VALUES (?, ?, ?, ?)
                """, (
                    record["id"],
                    json.dumps(legacy_input),
                    record["recommended_crops"],
                    record["created_at"]
                ))

            cursor.execute(
                "DROP TABLE recommendation_history_legacy"
            )
    else:
        _create_history_table(cursor)

    connection.commit()
    connection.close()

    print("Database initialized successfully.")


def sync_crop_catalog(crop_names):
    """Keep the crop catalog aligned with the current dataset labels."""

    cleaned_names = sorted({
        str(name).strip()
        for name in crop_names
        if str(name).strip()
    })

    if not cleaned_names:
        return

    connection = get_connection()
    cursor = connection.cursor()

    placeholders = ", ".join("?" for _ in cleaned_names)
    cursor.execute(
        f"DELETE FROM crops WHERE crop_name NOT IN ({placeholders})",
        cleaned_names
    )

    cursor.executemany(
        "INSERT OR IGNORE INTO crops (crop_name) VALUES (?)",
        [(name,) for name in cleaned_names]
    )

    connection.commit()
    connection.close()


# --------------------------------------------------
# SAVE RECOMMENDATION HISTORY
# --------------------------------------------------

def save_recommendation(input_data, recommendations):
    """Save user input and predicted crops into SQLite."""

    connection = get_connection()
    cursor = connection.cursor()

    timestamp = datetime.now(
        timezone.utc
    ).isoformat()

    recommendations_json = json.dumps(
        recommendations
    )

    cursor.execute("""
        INSERT INTO recommendation_history (
            input_data,
            recommended_crops,
            created_at
        )
        VALUES (?, ?, ?)
    """, (
        json.dumps(input_data),
        recommendations_json,
        timestamp
    ))

    record_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return record_id


# --------------------------------------------------
# GET ALL RECOMMENDATION HISTORY
# --------------------------------------------------

def get_all_history(limit=100):
    """Retrieve recommendation history."""

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM recommendation_history
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    records = cursor.fetchall()
    connection.close()

    history = []

    for record in records:
        item = dict(record)

        # Convert stored JSON into Python objects
        item["recommended_crops"] = json.loads(
            item["recommended_crops"]
        )
        item["input_data"] = json.loads(
            item["input_data"]
        )

        history.append(item)

    return history


# --------------------------------------------------
# GET HISTORY BY ID
# --------------------------------------------------

def get_history_by_id(record_id):
    """Retrieve a specific recommendation record."""

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM recommendation_history
        WHERE id = ?
    """, (record_id,))

    record = cursor.fetchone()
    connection.close()

    if record is None:
        return None

    item = dict(record)

    item["recommended_crops"] = json.loads(
        item["recommended_crops"]
    )
    item["input_data"] = json.loads(
        item["input_data"]
    )

    return item


# --------------------------------------------------
# DELETE ONE HISTORY RECORD
# --------------------------------------------------

def delete_history(record_id):
    """Delete a recommendation history record."""

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM recommendation_history
        WHERE id = ?
    """, (record_id,))

    deleted = cursor.rowcount > 0

    connection.commit()
    connection.close()

    return deleted


# --------------------------------------------------
# CLEAR ALL HISTORY
# --------------------------------------------------

def clear_history():
    """Delete all recommendation history."""

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM recommendation_history
    """)

    connection.commit()
    connection.close()


# --------------------------------------------------
# GET DATABASE STATISTICS
# --------------------------------------------------

def get_database_stats():
    """Return basic database statistics."""

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM recommendation_history
    """)

    history_count = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM crops
    """)

    crop_count = cursor.fetchone()["total"]

    connection.close()

    return {
        "total_recommendations": history_count,
        "total_crops": crop_count
    }


# --------------------------------------------------
# TEST / INITIALIZE
# --------------------------------------------------

if __name__ == "__main__":
    initialize_database()

    print("Database location:")
    print(DATABASE_PATH)

    print("\nDatabase statistics:")
    print(get_database_stats())
