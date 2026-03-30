from flask import Flask, jsonify, request
from importlib import import_module
from typing import Any, Callable, cast

from dotenv import load_dotenv
import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime

load_dotenv()

app = Flask(__name__)
cast(Any, app.json).sort_keys = False
cors_setup: Callable[[Flask], None] | None = None
try:
    cors_setup = cast(Callable[[Flask], None], import_module("flask_cors").CORS)
except ModuleNotFoundError:
    cors_setup = None

if cors_setup is not None:
    cors_setup(app)
else:
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        return response

API_KEY = os.getenv("API_KEY")
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "clearcareers.db"
DATASET_PATH = BASE_DIR.parent / "src" / "data" / "clearcareers_data.json"

PASSION_TO_CLUSTER = {
    "Building Technology": "Cluster 1",
    "Helping People": "Cluster 2",
    "Creating Art/Media": "Cluster 3",
    "Running a Business": "Cluster 4",
    "Environment": "Cluster 5",
    "Law & Society": "Cluster 6",
}


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS careers (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                cluster TEXT,
                demand_level TEXT,
                entry_salary TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS onboarding_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                grade TEXT NOT NULL,
                subjects TEXT NOT NULL,
                superpowers TEXT NOT NULL,
                passions TEXT NOT NULL,
                profile_summary TEXT NOT NULL,
                suggested_careers TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )

        count = conn.execute("SELECT COUNT(*) AS count FROM careers").fetchone()["count"]
        if count == 0 and DATASET_PATH.exists():
            with DATASET_PATH.open("r", encoding="utf-8") as f:
                careers_data = json.load(f)

            rows = []
            for item in careers_data:
                rows.append(
                    (
                        int(item.get("No.", 0)),
                        item.get("Career Name", "Unknown Career"),
                        item.get("Cluster", ""),
                        item.get("Demand Level", ""),
                        item.get("Entry Salary (LPA)", ""),
                    )
                )

            conn.executemany(
                """
                INSERT INTO careers (id, title, cluster, demand_level, entry_salary)
                VALUES (?, ?, ?, ?, ?)
                """,
                rows,
            )


def build_profile_summary(name: str, grade: str, superpowers: list[str], passions: list[str]) -> str:
    strengths = ", ".join(superpowers[:3]) if superpowers else "curiosity"
    interests = ", ".join(passions[:2]) if passions else "exploring different fields"
    return (
        f"{name} is a {grade} student with strengths in {strengths}. "
        f"They are most excited about {interests}."
    )


def suggest_careers(passions: list[str]) -> list[dict[str, Any]]:
    preferred_clusters = [
        PASSION_TO_CLUSTER[passion]
        for passion in passions
        if passion in PASSION_TO_CLUSTER
    ]

    query = """
        SELECT id, title, cluster, demand_level, entry_salary
        FROM careers
    """
    params: tuple[Any, ...] = ()
    if preferred_clusters:
        placeholders = ",".join(["?"] * len(preferred_clusters))
        query += f" WHERE cluster IN ({placeholders})"
        params = tuple(preferred_clusters)

    query += " ORDER BY id ASC LIMIT 5"

    with get_conn() as conn:
        rows = conn.execute(query, params).fetchall()
    return [dict(row) for row in rows]

@app.route("/")
def home():
    return jsonify({
        "message": "Clear Careers Backend is running 🚀",
        "api_key_loaded": bool(API_KEY),
        "database": str(DB_PATH)
    })

@app.route("/careers")
def careers():
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, title, cluster, demand_level, entry_salary
            FROM careers
            ORDER BY id ASC
            """
        ).fetchall()
    return jsonify([dict(row) for row in rows])


@app.route("/users", methods=["POST"])
def create_user_profile():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()

    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400

    with get_conn() as conn:
        cursor = conn.execute(
            """
            INSERT INTO user_profiles (name, email, created_at)
            VALUES (?, ?, ?)
            """,
            (name, email, datetime.utcnow().isoformat()),
        )
    return jsonify({"id": cursor.lastrowid, "name": name, "email": email}), 201


@app.route("/users", methods=["GET"])
def get_user_profiles():
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, name, email, created_at
            FROM user_profiles
            ORDER BY id DESC
            """
        ).fetchall()
    return jsonify([dict(row) for row in rows])


@app.route("/profiles", methods=["POST"])
def create_onboarding_profile():
    payload = request.get_json(silent=True) or {}

    name = str(payload.get("name", "")).strip()
    grade = str(payload.get("grade", "")).strip()
    subjects = payload.get("subjects", [])
    superpowers = payload.get("superpowers", [])
    passions = payload.get("passions", [])

    if not name or not grade:
        return jsonify({"error": "name and grade are required"}), 400
    if not isinstance(subjects, list) or not subjects:
        return jsonify({"error": "at least one subject is required"}), 400
    if not isinstance(superpowers, list) or not superpowers:
        return jsonify({"error": "at least one superpower is required"}), 400
    if not isinstance(passions, list) or not passions:
        return jsonify({"error": "at least one passion is required"}), 400

    profile_summary = build_profile_summary(name, grade, superpowers, passions)
    career_suggestions = suggest_careers(passions)

    created_at = datetime.utcnow().isoformat()
    with get_conn() as conn:
        cursor = conn.execute(
            """
            INSERT INTO onboarding_profiles (
                name,
                grade,
                subjects,
                superpowers,
                passions,
                profile_summary,
                suggested_careers,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                name,
                grade,
                json.dumps(subjects),
                json.dumps(superpowers),
                json.dumps(passions),
                profile_summary,
                json.dumps(career_suggestions),
                created_at,
            ),
        )
        profile_id = cursor.lastrowid

    return jsonify(
        {
            "id": profile_id,
            "name": name,
            "grade": grade,
            "subjects": subjects,
            "superpowers": superpowers,
            "passions": passions,
            "profile_summary": profile_summary,
            "suggested_careers": career_suggestions,
            "created_at": created_at,
        }
    ), 201


@app.route("/profiles/<int:profile_id>", methods=["GET"])
def get_onboarding_profile(profile_id: int):
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT id, name, grade, subjects, superpowers, passions,
                   profile_summary, suggested_careers, created_at
            FROM onboarding_profiles
            WHERE id = ?
            """,
            (profile_id,),
        ).fetchone()

    if row is None:
        return jsonify({"error": "profile not found"}), 404

    profile = dict(row)
    profile["subjects"] = json.loads(profile["subjects"])
    profile["superpowers"] = json.loads(profile["superpowers"])
    profile["passions"] = json.loads(profile["passions"])
    profile["suggested_careers"] = json.loads(profile["suggested_careers"])
    return jsonify(profile)

if __name__ == "__main__":
    init_db()
    app.run(debug=True)