"""Сохранение результата игры и обновление статистики игрока"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def calc_level(xp: int) -> int:
    return max(1, xp // 500 + 1)

def handler(event: dict, context) -> dict:
    """Принимает результат игры и сохраняет в БД"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    token = body.get("session_token", "")
    mode = body.get("mode", "")
    result = body.get("result", "")
    score = int(body.get("score", 0))
    detail = body.get("detail", "")

    if not token or mode not in ("text", "draw", "guess") or result not in ("win", "loss", "draw"):
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "invalid params"})}

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, xp, wins, losses, streak FROM players WHERE session_token = %s", (token,))
        row = cur.fetchone()
        if not row:
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "player not found"})}

        player_id, xp, wins, losses, streak = row
        new_xp = xp + score
        new_wins = wins + (1 if result == "win" else 0)
        new_losses = losses + (1 if result == "loss" else 0)
        new_streak = streak + 1 if result == "win" else 0
        new_level = calc_level(new_xp)

        cur.execute(
            "UPDATE players SET xp=%s, wins=%s, losses=%s, streak=%s, level=%s, last_seen=NOW() WHERE id=%s",
            (new_xp, new_wins, new_losses, new_streak, new_level, player_id)
        )
        cur.execute(
            "INSERT INTO game_sessions (player_id, mode, result, score, detail) VALUES (%s, %s, %s, %s, %s)",
            (player_id, mode, result, score, detail)
        )
        conn.commit()

        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "ok": True,
                "xp": new_xp,
                "level": new_level,
                "wins": new_wins,
                "losses": new_losses,
                "streak": new_streak,
            })
        }
    finally:
        cur.close()
        conn.close()
