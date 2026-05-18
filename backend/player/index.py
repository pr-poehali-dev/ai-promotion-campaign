"""Регистрация и получение профиля игрока по session_token"""
import json
import os
import secrets
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            name = (body.get("name") or "Игрок").strip()[:50]
            token = body.get("session_token") or ""

            if token:
                cur.execute(
                    "SELECT id, name, level, xp, wins, losses, streak FROM players WHERE session_token = %s",
                    (token,)
                )
                row = cur.fetchone()
                if row:
                    cur.execute("UPDATE players SET last_seen = NOW() WHERE id = %s", (row[0],))
                    conn.commit()
                    return {
                        "statusCode": 200,
                        "headers": CORS,
                        "body": json.dumps({
                            "id": row[0], "name": row[1], "level": row[2],
                            "xp": row[3], "wins": row[4], "losses": row[5],
                            "streak": row[6], "session_token": token,
                        })
                    }

            new_token = secrets.token_hex(32)
            cur.execute(
                "INSERT INTO players (name, session_token) VALUES (%s, %s) RETURNING id",
                (name, new_token)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return {
                "statusCode": 201,
                "headers": CORS,
                "body": json.dumps({
                    "id": new_id, "name": name, "level": 1, "xp": 0,
                    "wins": 0, "losses": 0, "streak": 0, "session_token": new_token,
                })
            }

        if method == "GET":
            params = event.get("queryStringParameters") or {}
            token = params.get("session_token", "")
            if not token:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "session_token required"})}

            cur.execute(
                "SELECT id, name, level, xp, wins, losses, streak FROM players WHERE session_token = %s",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}

            cur.execute(
                "SELECT mode, result, score, detail, played_at FROM game_sessions WHERE player_id = %s ORDER BY played_at DESC LIMIT 20",
                (row[0],)
            )
            history = [
                {"mode": r[0], "result": r[1], "score": r[2], "detail": r[3], "date": r[4].strftime("%d.%m %H:%M")}
                for r in cur.fetchall()
            ]
            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({
                    "id": row[0], "name": row[1], "level": row[2],
                    "xp": row[3], "wins": row[4], "losses": row[5],
                    "streak": row[6], "session_token": token, "history": history,
                })
            }

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
