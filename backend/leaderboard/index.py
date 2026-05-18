"""Таблица лидеров — топ игроков по XP"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Возвращает топ-50 игроков и позицию текущего игрока"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    token = params.get("session_token", "")

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, name, level, xp, wins, losses, streak FROM players ORDER BY xp DESC LIMIT 50"
        )
        rows = cur.fetchall()
        leaders = [
            {
                "rank": i + 1,
                "id": r[0],
                "name": r[1],
                "level": r[2],
                "xp": r[3],
                "wins": r[4],
                "losses": r[5],
                "streak": r[6],
            }
            for i, r in enumerate(rows)
        ]

        my_rank = None
        if token:
            cur.execute("SELECT id FROM players WHERE session_token = %s", (token,))
            me = cur.fetchone()
            if me:
                cur.execute(
                    "SELECT COUNT(*) FROM players WHERE xp > (SELECT xp FROM players WHERE id = %s)",
                    (me[0],)
                )
                my_rank = cur.fetchone()[0] + 1

        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"leaders": leaders, "my_rank": my_rank})
        }
    finally:
        cur.close()
        conn.close()
