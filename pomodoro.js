import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Timer configuration (seconds)
 */
const settings = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  cyclesBeforeLong: 4
};

export default function PomodoroApp() {
  /**
   * STATE
   */
  const [mode, setMode] = useState("FOCUS");           // Current phase
  const [time, setTime] = useState(settings.focus);    // Remaining time
  const [cycleCount, setCycleCount] = useState(0);     // Completed focus cycles
  const [running, setRunning] = useState(false);       // Timer running
  const [paused, setPaused] = useState(false);         // Timer paused

  const intervalRef = useRef(null); // Holds interval ID

  /**
   * Format seconds → MM:SS
   */
  const formatTime = (t) => {
    const m = Math.floor(t / 60).toString().padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /**
   * Handles switching between phases
   */
  const nextPhase = () => {
    if (mode === "FOCUS") {
      const newCount = cycleCount + 1;
      setCycleCount(newCount);

      // After X cycles → long break
      if (newCount === settings.cyclesBeforeLong) {
        setMode("LONG_BREAK");
        setTime(settings.longBreak);
      } else {
        // Otherwise → short break
        setMode("SHORT_BREAK");
        setTime(settings.shortBreak);
      }

    } else if (mode === "SHORT_BREAK") {
      // After short break → focus
      setMode("FOCUS");
      setTime(settings.focus);

    } else if (mode === "LONG_BREAK") {
      // After long break → reset cycles and focus
      setCycleCount(0);
      setMode("FOCUS");
      setTime(settings.focus);
    }
  };

  /**
   * Timer loop (runs every second)
   */
  useEffect(() => {

    if (running && !paused) {

      // Prevent multiple intervals
      if (intervalRef.current) return;

      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            nextPhase(); // move to next phase
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } else {
      // Cleanup when stopped or paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

  }, [running, paused, mode]);

  /**
   * Start / Pause toggle
   */
  const handleStartPause = () => {
    if (!running) {
      setRunning(true);
      setPaused(false);
    } else {
      setPaused((p) => !p);
    }
  };

  /**
   * Reset behavior
   */
  const handleReset = () => {

    if (running || paused) {
      // Reset current mode only
      if (mode === "FOCUS") setTime(settings.focus);
      if (mode === "SHORT_BREAK") setTime(settings.shortBreak);
      if (mode === "LONG_BREAK") setTime(settings.longBreak);

      setRunning(false);
      setPaused(false);

    } else {
      // Full reset
      setMode("FOCUS");
      setTime(settings.focus);
      setCycleCount(0);
      setRunning(false);
      setPaused(false);
    }

    // Always clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /**
   * Finish → skip to next phase
   */
  const handleFinish = () => {
    setRunning(false);
    setPaused(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    nextPhase();
  };

  /**
   * Calculate progress for arc (0–100%)
   */
  const progress = (() => {
    let total;

    if (mode === "FOCUS") total = settings.focus;
    if (mode === "SHORT_BREAK") total = settings.shortBreak;
    if (mode === "LONG_BREAK") total = settings.longBreak;

    return ((total - time) / total) * 100;
  })();

  /**
   * UI
   */
  return (
    <div className="flex items-center justify-center bg-blue-500 w-[410px] h-[380px]">

      <Card className="w-full h-full text-center shadow-xl rounded-2xl">

        <CardContent className="h-full flex flex-col justify-between px-4 py-3">

          {/* MODE TITLE */}
          <h2 className="text-lg font-semibold capitalize">
            {mode.replace("_", " ").toLowerCase()}
          </h2>

          {/* TIMER + ARC */}
          <div className="flex flex-col items-center justify-center gap-1">

            <div className="relative w-36 h-36 flex items-center justify-center">

              {/* 75% ARC TIMER */}
              <svg className="absolute inset-0 transform rotate-90 w-full h-full">

                {/* Background arc */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="283 95"
                  strokeLinecap="round"
                />

                {/* Progress arc */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="283 95"
                  strokeDashoffset={283 - (progress / 100) * 283}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
                />
              </svg>

              {/* CENTER TEXT */}
              <div className="flex flex-col items-center text-center">
                <div className="text-2xl font-bold">
                  {formatTime(time)}
                </div>

                {paused && (
                  <div className="text-xs text-gray-500">
                    paused
                  </div>
                )}
              </div>
            </div>

            {/* TOMATO PROGRESS */}
            <div className="flex gap-1 text-lg">
              {Array.from({ length: settings.cyclesBeforeLong }).map((_, i) => (
                <span
                  key={i}
                  className={i < cycleCount ? "opacity-100" : "opacity-30"}
                >
                  🍅
                </span>
              ))}
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex justify-center gap-3">

            {/* Start / Pause */}
            <Button
              aria-label={running && !paused ? "Pause" : "Start"}
              onClick={handleStartPause}
              className="w-12 h-12 text-xl"
            >
              {!running || paused ? "▶️" : "⏸️"}
            </Button>

            {/* Reset */}
            <Button
              aria-label="Reset"
              variant="secondary"
              onClick={handleReset}
              className="w-12 h-12 text-xl"
            >
              ⟲
            </Button>

            {/* Finish */}
            <Button
              aria-label="Finish"
              variant="destructive"
              onClick={handleFinish}
              className="w-12 h-12 text-xl"
            >
              ⏭️
            </Button>

          </div>

          {/* FOOTER */}
          <div className="text-xs text-gray-600">
            {cycleCount} / {settings.cyclesBeforeLong} cycles
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
