import { Page, PlayerStats } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface NavBarProps {
  page: Page;
  setPage: (p: Page) => void;
  stats: PlayerStats;
}

export default function NavBar({ page, setPage, stats }: NavBarProps) {
  const nav = [
    { id: "home" as Page, icon: "Gamepad2", label: "Игры" },
    { id: "leaderboard" as Page, icon: "Trophy", label: "Рейтинг" },
    { id: "profile" as Page, icon: "User", label: "Профиль" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <span className="text-primary text-sm font-bold font-montserrat">МБ</span>
          </div>
          <span className="font-montserrat font-bold text-foreground tracking-tight hidden sm:block">
            МозгоБой
          </span>
        </button>

        <div className="flex items-center gap-1">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                page === item.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon name={item.icon} size={16} />
              <span className="hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary border border-border">
            <Icon name="Flame" size={14} className="text-orange-400" />
            <span className="font-semibold text-foreground">{stats.streak}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Icon name="Zap" size={14} className="text-primary" />
            <span className="font-semibold text-primary">{stats.xp.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
