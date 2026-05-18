import { Page, PlayerStats } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface HomePageProps {
  setPage: (p: Page) => void;
  stats: PlayerStats;
}

const modes = [
  {
    id: "text" as Page,
    icon: "MessageSquare",
    emoji: "🧠",
    title: "Текстовые задачи",
    description: "Викторины, загадки и логика против ИИ",
    color: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/50",
    bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
    glow: "hover:glow-green",
    badge: "Горячо",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
    stats: "1 240 игр",
  },
  {
    id: "draw" as Page,
    icon: "Pencil",
    emoji: "🎨",
    title: "Рисование",
    description: "Рисуй — ИИ угадывает в реальном времени",
    color: "text-violet-400",
    border: "border-violet-500/20 hover:border-violet-500/50",
    bg: "bg-violet-500/5 hover:bg-violet-500/10",
    glow: "hover:glow-purple",
    badge: "Хит",
    badgeColor: "bg-violet-500/20 text-violet-400",
    stats: "3 870 игр",
  },
  {
    id: "guess" as Page,
    icon: "HelpCircle",
    emoji: "🔍",
    title: "Угадывание",
    description: "ИИ загадывает или отгадывает слова",
    color: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/50",
    bg: "bg-amber-500/5 hover:bg-amber-500/10",
    glow: "hover:glow-yellow",
    badge: "Новинка",
    badgeColor: "bg-amber-500/20 text-amber-400",
    stats: "890 игр",
  },
];

export default function HomePage({ setPage, stats }: HomePageProps) {
  const winRate = stats.wins + stats.losses > 0
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          ИИ онлайн и готов к бою
        </div>
        <h1 className="font-montserrat font-black text-5xl sm:text-6xl text-foreground leading-none mb-4 tracking-tight">
          Сыграй против
          <br />
          <span className="text-primary">искусственного</span>
          <br />
          интеллекта
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Три режима игры. Один противник. Докажи, что человек умнее.
        </p>
      </div>

      {/* Player quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-12 animate-fade-in stagger-1">
        {[
          { label: "Победы", value: stats.wins, icon: "Trophy", color: "text-primary" },
          { label: "Серия", value: `${stats.streak} 🔥`, icon: "Flame", color: "text-orange-400" },
          { label: "% побед", value: `${winRate}%`, icon: "TrendingUp", color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`text-2xl font-montserrat font-black ${s.color} mb-0.5`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Game modes */}
      <div className="grid sm:grid-cols-3 gap-4 mb-16">
        {modes.map((mode, i) => (
          <button
            key={mode.id}
            onClick={() => setPage(mode.id)}
            className={`
              group relative text-left rounded-2xl border p-6 transition-all duration-300 card-hover
              ${mode.border} ${mode.bg} ${mode.glow}
              animate-fade-in stagger-${i + 2}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{mode.emoji}</div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${mode.badgeColor}`}>
                {mode.badge}
              </span>
            </div>
            <h3 className={`font-montserrat font-bold text-lg ${mode.color} mb-2`}>{mode.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{mode.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{mode.stats}</span>
              <div className={`flex items-center gap-1 text-xs font-medium ${mode.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                Играть <Icon name="ArrowRight" size={12} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent game */}
      {stats.history.length > 0 && (
        <div className="animate-fade-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-bold text-foreground">Последние игры</h2>
            <button
              onClick={() => setPage("profile")}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Все игры <Icon name="ArrowRight" size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {stats.history.slice(0, 3).map(record => (
              <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                  ${record.mode === "text" ? "bg-emerald-500/15 text-emerald-400" :
                    record.mode === "draw" ? "bg-violet-500/15 text-violet-400" :
                    "bg-amber-500/15 text-amber-400"}`}>
                  {record.mode === "text" ? "🧠" : record.mode === "draw" ? "🎨" : "🔍"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{record.detail}</div>
                  <div className="text-xs text-muted-foreground">{record.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">+{record.score}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${record.result === "win" ? "bg-emerald-500/15 text-emerald-400" :
                      record.result === "loss" ? "bg-red-500/15 text-red-400" :
                      "bg-muted text-muted-foreground"}`}>
                    {record.result === "win" ? "Победа" : record.result === "loss" ? "Поражение" : "Ничья"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
