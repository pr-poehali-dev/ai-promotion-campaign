import { Page, PlayerStats } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  stats: PlayerStats;
  setPage: (p: Page) => void;
}

const modeLabel: Record<string, string> = { text: "🧠 Текст", draw: "🎨 Рисование", guess: "🔍 Угадывание" };
const modeColor: Record<string, string> = {
  text: "bg-emerald-500/15 text-emerald-400",
  draw: "bg-violet-500/15 text-violet-400",
  guess: "bg-amber-500/15 text-amber-400",
};

export default function ProfilePage({ stats, setPage }: Props) {
  const total = stats.wins + stats.losses;
  const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
  const xpToNext = 500 - (stats.xp % 500);
  const xpPct = Math.round(((stats.xp % 500) / 500) * 100);

  const modeStat = (mode: "text" | "draw" | "guess") => {
    const games = stats.history.filter(h => h.mode === mode);
    const wins = games.filter(h => h.result === "win").length;
    return { games: games.length, wins };
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="font-montserrat font-black text-3xl text-foreground mb-8">Профиль</h1>

      {/* Avatar + level */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
            <span className="text-4xl">👾</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs font-montserrat">{stats.level}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-montserrat font-black text-2xl text-foreground">{stats.name}</div>
          <div className="text-sm text-muted-foreground mb-3">Уровень {stats.level} · {stats.xp.toLocaleString()} XP</div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>До следующего уровня</span>
              <span>{xpToNext} XP</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="Flame" size={24} className="text-orange-400" />
          <span className="font-montserrat font-black text-2xl text-foreground">{stats.streak}</span>
          <span className="text-xs text-muted-foreground">серия</span>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Игр", value: total, icon: "Gamepad2", color: "text-blue-400" },
          { label: "Побед", value: stats.wins, icon: "Trophy", color: "text-primary" },
          { label: "% побед", value: `${winRate}%`, icon: "TrendingUp", color: "text-violet-400" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <Icon name={s.icon} size={20} className={`${s.color} mx-auto mb-1`} />
            <div className={`font-montserrat font-black text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per mode stats */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h2 className="font-montserrat font-bold text-foreground mb-4">По режимам</h2>
        <div className="space-y-3">
          {(["text", "draw", "guess"] as const).map(mode => {
            const ms = modeStat(mode);
            const wr = ms.games > 0 ? Math.round((ms.wins / ms.games) * 100) : 0;
            return (
              <div key={mode} className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${modeColor[mode]} w-28 text-center`}>
                  {modeLabel[mode]}
                </span>
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      mode === "text" ? "bg-emerald-400" : mode === "draw" ? "bg-violet-400" : "bg-amber-400"
                    }`}
                    style={{ width: `${wr}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {ms.wins}/{ms.games} игр
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-montserrat font-bold text-foreground">История игр</h2>
          <span className="text-xs text-muted-foreground">{stats.history.length} записей</span>
        </div>
        {stats.history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-3">🎮</div>
            <p>Сыграй первую игру!</p>
            <button onClick={() => setPage("home")} className="mt-4 text-primary text-sm hover:underline">
              Выбрать режим
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.history.map(record => (
              <div key={record.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${modeColor[record.mode]}`}>
                  {record.mode === "text" ? "🧠" : record.mode === "draw" ? "🎨" : "🔍"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{record.detail}</div>
                  <div className="text-xs text-muted-foreground">{record.date}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-primary">+{record.score}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    record.result === "win" ? "bg-emerald-500/15 text-emerald-400" :
                    record.result === "loss" ? "bg-red-500/15 text-red-400" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {record.result === "win" ? "Победа" : record.result === "loss" ? "Поражение" : "Ничья"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
