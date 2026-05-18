const PLAYER_URL = "https://functions.poehali.dev/917b285d-df0a-483e-a01d-72d925daef42";
const SAVE_URL = "https://functions.poehali.dev/4c815bd6-1ba9-49c7-b515-058c2172f803";
const LEADERBOARD_URL = "https://functions.poehali.dev/f3ebe299-0420-4a0d-b844-be7abed3f8c8";

const TOKEN_KEY = "mozgoboi_token";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export async function initPlayer(name?: string) {
  const token = getToken();
  const res = await fetch(PLAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name || "Игрок", session_token: token }),
  });
  const data = await res.json();
  if (data.session_token) setToken(data.session_token);
  return data;
}

export async function getPlayer() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${PLAYER_URL}?session_token=${token}`);
  if (!res.ok) return null;
  return res.json();
}

export async function saveGame(payload: {
  mode: "text" | "draw" | "guess";
  result: "win" | "loss" | "draw";
  score: number;
  detail: string;
}) {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(SAVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_token: token, ...payload }),
  });
  return res.json();
}

export async function getLeaderboard() {
  const token = getToken();
  const res = await fetch(`${LEADERBOARD_URL}?session_token=${token}`);
  return res.json();
}
