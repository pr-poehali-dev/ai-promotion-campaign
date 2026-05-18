import { useState, useEffect } from "react";
import { Page, PlayerStats } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import { getLeaderboard } from "@/lib/api";

interface Props {
  stats: PlayerStats;
  setPage: (p: Page) => void;
}

const avatars = ["🦾", "🧠", "🥷", "🎮", "⚡", "🦁", "🤖", "🐉", "🚀", "🔥", "💎", "👾"];
const medalEmoji = ["🥇", "🥈", "🥉"];

interface Leader {
  rank: number;
  id: number;
  name: string;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  streak: number;
}

export default function LeaderboardPage({ stats, setPage }: Props) {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => {
      if (data && data.leaders) {
        setLeaders(data.leaders);
        setMyRank(data.my_rank);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
  const rankDisplay = myRank ?? "—";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-montserrat font-black text-3xl text-foreground">Таблица лидеров</h1>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon name="Users" size={14} />
          <span>{leaders.length} игроков</span>
        </div>
      </div>

      {/* My rank card */}
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">👾</div>
        <div className="flex-1">
          <div className="font-montserrat font-bold text-foreground">{stats.name}</div>
          <div className="text-sm text-muted-foreground">Уровень {stats.level} · {stats.xp.toLocaleString()} XP</div>
        </div>
        <div className="text-right">
          <div className="font-montserrat font-black text-3xl text-primary">#{rankDisplay}</div>
          <div className="text-xs text-muted-foreground">место</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Место", value: `#${rankDisplay}`, icon: "Award", color: "text-primary" },
          { label: "Победы", value: stats.wins, icon: "Trophy", color: "text-yellow-400" },
          { label: "% побед", value: `${winRate}%`, icon: "TrendingUp", color: "text-emerald-400" },
          { label: "Серия", value: `${stats.streak}🔥`, icon: "Flame", color: "text-orange-400" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <div className={`font-montserrat font-black text-xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🏆</div>
          <p>Пока никто не играл. Будь первым!</p>
          <button onClick={() => setPage("home")} className="mt-4 text-primary text-sm hover:underline">
            Начать игру
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((player, i) => {
            const isMe = player.id === stats.id;
            const avatar = avatars[player.id % avatars.length];
            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  isMe
                    ? "border-primary/30 bg-primary/5"
                    : i < 3
                    ? "border-border bg-card"
                    : "border-border/60 bg-card/60"
                }`}
              >
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <span className="text-lg">{medalEmoji[i]}</span>
                  ) : (
                    <span className={`font-montserrat font-bold text-sm ${isMe ? "text-primary" : "text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                  )}
                </div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isMe ? "bg-primary/20" : "bg-secondary"}`}>
                  {isMe ? "👾" : avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                    {player.name}{isMe ? " (ты)" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ур. {player.level} · {player.wins} побед
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-montserrat font-bold text-sm ${isMe ? "text-primary" : "text-foreground"}`}>
                    {player.xp.toLocaleString()} XP
                  </div>
                  {player.streak > 0 && (
                    <div className="text-xs text-orange-400 flex items-center justify-end gap-0.5">
                      <Icon name="Flame" size={10} />
                      {player.streak}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => setPage("home")}
          className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Играть и подняться выше
        </button>
      </div>
    </div>
  );
}
