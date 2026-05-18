import { useState, useEffect } from "react";
import { Page, GameRecord } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  setPage: (p: Page) => void;
  addRecord: (r: Omit<GameRecord, "id">) => void;
}

const secretWords = [
  { word: "самолёт", hints: ["Летает", "Имеет крылья", "Перевозит пассажиров", "Взлетает с аэропорта"] },
  { word: "слон", hints: ["Животное", "Самое большое сухопутное", "Имеет хобот", "Серого цвета"] },
  { word: "пианино", hints: ["Музыкальный инструмент", "Имеет клавиши", "Чёрно-белые клавиши", "Бывает в концертных залах"] },
  { word: "океан", hints: ["Водоём", "Очень большой", "Там живут акулы", "Солёная вода"] },
  { word: "вулкан", hints: ["Природное явление", "Извергает лаву", "Гора", "Может быть опасным"] },
  { word: "библиотека", hints: ["Место", "Там много книг", "Тихое место", "Можно брать книги напрокат"] },
  { word: "радуга", hints: ["Природное явление", "После дождя", "7 цветов", "Дугообразная форма"] },
  { word: "подводная лодка", hints: ["Транспорт", "Под водой", "Военный", "Перископ"] },
];

const playerGuessWords = [
  { word: "кот", category: "Животные" },
  { word: "луна", category: "Космос" },
  { word: "торт", category: "Еда" },
  { word: "замок", category: "Архитектура" },
  { word: "гитара", category: "Музыка" },
  { word: "снег", category: "Природа" },
];

type SubMode = "ai-guesses" | "player-guesses";
type GameState = "ready" | "pick-mode" | "playing-ai" | "playing-player" | "result";

const thinkingMessages = [
  "Анализирую подсказку...",
  "Перебираю варианты...",
  "Думаю...",
  "Уточняю гипотезу...",
];

export default function GuessGameMode({ setPage, addRecord }: Props) {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [subMode, setSubMode] = useState<SubMode>("ai-guesses");

  // AI guesses mode
  const [secretData, setSecretData] = useState(secretWords[0]);
  const [hintIndex, setHintIndex] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiGuess, setAiGuess] = useState("");
  const [aiWon, setAiWon] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Player guesses mode
  const [wordData, setWordData] = useState(playerGuessWords[0]);
  const [playerGuess, setPlayerGuess] = useState("");
  const [playerAttempts, setPlayerAttempts] = useState<string[]>([]);
  const [playerWon, setPlayerWon] = useState(false);
  const [maxAttempts] = useState(6);
  const [aiHintShown, setAiHintShown] = useState(false);

  const startAiMode = () => {
    const data = secretWords[Math.floor(Math.random() * secretWords.length)];
    setSecretData(data);
    setHintIndex(0);
    setAiThinking(false);
    setAiGuess("");
    setAiWon(false);
    setHintsUsed(0);
    setGameState("playing-ai");
  };

  const startPlayerMode = () => {
    const data = playerGuessWords[Math.floor(Math.random() * playerGuessWords.length)];
    setWordData(data);
    setPlayerGuess("");
    setPlayerAttempts([]);
    setPlayerWon(false);
    setAiHintShown(false);
    setGameState("playing-player");
  };

  const giveHint = () => {
    if (hintIndex >= secretData.hints.length) return;
    setHintsUsed(p => p + 1);
    setAiThinking(true);
    const msg = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
    setAiGuess(msg);
    setTimeout(() => {
      setHintIndex(p => p + 1);
      setAiThinking(false);
      const revealed = hintIndex + 1;
      if (revealed >= 3) {
        setAiGuess(`Это... ${secretData.word}?`);
        setTimeout(() => {
          setAiWon(true);
          setGameState("result");
          addRecord({
            mode: "guess",
            result: "loss",
            score: Math.max(10, 100 - hintsUsed * 20),
            date: "Только что",
            detail: `Слово: ${secretData.word} — ИИ угадал за ${revealed} подсказки`,
          });
        }, 1500);
      } else {
        setAiGuess(revealed === 1 ? "Хм, нужна ещё подсказка..." : "Почти знаю... ещё одна?");
      }
    }, 2000);
  };

  const handlePlayerGuess = () => {
    const guess = playerGuess.trim().toLowerCase();
    if (!guess || playerAttempts.includes(guess)) return;
    const newAttempts = [...playerAttempts, guess];
    setPlayerAttempts(newAttempts);
    setPlayerGuess("");

    if (guess === wordData.word.toLowerCase()) {
      setPlayerWon(true);
      setGameState("result");
      addRecord({
        mode: "guess",
        result: "win",
        score: Math.max(20, 120 - newAttempts.length * 15),
        date: "Только что",
        detail: `Слово: ${wordData.word} — угадал за ${newAttempts.length} попытки`,
      });
    } else if (newAttempts.length >= maxAttempts) {
      setGameState("result");
      addRecord({
        mode: "guess",
        result: "loss",
        score: 10,
        date: "Только что",
        detail: `Слово: ${wordData.word} — не угадал`,
      });
    }
  };

  if (gameState === "ready") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <button onClick={() => setPage("home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
          <Icon name="ArrowLeft" size={16} /> Назад
        </button>
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="font-montserrat font-black text-4xl text-foreground mb-3">Угадывание</h1>
        <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
          Выбери роль — ты загадываешь или отгадываешь?
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setSubMode("ai-guesses"); startAiMode(); }}
            className="group border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 rounded-2xl p-6 text-left transition-all card-hover"
          >
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-montserrat font-bold text-amber-400 text-lg mb-2">Ты загадываешь</h3>
            <p className="text-muted-foreground text-sm">Давай подсказки — ИИ пытается угадать твоё слово</p>
          </button>
          <button
            onClick={() => { setSubMode("player-guesses"); startPlayerMode(); }}
            className="group border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 rounded-2xl p-6 text-left transition-all card-hover"
          >
            <div className="text-3xl mb-3">🧩</div>
            <h3 className="font-montserrat font-bold text-blue-400 text-lg mb-2">ИИ загадывает</h3>
            <p className="text-muted-foreground text-sm">ИИ придумал слово — угадай его по категории</p>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "result") {
    const won = subMode === "ai-guesses" ? !aiWon : playerWon;
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-scale-in">
        <div className="text-7xl mb-6">{won ? "🏆" : "🤖"}</div>
        <h2 className="font-montserrat font-black text-4xl text-foreground mb-2">
          {won ? "Ты победил!" : subMode === "ai-guesses" ? "ИИ угадал!" : "Не угадал"}
        </h2>
        <p className="text-muted-foreground mb-4">
          Загаданное слово: <span className="font-bold text-foreground">
            {subMode === "ai-guesses" ? secretData.word : wordData.word}
          </span>
        </p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
          <span className="text-amber-400 font-bold text-xl">+{won ? 80 : 20} XP</span>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => subMode === "ai-guesses" ? startAiMode() : startPlayerMode()}
            className="bg-amber-500 text-black font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Ещё раз
          </button>
          <button onClick={() => setGameState("ready")} className="border border-border text-foreground font-medium px-8 py-3 rounded-xl hover:bg-secondary transition-colors">
            Сменить режим
          </button>
        </div>
      </div>
    );
  }

  // AI guesses — player gives hints
  if (gameState === "playing-ai") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setGameState("ready")} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Твоё слово</div>
            <div className="font-montserrat font-black text-2xl text-foreground">{secretData.word}</div>
          </div>
          <div className="text-amber-400 font-bold text-sm">{hintIndex}/{secretData.hints.length} подсказок</div>
        </div>

        <div className="bg-card border border-amber-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Icon name="Bot" size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="font-semibold text-foreground">ИИ думает...</div>
              <div className="text-xs text-muted-foreground">Давай подсказки, чтобы он угадал</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 min-h-[52px] flex items-center">
            <span className="text-amber-300 font-medium">
              {aiGuess || "Жду первую подсказку..."}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-sm text-muted-foreground font-medium">Готовые подсказки (жми по очереди):</div>
          {secretData.hints.map((hint, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                i < hintIndex
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : i === hintIndex
                  ? "border-border bg-card text-foreground"
                  : "border-border/50 bg-card/50 text-muted-foreground/50"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                i < hintIndex ? "border-amber-400 bg-amber-400/20 text-amber-400" :
                i === hintIndex ? "border-foreground text-foreground" : "border-muted"
              }`}>
                {i < hintIndex ? "✓" : i + 1}
              </div>
              <span className={i > hintIndex ? "blur-sm select-none" : ""}>{hint}</span>
            </div>
          ))}
        </div>

        {hintIndex < secretData.hints.length && (
          <button
            onClick={giveHint}
            disabled={aiThinking}
            className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {aiThinking ? "ИИ думает..." : `Дать подсказку ${hintIndex + 1}`}
          </button>
        )}
      </div>
    );
  }

  // Player guesses AI's word
  if (gameState === "playing-player") {
    const lettersRevealed = Math.floor(wordData.word.length / 2);
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setGameState("ready")} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Категория</div>
            <div className="font-montserrat font-bold text-lg text-blue-400">{wordData.category}</div>
          </div>
          <div className="text-muted-foreground text-sm">{playerAttempts.length}/{maxAttempts}</div>
        </div>

        <div className="bg-card border border-blue-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Bot" size={16} className="text-blue-400" />
            <span className="text-sm text-muted-foreground">ИИ загадал слово из {wordData.word.length} букв</span>
          </div>
          <div className="flex gap-2">
            {wordData.word.split("").map((letter, i) => (
              <div
                key={i}
                className="w-10 h-12 border border-border rounded-lg flex items-center justify-center font-montserrat font-black text-lg text-foreground bg-secondary"
              >
                {i < lettersRevealed && aiHintShown ? letter.toUpperCase() : "?"}
              </div>
            ))}
          </div>
          {!aiHintShown && playerAttempts.length >= 3 && (
            <button
              onClick={() => setAiHintShown(true)}
              className="mt-3 text-xs text-blue-400 hover:underline"
            >
              💡 Показать первые буквы (подсказка)
            </button>
          )}
        </div>

        {playerAttempts.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">Твои попытки:</div>
            <div className="flex flex-wrap gap-2">
              {playerAttempts.map((a, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    a === wordData.word.toLowerCase()
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handlePlayerGuess(); }} className="flex gap-3">
          <input
            type="text"
            value={playerGuess}
            onChange={e => setPlayerGuess(e.target.value)}
            placeholder="Введи слово..."
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={!playerGuess.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Угадать
          </button>
        </form>
      </div>
    );
  }

  return null;
}
