import { useState, useEffect } from "react";
import HomePage from "@/components/game/HomePage";
import TextGameMode from "@/components/game/TextGameMode";
import DrawGameMode from "@/components/game/DrawGameMode";
import GuessGameMode from "@/components/game/GuessGameMode";
import ProfilePage from "@/components/game/ProfilePage";
import LeaderboardPage from "@/components/game/LeaderboardPage";
import NavBar from "@/components/game/NavBar";
import { initPlayer, getPlayer, saveGame, getToken } from "@/lib/api";

export type Page = "home" | "text" | "draw" | "guess" | "profile" | "leaderboard";

export interface PlayerStats {
  id?: number;
  name: string;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  streak: number;
  history: GameRecord[];
}

export interface GameRecord {
  id: number;
  mode: "text" | "draw" | "guess";
  result: "win" | "loss" | "draw";
  score: number;
  date: string;
  detail: string;
}

const emptyStats: PlayerStats = {
  name: "Игрок",
  level: 1,
  xp: 0,
  wins: 0,
  losses: 0,
  streak: 0,
  history: [],
};

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [stats, setStats] = useState<PlayerStats>(emptyStats);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      getPlayer().then(data => {
        if (data && data.id) {
          setStats({
            id: data.id,
            name: data.name,
            level: data.level,
            xp: data.xp,
            wins: data.wins,
            losses: data.losses,
            streak: data.streak,
            history: (data.history || []).map((h: GameRecord & { id?: number }, i: number) => ({ ...h, id: h.id ?? i })),
          });
        } else {
          setShowNameInput(true);
        }
        setLoading(false);
      }).catch(() => {
        setShowNameInput(true);
        setLoading(false);
      });
    } else {
      setShowNameInput(true);
      setLoading(false);
    }
  }, []);

  const handleNameSubmit = async () => {
    const name = nameInput.trim() || "Игрок";
    setLoading(true);
    const data = await initPlayer(name);
    if (data && data.id) {
      setStats({
        id: data.id,
        name: data.name,
        level: data.level,
        xp: data.xp,
        wins: data.wins,
        losses: data.losses,
        streak: data.streak,
        history: [],
      });
    }
    setShowNameInput(false);
    setLoading(false);
  };

  const addGameRecord = async (record: Omit<GameRecord, "id">) => {
    const newRecord = { ...record, id: Date.now() };
    setStats(prev => {
      const isWin = record.result === "win";
      return {
        ...prev,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: record.result === "loss" ? prev.losses + 1 : prev.losses,
        streak: isWin ? prev.streak + 1 : 0,
        xp: prev.xp + record.score,
        level: Math.max(1, Math.floor((prev.xp + record.score) / 500) + 1),
        history: [newRecord, ...prev.history].slice(0, 20),
      };
    });
    const saved = await saveGame(record);
    if (saved && saved.ok) {
      setStats(prev => ({
        ...prev,
        xp: saved.xp,
        level: saved.level,
        wins: saved.wins,
        losses: saved.losses,
        streak: saved.streak,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🎮</div>
          <div className="text-muted-foreground font-golos">Загружаем игру...</div>
        </div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center animate-scale-in">
          <div className="text-5xl mb-4">👾</div>
          <h1 className="font-montserrat font-black text-2xl text-foreground mb-2">Добро пожаловать!</h1>
          <p className="text-muted-foreground text-sm mb-6">Как тебя зовут? Твоё имя появится в таблице лидеров.</p>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleNameSubmit()}
            placeholder="Введи никнейм..."
            maxLength={50}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-4"
            autoFocus
          />
          <button
            onClick={handleNameSubmit}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity glow-green"
          >
            Начать играть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg font-golos">
      <NavBar page={page} setPage={setPage} stats={stats} />
      <main className="pt-16">
        {page === "home" && <HomePage setPage={setPage} stats={stats} />}
        {page === "text" && <TextGameMode setPage={setPage} addRecord={addGameRecord} />}
        {page === "draw" && <DrawGameMode setPage={setPage} addRecord={addGameRecord} />}
        {page === "guess" && <GuessGameMode setPage={setPage} addRecord={addGameRecord} />}
        {page === "profile" && <ProfilePage stats={stats} setPage={setPage} />}
        {page === "leaderboard" && <LeaderboardPage stats={stats} setPage={setPage} />}
      </main>
    </div>
  );
}
