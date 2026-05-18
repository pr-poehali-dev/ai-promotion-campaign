import { useState, useEffect } from "react";
import { Page, GameRecord } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  setPage: (p: Page) => void;
  addRecord: (r: Omit<GameRecord, "id">) => void;
}

const questions = [
  { q: "Сколько секунд в одном часе?", answers: ["3600", "3600 секунд", "3 600"], hint: "60 × 60", category: "Математика" },
  { q: "Какая планета самая большая в Солнечной системе?", answers: ["юпитер"], hint: "Планета-гигант с Большим красным пятном", category: "Космос" },
  { q: "В каком году полетел первый человек в космос?", answers: ["1961", "в 1961"], hint: "Это был гражданин СССР", category: "История" },
  { q: "Сколько сторон у шестиугольника?", answers: ["6", "шесть", "6 сторон"], hint: "Как у ячейки пчелиных сот", category: "Геометрия" },
  { q: "Что тяжелее: 1 кг железа или 1 кг перьев?", answers: ["одинаково", "равны", "они равны", "одно и то же"], hint: "Вдумайся в вопрос", category: "Логика" },
  { q: "Как называется столица Японии?", answers: ["токио"], hint: "Один из самых населённых городов мира", category: "География" },
  { q: "Сколько букв в русском алфавите?", answers: ["33", "тридцать три"], hint: "Больше, чем в английском", category: "Русский язык" },
  { q: "Что общего у летучей мыши и дельфина?", answers: ["эхолокация", "используют эхолокацию", "эхолот"], hint: "Они ориентируются с помощью звука", category: "Наука" },
];

const aiThoughts = [
  "Анализирую вопрос...",
  "Обрабатываю данные...",
  "Нейросеть думает...",
  "Проверяю базу знаний...",
  "Вычисляю ответ...",
];

type GameState = "ready" | "playing" | "result";

export default function TextGameMode({ setPage, addRecord }: Props) {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [aiThought, setAiThought] = useState("");
  const [aiAnswered, setAiAnswered] = useState(false);
  const [playerAnswered, setPlayerAnswered] = useState(false);
  const [playerCorrect, setPlayerCorrect] = useState<boolean | null>(null);
  const [roundResults, setRoundResults] = useState<Array<{ player: boolean; ai: boolean }>>([]);
  const [shuffled, setShuffled] = useState<typeof questions>([]);

  useEffect(() => {
    const s = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
    setShuffled(s);
  }, []);

  useEffect(() => {
    if (gameState !== "playing" || playerAnswered) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameState, playerAnswered]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const delay = 8000 + Math.random() * 7000;
    const t = setTimeout(() => {
      const idx = Math.floor(Math.random() * aiThoughts.length);
      setAiThought(aiThoughts[idx]);
      setTimeout(() => setAiAnswered(true), 2000);
    }, delay);
    return () => clearTimeout(t);
  }, [currentQ, gameState]);

  const startGame = () => {
    setGameState("playing");
    setCurrentQ(0);
    setScore(0);
    setRoundResults([]);
    resetRound();
  };

  const resetRound = () => {
    setAnswer("");
    setTimeLeft(30);
    setAiAnswered(false);
    setAiThought("");
    setPlayerAnswered(false);
    setPlayerCorrect(null);
  };

  const handleSubmit = (timeout = false) => {
    if (playerAnswered) return;
    const q = shuffled[currentQ];
    const isCorrect = !timeout && q.answers.some(a =>
      a.toLowerCase() === answer.trim().toLowerCase()
    );
    const aiCorrect = Math.random() > 0.45;

    setPlayerCorrect(isCorrect);
    setPlayerAnswered(true);
    setAiAnswered(true);
    setAiThought(aiCorrect ? "✓ Правильно!" : "✗ Ошиблась");

    const points = isCorrect ? (aiCorrect ? 60 : 120) : 0;
    setScore(p => p + points);
    setRoundResults(p => [...p, { player: isCorrect, ai: aiCorrect }]);

    setTimeout(() => {
      if (currentQ + 1 >= shuffled.length) {
        setGameState("result");
        const playerWins = roundResults.filter(r => r.player).length + (isCorrect ? 1 : 0);
        const aiWins = roundResults.filter(r => r.ai).length + (aiCorrect ? 1 : 0);
        addRecord({
          mode: "text",
          result: playerWins > aiWins ? "win" : playerWins === aiWins ? "draw" : "loss",
          score: points + score,
          date: "Только что",
          detail: q.category + " — " + (playerWins > aiWins ? "ты победил!" : "ИИ победил"),
        });
      } else {
        setCurrentQ(p => p + 1);
        resetRound();
      }
    }, 2500);
  };

  const playerWins = roundResults.filter(r => r.player).length;
  const aiWins = roundResults.filter(r => r.ai).length;

  if (gameState === "ready") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <button onClick={() => setPage("home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
          <Icon name="ArrowLeft" size={16} /> Назад
        </button>
        <div className="text-6xl mb-6">🧠</div>
        <h1 className="font-montserrat font-black text-4xl text-foreground mb-3">Текстовые задачи</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          5 вопросов. 30 секунд на каждый. ИИ отвечает параллельно с тобой — кто точнее?
        </p>
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[["5", "вопросов"], ["30 сек", "на ответ"], ["×2 очка", "без ИИ"]].map(([v, l]) => (
            <div key={l} className="bg-card border border-border rounded-xl p-4">
              <div className="font-montserrat font-black text-xl text-primary">{v}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <button
          onClick={startGame}
          className="bg-primary text-primary-foreground font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-opacity glow-green"
        >
          Начать игру
        </button>
      </div>
    );
  }

  if (gameState === "result") {
    const won = playerWins > aiWins;
    const tie = playerWins === aiWins;
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-scale-in">
        <div className="text-7xl mb-6">{won ? "🏆" : tie ? "🤝" : "🤖"}</div>
        <h2 className="font-montserrat font-black text-4xl text-foreground mb-2">
          {won ? "Ты победил!" : tie ? "Ничья!" : "ИИ победил"}
        </h2>
        <p className="text-muted-foreground mb-8">
          {won ? "Человеческий разум оказался сильнее!" : tie ? "Равная борьба!" : "Нейросеть была точнее сегодня."}
        </p>
        <div className="flex justify-center gap-8 mb-10">
          <div className="text-center">
            <div className="font-montserrat font-black text-4xl text-primary">{playerWins}</div>
            <div className="text-sm text-muted-foreground">Ты</div>
          </div>
          <div className="text-muted-foreground text-2xl self-center">:</div>
          <div className="text-center">
            <div className="font-montserrat font-black text-4xl text-red-400">{aiWins}</div>
            <div className="text-sm text-muted-foreground">ИИ</div>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8">
          <span className="text-primary font-bold text-xl">+{score} XP</span>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={startGame} className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Ещё раз
          </button>
          <button onClick={() => setPage("home")} className="border border-border text-foreground font-medium px-8 py-3 rounded-xl hover:bg-secondary transition-colors">
            На главную
          </button>
        </div>
      </div>
    );
  }

  const q = shuffled[currentQ];
  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setPage("home")} className="text-muted-foreground hover:text-foreground">
          <Icon name="X" size={20} />
        </button>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Вопрос {currentQ + 1} / {shuffled.length}</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary">
            <Icon name="Clock" size={14} className={timeLeft <= 10 ? "text-red-400" : "text-primary"} />
            <span className={`font-bold ${timeLeft <= 10 ? "text-red-400" : "text-foreground"}`}>{timeLeft}</span>
          </div>
        </div>
        <div className="text-primary font-bold">+{score} XP</div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: shuffled.length }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
            i < currentQ ? "bg-primary" : i === currentQ ? "bg-primary/50" : "bg-border"
          }`} />
        ))}
      </div>

      {/* Category */}
      <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider mb-3">{q.category}</div>

      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-montserrat font-bold text-2xl text-foreground leading-snug">{q.q}</h2>
        {!playerAnswered && (
          <p className="text-xs text-muted-foreground mt-3">💡 Подсказка: {q.hint}</p>
        )}
      </div>

      {/* Scoreboard */}
      <div className="flex gap-3 mb-6">
        <div className={`flex-1 rounded-xl border p-3 flex items-center gap-2 text-sm ${
          playerAnswered
            ? playerCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"
            : "border-border bg-secondary"
        }`}>
          <Icon name="User" size={16} className="text-muted-foreground" />
          <span className="text-foreground font-medium">Ты</span>
          <span className={`ml-auto font-bold ${
            playerAnswered ? (playerCorrect ? "text-emerald-400" : "text-red-400") : "text-muted-foreground"
          }`}>
            {playerAnswered ? (playerCorrect ? "✓" : "✗") : "..."}
          </span>
        </div>
        <div className={`flex-1 rounded-xl border p-3 flex items-center gap-2 text-sm ${
          aiAnswered
            ? "border-border bg-secondary"
            : "border-border bg-secondary"
        }`}>
          <Icon name="Bot" size={16} className="text-muted-foreground" />
          <span className="text-foreground font-medium">ИИ</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {aiAnswered ? aiThought : aiThought || <span className="ai-thinking"></span>}
          </span>
        </div>
      </div>

      {/* Input */}
      {!playerAnswered ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-3">
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Твой ответ..."
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={!answer.trim()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Ответить
          </button>
        </form>
      ) : (
        <div className={`rounded-xl border p-4 text-center ${
          playerCorrect ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"
        }`}>
          <p className={`font-bold text-lg ${playerCorrect ? "text-emerald-400" : "text-red-400"}`}>
            {playerCorrect ? "Правильно! 🎉" : `Неверно. Ответ: ${q.answers[0]}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Следующий вопрос через секунду...</p>
        </div>
      )}
    </div>
  );
}
