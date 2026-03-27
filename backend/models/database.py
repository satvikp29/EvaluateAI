import os
import json
import sqlite3
from datetime import datetime

DB_PATH = os.environ.get("DB_PATH", "/data/evaluateai.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evals (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            prompt_template TEXT NOT NULL,
            result_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def save_eval(eval_result: dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO evals (id, name, prompt_template, result_json, created_at) VALUES (?, ?, ?, ?, ?)",
        (
            eval_result["eval_id"],
            eval_result["name"],
            eval_result["prompt_template"],
            json.dumps(eval_result),
            eval_result["created_at"],
        ),
    )
    conn.commit()
    conn.close()


def get_recent_evals(limit: int = 10):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, result_json, created_at FROM evals ORDER BY created_at DESC LIMIT ?",
        (limit,),
    )
    rows = cursor.fetchall()
    conn.close()
    results = []
    for row in rows:
        result_json = json.loads(row["result_json"])
        leaderboard = result_json.get("leaderboard", [])
        winner = leaderboard[0] if leaderboard else {}
        model_outputs = result_json.get("model_outputs", [])
        models = list(set(o["model"] for o in model_outputs))
        test_case_indices = list(set(o["test_case_index"] for o in model_outputs))
        results.append({
            "id": row["id"],
            "name": row["name"],
            "winner_model": winner.get("model", ""),
            "winner_score": winner.get("avg_total", 0),
            "created_at": row["created_at"],
            "model_count": len(models),
            "test_case_count": len(test_case_indices),
        })
    return results


def get_eval_by_id(eval_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT result_json FROM evals WHERE id = ?", (eval_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["result_json"])
    return None
