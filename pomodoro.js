import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const settings = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  cyclesBeforeLong: 4
};

export default function PomodoroApp() {
  const [mode, setMode] = useState("FOCUS");
  const [time, setTime] = useState(settings.focus);
  const [cycleCount, setCycleCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);

  const intervalRef = useRef(null);

  const formatTime = (t) => {
    const m = Math.floor(t / 60).toString().padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const nextPhase = () => {
    if (mode === "FOCUS") {
      const newCount = cycleCount + 1;
      setCycleCount(newCount);

      if (newCount === settings.cyclesBeforeLong) {
        setMode("LONG_BREAK");
        setTime(settings.longBreak);
        setCycleCount(0);
      } else {
        setMode("SHORT_BREAK");
        setTime(settings.shortBreak);
      }
    } else {
      setMode("FOCUS");
      setTime(settings.focus);
    }
  };

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            nextPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [running, paused, mode]);

  const handleStartPause = () => {
    if (!running) {
      setRunning(true);
      setPaused(false);
    } else {
      setPaused((p) => !p);
    }
  };

  const handleReset = () => {
    if (running || paused) {
      if (mode === "FOCUS") setTime(settings.focus);
      if (mode === "SHORT_BREAK") setTime(settings.shortBreak);
      if (mode === "LONG_BREAK") setTime(settings.longBreak);
      setRunning(false);
      setPaused(false);
    } else {
      setMode("FOCUS");
      setTime(settings.focus);
      setCycleCount(0);
      setRunning(false);
      setPaused(false);
    }
  };

  const progress = (() => {
    let total;
    if (mode === "FOCUS") total = settings.focus;
    if (mode === "SHORT_BREAK") total = settings.shortBreak;
    if (mode === "LONG_BREAK") total = settings.longBreak;
    return ((total - time) / total) * 100;
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-80 text-center shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">{mode.replace("_", " ")}</h2>

          <div className="relative w-40 h-40 mx-auto">
            <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#3b82f6"
                strokeWidth="10"
                fill="none"
                strokeDasharray="440"
                strokeDashoffset={440 - (progress / 100) * 440}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
              {formatTime(time)}
            </div>
          </div>

          {paused && <p className="text-gray-500">Paused</p>}

          <div className="flex gap-2 justify-center">
            <Button onClick={handleStartPause}>
              {!running ? "Start" : paused ? "Start" : "Pause"}
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            Focus cycles: {cycleCount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
