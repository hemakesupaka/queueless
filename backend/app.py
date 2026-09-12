from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import check_password_hash
import sqlite3

app = Flask(__name__)

# Secret key used for admin sessions
app.secret_key = "queueless-secret-key-change-later"

# Allow frontend to communicate with Flask
CORS(
    app,
    supports_credentials=True
)


def get_database_connection():

    connection = sqlite3.connect("queueless.db")

    connection.row_factory = sqlite3.Row

    return connection


# ========================================================
# HOME
# ========================================================

@app.route("/")
def home():

    return "QueueLess backend is running!"


# ========================================================
# ADMIN LOGIN
# ========================================================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Username and password are required."
        }), 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "error": "Username and password are required."
        }), 400

    connection = get_database_connection()

    admin = connection.execute(
        """
        SELECT *
        FROM admins
        WHERE username = ?
        """,
        (username,)
    ).fetchone()

    connection.close()

    if not admin:

        return jsonify({
            "error": "Invalid username or password."
        }), 401

    if not check_password_hash(
        admin["password"],
        password
    ):

        return jsonify({
            "error": "Invalid username or password."
        }), 401

    # Create admin session
    session["admin_id"] = admin["id"]
    session["admin_username"] = admin["username"]

    return jsonify({
        "message": "Admin login successful!",
        "username": admin["username"]
    })


# ========================================================
# CHECK ADMIN LOGIN
# ========================================================

@app.route("/api/admin/check", methods=["GET"])
def check_admin():

    if "admin_id" not in session:

        return jsonify({
            "logged_in": False
        }), 401

    return jsonify({
        "logged_in": True,
        "username": session["admin_username"]
    })


# ========================================================
# ADMIN LOGOUT
# ========================================================

@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():

    session.clear()

    return jsonify({
        "message": "Admin logged out successfully."
    })


# ========================================================
# ADMIN AUTHENTICATION CHECK
# ========================================================

def admin_required():

    return "admin_id" in session


# ========================================================
# GET QUEUE
# ========================================================

@app.route("/api/queue", methods=["GET"])
def get_queue():

    connection = get_database_connection()

    customers = connection.execute(
        """
        SELECT *
        FROM customers
        ORDER BY business, queue_number
        """
    ).fetchall()

    connection.close()

    return jsonify([
        dict(customer)
        for customer in customers
    ])


# ========================================================
# JOIN QUEUE
# ========================================================

@app.route("/api/queue", methods=["POST"])
def join_queue():

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "No data received."
        }), 400

    name = data.get("name")
    business = data.get("business")

    if not name:

        return jsonify({
            "error": "Customer name is required."
        }), 400

    if not business:

        return jsonify({
            "error": "Business is required."
        }), 400

    connection = get_database_connection()

    result = connection.execute(
        """
        SELECT MAX(queue_number) AS max_number
        FROM customers
        WHERE business = ?
        """,
        (business,)
    ).fetchone()

    if result["max_number"] is None:

        next_number = 1

    else:

        next_number = result["max_number"] + 1

    cursor = connection.execute(
        """
        INSERT INTO customers
        (name, business, queue_number, status)
        VALUES (?, ?, ?, ?)
        """,
        (
            name,
            business,
            next_number,
            "waiting"
        )
    )

    customer_id = cursor.lastrowid

    connection.commit()

    connection.close()

    return jsonify({

        "message": "Successfully joined the queue!",

        "id": customer_id,

        "name": name,

        "business": business,

        "queue_number": next_number,

        "queue_number_text":
            "A" + str(next_number).zfill(2),

        "status": "waiting"

    }), 201


# ========================================================
# LEAVE QUEUE
# ========================================================

@app.route(
    "/api/queue/<int:customer_id>/leave",
    methods=["POST"]
)
def leave_queue(customer_id):

    connection = get_database_connection()

    customer = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE id = ?
        """,
        (customer_id,)
    ).fetchone()

    if not customer:

        connection.close()

        return jsonify({
            "error": "Customer not found."
        }), 404

    connection.execute(
        """
        UPDATE customers
        SET status = ?
        WHERE id = ?
        """,
        (
            "left",
            customer_id
        )
    )

    connection.commit()

    connection.close()

    return jsonify({
        "message":
            "Customer left the queue successfully."
    })


# ========================================================
# CALL NEXT CUSTOMER
# ========================================================

@app.route(
    "/api/queue/next",
    methods=["POST"]
)
def call_next():

    # 🔐 ADMIN ONLY
    if not admin_required():

        return jsonify({
            "error":
                "Admin login required."
        }), 401

    data = request.get_json()

    if not data:

        return jsonify({
            "error":
                "Business is required."
        }), 400

    business = data.get("business")

    if not business:

        return jsonify({
            "error":
                "Business is required."
        }), 400

    connection = get_database_connection()

    current = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE status = ?
        AND business = ?
        ORDER BY queue_number
        LIMIT 1
        """,
        (
            "serving",
            business
        )
    ).fetchone()

    if current:

        connection.close()

        return jsonify({
            "error":
                "A customer is already being served for this business."
        }), 400

    next_customer = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE status = ?
        AND business = ?
        ORDER BY queue_number
        LIMIT 1
        """,
        (
            "waiting",
            business
        )
    ).fetchone()

    if not next_customer:

        connection.close()

        return jsonify({
            "error":
                f"No customers are waiting in {business}."
        }), 404

    connection.execute(
        """
        UPDATE customers
        SET status = ?
        WHERE id = ?
        """,
        (
            "serving",
            next_customer["id"]
        )
    )

    connection.commit()

    connection.close()

    return jsonify({

        "message":
            "Next customer called.",

        "id":
            next_customer["id"],

        "name":
            next_customer["name"],

        "business":
            next_customer["business"],

        "queue_number":
            next_customer["queue_number"],

        "queue_number_text":
            "A" +
            str(
                next_customer["queue_number"]
            ).zfill(2),

        "status":
            "serving"

    })


# ========================================================
# COMPLETE CUSTOMER
# ========================================================

@app.route(
    "/api/queue/<int:customer_id>/complete",
    methods=["POST"]
)
def complete_customer(customer_id):

    # 🔐 ADMIN ONLY
    if not admin_required():

        return jsonify({
            "error":
                "Admin login required."
        }), 401

    connection = get_database_connection()

    customer = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE id = ?
        """,
        (customer_id,)
    ).fetchone()

    if not customer:

        connection.close()

        return jsonify({
            "error":
                "Customer not found."
        }), 404

    connection.execute(
        """
        UPDATE customers
        SET status = ?
        WHERE id = ?
        """,
        (
            "completed",
            customer_id
        )
    )

    connection.commit()

    connection.close()

    return jsonify({

        "message":
            "Customer completed successfully.",

        "id":
            customer_id,

        "status":
            "completed"

    })


# ========================================================
# RUN SERVER
# ========================================================

if __name__ == "__main__":

    app.run(debug=True)
