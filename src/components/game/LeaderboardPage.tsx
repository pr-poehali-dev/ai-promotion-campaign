import { Page, PlayerStats } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  stats: PlayerStats;
  setPage: (p: Page) => void;
}

const mockPlayers = [
  { name: "КиберЧемпион", level: 24, wins: 187, xp: 42100, streak: 12, avatar: "🦾" },
  { name: "МозгоМастер", level: 19, wins: 143, xp: 34800, streak: 7, avatar: "🧠" },
  { name: "НейроНинджа", level: 17, wins: 128, xp: 29300, streak: 5, avatar: "🥷" },
  { name: "ПиксельГений", level: 15, wins: 112, xp: 25600, streak: 4, avatar: "🎮" },
  { name: "БотоБоец", level: 14, wins: 98, xp: 22100, streak: 3, avatar: "⚡" },
  { name: "ЛогикЛев", level: 12, wins: 84, xp: 18900, streak: 2, avatar: "🦁" },
  { name: "АлгоАртём", level: 11, wins: 76, xp: 16400, streak: 1, avatar: "🤖" },
  { name: "ДатаДракон", level: 10, wins: 61, xp: 14200, streak: 0, avatar: "🐉" },
];

const medalColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
const medalEmoji = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage({ stats, setPage }: Props) {
  const allPlayers = [
    ...mockPlayers,
    {
      name: stats.name + " (ты)",
      level: stats.level,
      wins: stats.wins,
      xp: stats.xp,
      streak: stats.streak,
      avatar: "👾",
      isMe: true,
    },
  ].sort((a, b) => b.xp - a.xp);

  const myRank = allPlayers.findIndex(p => "isMe" in p && p.isMe) + 1;
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-montserrat font-black text-3xl text-foreground">Таблица лидеров</h1>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon name="Users" size={14} />
          <span>{allPlayers.length} игроков</span>
        </div>
      </div>

      {/* My rank card */}
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
          👾
        </div>
        <div className="flex-1">
          <div className="font-montserrat font-bold text-foreground">{stats.name}</div>
          <div className="text-sm text-muted-foreground">Уровень {stats.level} · {stats.xp.toLocaleString()} XP</div>
        </div>
        <div className="text-right">
          <div className="font-montserrat font-black text-3xl text-primary">#{myRank}</div>
          <div className="text-xs text-muted-foreground">место</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Место", value: `#${myRank}`, icon: "Award", color: "text-primary" },
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
      <div className="space-y-2">
        {allPlayers.map((player, i) => {
          const isMe = "isMe" in player && player.isMe;
          return (
            <div
              key={player.name}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                isMe
                  ? "border-primary/30 bg-primary/5"
                  : i < 3
                  ? "border-border bg-card"
                  : "border-border/60 bg-card/60"
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {i < 3 ? (
                  <span className="text-lg">{medalEmoji[i]}</span>
                ) : (
                  <span className={`font-montserrat font-bold text-sm ${isMe ? "text-primary" : "text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                isMe ? "bg-primary/20" : "bg-secondary"
              }`}>
                {player.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                  {player.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ур. {player.level} · {player.wins} побед
                </div>
              </div>

              {/* XP + streak */}
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
