import { useEffect, useRef, useState } from "react";
import Navigation from "~/components/Navigation";

import pomodoroStyles from "~/styles/pomodoro.css";
import navStyles from "~/styles/navigation.css";

export default function Pomodoro() {
  const [pomodoroLength, setPomodoroLength] = useState(25); // minutes
  const [pauseLength, setPauseLength] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(pomodoroLength * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPomodoroSession, setIsPomodoroSession] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Update timeLeft when lengths change and timer is not running
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft((isPomodoroSession ? pomodoroLength : pauseLength) * 60);
    }
  }, [pomodoroLength, pauseLength, isPomodoroSession, isRunning]);
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Session end, switch
            if (isPomodoroSession) {
              setIsPomodoroSession(false);
              return pauseLength * 60;
            } else {
              setIsPomodoroSession(true);
              return pomodoroLength * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, isPomodoroSession, pomodoroLength, pauseLength]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft((isPomodoroSession ? pomodoroLength : pauseLength) * 60);
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleRestart = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsPomodoroSession(true);
    setTimeLeft(pomodoroLength * 60);
  };

  return (
    <>
      <Navigation currentPage={"/pomodoro"} />
      <main>
        <div id="pomodoro">
          <h1>Pomodoro</h1>
          <label htmlFor="pomodoro-length">
            Duración del pomodoro (minutos)
            
          </label>
          <input
              type="number"
              id="pomodoro-length"
              min={1}
              max={60}
              value={pomodoroLength}
              onChange={(e) => {
                const val = Math.min(60, Math.max(1, Number(e.target.value)));
                setPomodoroLength(val);
              }}
              disabled={isRunning}
              aria-label="Pomodoro length in minutes"
            />
          <br></br>
          <label htmlFor="pause-length">
            Duración de la pausa (minutos)
          </label>
          <input
              type="number"
              id="pause-length"
              min={1}
              max={30}
              value={pauseLength}
              onChange={(e) => {
                const val = Math.min(30, Math.max(1, Number(e.target.value)));
                setPauseLength(val);
              }}
              disabled={isRunning}
              aria-label="Pause length in minutes"
            />
          <div className="session-type" aria-live="polite">
            {isPomodoroSession ? "Sesión de concentración" : "Sesión de pausa"}
          </div>
          <div
            className="timer-display"
            role="timer"
            aria-live="assertive"
            aria-atomic="true"
          >
            {formatTime(timeLeft)}
          </div>
          <div className="buttons">
            {!isRunning || isPaused ? (
              <button onClick={handleStart} aria-label="Start timer">
                Empezar
              </button>
            ) : (
              <button onClick={handlePause} aria-label="Pause timer">
                Pausar
              </button>
            )}
            <button onClick={handleRestart} aria-label="Restart timer">
              Reiniciar
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export function links() {
  return [
    { rel: "stylesheet", href: pomodoroStyles },
    { rel: "stylesheet", href: navStyles },
  ];
}
