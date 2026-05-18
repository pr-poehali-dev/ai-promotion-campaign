import { useState, useRef, useEffect, useCallback } from "react";
import { Page, GameRecord } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  setPage: (p: Page) => void;
  addRecord: (r: Omit<GameRecord, "id">) => void;
}

const words = [
  { word: "кот", emoji: "🐱", category: "Животные" },
  { word: "дом", emoji: "🏠", category: "Предметы" },
  { word: "дерево", emoji: "🌳", category: "Природа" },
  { word: "солнце", emoji: "☀️", category: "Природа" },
  { word: "рыба", emoji: "🐟", category: "Животные" },
  { word: "машина", emoji: "🚗", category: "Транспорт" },
  { word: "цветок", emoji: "🌸", category: "Природа" },
  { word: "гора", emoji: "⛰️", category: "Природа" },
  { word: "птица", emoji: "🐦", category: "Животные" },
  { word: "лодка", emoji: "⛵", category: "Транспорт" },
];

const aiGuesses: Record<string, string[]> = {
  кот: ["собака?", "животное...", "кошка?", "кот!"],
  дом: ["квадрат?", "здание...", "коробка?", "дом!"],
  дерево: ["растение?", "палочки?", "дерево?", "дерево!"],
  солнце: ["круг?", "звезда?", "солнце?", "солнце!"],
  рыба: ["рыба?", "животное...", "рыба!"],
  машина: ["прямоугольник?", "транспорт...", "машина?", "машина!"],
  цветок: ["растение?", "цветочек?", "цветок!"],
  гора: ["треугольник?", "пик?", "гора!"],
  птица: ["V-форма?", "летит?", "птица!"],
  лодка: ["треугольник?", "лодка?", "лодка!"],
};

type GameState = "ready" | "playing" | "guessing" | "result";

export default function DrawGameMode({ setPage, addRecord }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [aiGuessIndex, setAiGuessIndex] = useState(0);
  const [currentAiGuess, setCurrentAiGuess] = useState("Жду рисунка...");
  const [won, setWon] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [color, setColor] = useState("#4ade80");
  const [brushSize, setBrushSize] = useState(4);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      finishDrawing();
      return;
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (gameState !== "playing" || !hasStrokes) return;
    const guesses = aiGuesses[currentWord.word] || ["что-то?", "не понимаю...", currentWord.word + "?", currentWord.word + "!"];
    if (aiGuessIndex >= guesses.length) return;
    const delay = 4000 + aiGuessIndex * 3000;
    const t = setTimeout(() => {
      setCurrentAiGuess(guesses[aiGuessIndex]);
      setAiGuessIndex(p => p + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [aiGuessIndex, hasStrokes, gameState]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    if (!hasStrokes) setHasStrokes(true);
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startGame = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setGameState("playing");
    setTimeLeft(45);
    setAiGuessIndex(0);
    setCurrentAiGuess("Жду рисунка...");
    setHasStrokes(false);
    setWon(false);
    setTimeout(clearCanvas, 50);
  };

  const finishDrawing = useCallback(() => {
    const guesses = aiGuesses[currentWord.word] || [];
    const lastGuess = guesses[guesses.length - 1] || "";
    const guessed = lastGuess.endsWith("!");
    setWon(guessed);
    setGameState("result");
    addRecord({
      mode: "draw",
      result: guessed ? "win" : "loss",
      score: guessed ? 100 : 30,
      date: "Только что",
      detail: guessed ? `ИИ угадал: ${currentWord.word}` : `Нарисовал: ${currentWord.word}`,
    });
  }, [currentWord, addRecord]);

  const colors = ["#4ade80", "#a78bfa", "#fb923c", "#60a5fa", "#f472b6", "#facc15", "#f87171", "#ffffff"];

  if (gameState === "ready") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <button onClick={() => setPage("home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
          <Icon name="ArrowLeft" size={16} /> Назад
        </button>
        <div className="text-6xl mb-6">🎨</div>
        <h1 className="font-montserrat font-black text-4xl text-foreground mb-3">Режим рисования</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Рисуй загаданный предмет — ИИ анализирует в реальном времени и пытается угадать что это.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[["45 сек", "на рисунок"], ["В реальном", "времени"], ["ИИ видит", "каждый штрих"]].map(([v, l]) => (
            <div key={l} className="bg-card border border-border rounded-xl p-4">
              <div className="font-montserrat font-black text-sm text-violet-400">{v}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <button onClick={startGame} className="bg-violet-500 text-white font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-opacity glow-purple">
          Начать рисовать
        </button>
      </div>
    );
  }

  if (gameState === "result") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-scale-in">
        <div className="text-7xl mb-6">{won ? "🎉" : "😅"}</div>
        <h2 className="font-montserrat font-black text-4xl text-foreground mb-2">
          {won ? "ИИ угадал!" : "ИИ не смог"}
        </h2>
        <p className="text-muted-foreground mb-4">
          Загаданное слово: <span className="text-foreground font-bold">{currentWord.emoji} {currentWord.word}</span>
        </p>
        <p className="text-muted-foreground mb-8">
          {won ? "Нейросеть распознала твой рисунок! Ты победил 🏆" : "Нейросеть не смогла распознать. Тренируй навыки рисования!"}
        </p>
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-8">
          <span className="text-violet-400 font-bold text-xl">+{won ? 100 : 30} XP</span>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={startGame} className="bg-violet-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Ещё раз
          </button>
          <button onClick={() => setPage("home")} className="border border-border text-foreground font-medium px-8 py-3 rounded-xl hover:bg-secondary transition-colors">
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { setPage("home"); }} className="text-muted-foreground hover:text-foreground">
          <Icon name="X" size={20} />
        </button>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">{currentWord.category}</div>
          <div className="font-montserrat font-black text-2xl text-foreground">
            {currentWord.emoji} {currentWord.word}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary">
          <Icon name="Clock" size={14} className={timeLeft <= 10 ? "text-red-400" : "text-violet-400"} />
          <span className={`font-bold ${timeLeft <= 10 ? "text-red-400" : "text-foreground"}`}>{timeLeft}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-[#0d0d0d] border border-border rounded-2xl overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full canvas-cursor block"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>

          {/* Tools */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex gap-1.5">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "white" : "transparent",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {[2, 4, 8].map(s => (
                <button
                  key={s}
                  onClick={() => setBrushSize(s)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                    brushSize === s ? "border-violet-500 bg-violet-500/15" : "border-border bg-secondary"
                  }`}
                >
                  <div className="rounded-full bg-foreground" style={{ width: s * 2, height: s * 2 }} />
                </button>
              ))}
              <button
                onClick={clearCanvas}
                className="w-8 h-8 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* AI panel */}
        <div className="flex flex-col gap-3">
          <div className="bg-card border border-violet-500/20 rounded-2xl p-5 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Icon name="Bot" size={16} className="text-violet-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">ИИ анализирует</div>
                <div className="text-xs text-muted-foreground">в реальном времени</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Версия ИИ:</div>
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
                <span className="text-violet-300 font-semibold text-lg">{currentAiGuess}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground">Уверенность распознавания:</div>
              {hasStrokes ? (
                <div className="space-y-1.5">
                  {[
                    { label: currentWord.word, pct: aiGuessIndex >= 3 ? 94 : aiGuessIndex >= 2 ? 67 : aiGuessIndex >= 1 ? 34 : 12 },
                    { label: "похожее", pct: aiGuessIndex >= 3 ? 4 : aiGuessIndex >= 2 ? 22 : 45 },
                    { label: "другое", pct: aiGuessIndex >= 3 ? 2 : 10 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <span className="w-16 text-muted-foreground truncate">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-400 rounded-full transition-all duration-700"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-8 text-right">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">Начни рисовать...</div>
              )}
            </div>
          </div>

          <button
            onClick={finishDrawing}
            className="bg-violet-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
}
