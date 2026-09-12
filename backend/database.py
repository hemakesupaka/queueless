import sqlite3
from werkzeug.security import generate_password_hash


def create_database():

    connection = sqlite3.connect("queueless.db")

    cursor = connection.cursor()


    # ========================================================
    # CUSTOMERS TABLE
    # ========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            business TEXT NOT NULL,

            queue_number INTEGER NOT NULL,

            status TEXT NOT NULL,

            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    """)


    # ========================================================
    # ADMINS TABLE
    # ========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT UNIQUE NOT NULL,

            password TEXT NOT NULL

        )
    """)


    # ========================================================
    # CREATE DEFAULT ADMIN
    # ========================================================

    existing_admin = cursor.execute(
        """
        SELECT id
        FROM admins
        WHERE username = ?
        """,
        ("admin",)
    ).fetchone()


    if existing_admin is None:

        password_hash = generate_password_hash(
            "admin123"
        )

        cursor.execute(
            """
            INSERT INTO admins
            (username, password)
            VALUES (?, ?)
            """,
            (
                "admin",
                password_hash
            )
        )


    connection.commit()

    connection.close()


if __name__ == "__main__":

    create_database()

    print(
        "QueueLess database created successfully!"
    )
