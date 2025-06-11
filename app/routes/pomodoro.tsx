import { useEffect, useRef, useState } from "react";

import pomodoroStyles from "~/styles/pomodoro.css";
import navStyles from "~/styles/navigation.css";


type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

const defaultDurations = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function Pomodoro() {
  const [durations, setDurations] = useState({
    pomodoro: defaultDurations.pomodoro,
    shortBreak: defaultDurations.shortBreak,
    longBreak: defaultDurations.longBreak,
  });

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(durations.pomodoro);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(durations[mode]);
    setIsRunning(false);
  }, [mode, durations]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            // If currently pomodoro, switch UI to short break paused
            if (mode === "pomodoro") {
              setMode("shortBreak");
              // Do not start short break automatically
              setIsRunning(false);
              return durations.shortBreak;
            } else {
              // For other modes, just stop timer at 0
              setIsRunning(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, durations.shortBreak]);

  // Format seconds as MM:SS
  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Handlers for inputs change (in minutes)
  function handleDurationChange(e: React.ChangeEvent<HTMLInputElement>, type: TimerMode) {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    setDurations((d) => ({ ...d, [type]: val * 60 }));
  }

  return (
    <div className="pomodoro">
        <h3>Pomodoro</h3>
        <div className="pomodoro__mode-buttons" role="tablist" aria-label="Timer Modes">
          <button
            role="tab"
            aria-selected={mode === "pomodoro"}
            aria-controls="timer"
            id="mode-pomodoro"
            className={mode === "pomodoro" ? "active" : ""}
            onClick={() => setMode("pomodoro")}
            disabled={isRunning}
          >
            Pomodoro
          </button>
          <button
            role="tab"
            aria-selected={mode === "shortBreak"}
            aria-controls="timer"
            id="mode-shortBreak"
            className={mode === "shortBreak" ? "active" : ""}
            onClick={() => setMode("shortBreak")}
            disabled={isRunning}
          >
            Pausa Corta
          </button>
          <button
            role="tab"
            aria-selected={mode === "longBreak"}
            aria-controls="timer"
            id="mode-longBreak"
            className={mode === "longBreak" ? "active" : ""}
            onClick={() => setMode("longBreak")}
            disabled={isRunning}
          >
            Pausa larga
          </button>
        </div>
        <div
          id="timer"
          role="timer"
          aria-live="polite"
          className="pomodoro__timer-display"
          aria-label={`Time left in ${mode === "pomodoro" ? "Pomodoro" : mode === "shortBreak" ? "Short Break" : "Long Break"} mode`}
        >
          {formatTime(timeLeft)}
        </div>
        <div className="pomodoro__controls">
          {isRunning ? (
            <button onClick={() => setIsRunning(false)} aria-label="Pause Timer">
              Pausar
            </button>
          ) : (
            <button
              onClick={() => {
                if (timeLeft === 0) {
                  setTimeLeft(durations[mode]);
                }
                setIsRunning(true);
              }}
              aria-label="Start Timer"
              disabled={timeLeft === 0}
            >
              Empezar
            </button>
          )}
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(durations[mode]);
            }}
            aria-label="Reset Timer"
          >
            Reiniciar
          </button>
        </div>
        <div className="pomodoro__duration-inputs" aria-label="Set durations in minutes">
          <label htmlFor="pomodoro-duration">
            Pomodoro (min):
            <input
              id="pomodoro-duration"
              type="number"
              min={1}
              value={Math.floor(durations.pomodoro / 60)}
              onChange={(e) => handleDurationChange(e, "pomodoro")}
              disabled={isRunning}
              aria-describedby="pomodoro-desc"
            />
          </label>
          <br></br>
          <label htmlFor="shortBreak-duration">
            Pausa corta (min):
            <input
              id="shortBreak-duration"
              type="number"
              min={1}
              value={Math.floor(durations.shortBreak / 60)}
              onChange={(e) => handleDurationChange(e, "shortBreak")}
              disabled={isRunning}
              aria-describedby="shortBreak-desc"
            />
          </label>
          <br></br>
          <label htmlFor="longBreak-duration">
            Pausa larga (min):
            <input
              id="longBreak-duration"
              type="number"
              min={1}
              value={Math.floor(durations.longBreak / 60)}
              onChange={(e) => handleDurationChange(e, "longBreak")}
              disabled={isRunning}
              aria-describedby="longBreak-desc"
            />
          </label>
        </div>
    </div>
  );
}

export function links() {
  return [
    { rel: "stylesheet", href: pomodoroStyles },
    { rel: "stylesheet", href: navStyles },
  ];
}
