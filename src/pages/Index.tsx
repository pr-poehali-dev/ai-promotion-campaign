import { useState } from "react";
import HomePage from "@/components/game/HomePage";
import TextGameMode from "@/components/game/TextGameMode";
import DrawGameMode from "@/components/game/DrawGameMode";
import GuessGameMode from "@/components/game/GuessGameMode";
import ProfilePage from "@/components/game/ProfilePage";
import LeaderboardPage from "@/components/game/LeaderboardPage";
import NavBar from "@/components/game/NavBar";

export type Page = "home" | "text" | "draw" | "guess" | "profile" | "leaderboard";

export interface PlayerStats {
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

const defaultStats: PlayerStats = {
  name: "Игрок",
  level: 7,
  xp: 3420,
  wins: 24,
  losses: 11,
  streak: 3,
  history: [
    { id: 1, mode: "text", result: "win", score: 120, date: "Сегодня, 14:32", detail: "Загадка о числах" },
    { id: 2, mode: "draw", result: "win", score: 90, date: "Сегодня, 13:15", detail: "ИИ угадал: кот" },
    { id: 3, mode: "guess", result: "loss", score: 40, date: "Вчера, 21:00", detail: "Слово: самолёт" },
    { id: 4, mode: "text", result: "win", score: 150, date: "Вчера, 19:45", detail: "Викторина: история" },
    { id: 5, mode: "draw", result: "win", score: 110, date: "2 дня назад", detail: "ИИ угадал: дом" },
    { id: 6, mode: "guess", result: "win", score: 80, date: "2 дня назад", detail: "Слово: дракон" },
  ]
};

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [stats, setStats] = useState<PlayerStats>(defaultStats);

  const addGameRecord = (record: Omit<GameRecord, "id">) => {
    setStats(prev => {
      const newRecord = { ...record, id: Date.now() };
      const isWin = record.result === "win";
      return {
        ...prev,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: !isWin ? prev.losses + 1 : prev.losses,
        streak: isWin ? prev.streak + 1 : 0,
        xp: prev.xp + record.score,
        history: [newRecord, ...prev.history].slice(0, 20),
      };
    });
  };

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
