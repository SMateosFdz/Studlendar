import { useState, useEffect } from 'react';

export default function Pomodoro() {
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);

  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro');
  const [cycles, setCycles] = useState(0);
  const [startTime, setStartTime] = useState(Math.floor(Date.now() / 1000));

  const getTimeLeft = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const duration = mode === 'pomodoro' ? pomodoroTime * 60 :
      mode === 'pausa corta' ? shortBreakTime * 60 :
        longBreakTime * 60;
    return Math.max(0, duration - (currentTime - startTime));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setStartTime(0);
    changeMode(mode);
  };

  const changeMode = (newMode: string) => {
    setIsActive(false);
    setMode(newMode);
    setStartTime(Math.floor(Date.now() / 1000));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (getTimeLeft() <= 0) {
          setIsActive(false);

          if (mode === 'pomodoro') {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            changeMode(newCycles % 4 === 0 ? 'pausa larga' : 'pausa corta');
          } else {
            changeMode('pomodoro');
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode, cycles]);

  const updatePomodoroTime = (value: number) => {
    setPomodoroTime(value);
    if (mode === 'pomodoro') resetTimer();
  };

  const updateShortBreakTime = (value: number) => {
    setShortBreakTime(value);
    if (mode === 'pausa corta') resetTimer();
  };

  const updateLongBreakTime = (value: number) => {
    setLongBreakTime(value);
    if (mode === 'pausa larga') resetTimer();
  };

  const timeLeft = getTimeLeft();

  return (
    <div className='pomodoro'>
      <div className='pomodoro__mode-buttons'>
        <button onClick={() => changeMode('pomodoro')}>Pomodoro</button>
        <button onClick={() => changeMode('pausa corta')}>Pausa corta</button>
        <button onClick={() => changeMode('pausa larga')}>Pausa larga</button>
      </div>

      <div className='pomodoro__container'>
        <div className='pomodoro__container--timer'>
          {isActive ?
            <h1>{formatTime(timeLeft)}</h1> :
            <h1>{mode === "pomodoro" ? pomodoroTime : mode === "pausa corta" ? shortBreakTime : longBreakTime}:00</h1>}
          <p>Modo actual: {mode}</p>
          <p>Pomodoros completados: {cycles}</p>
        </div>

        <div className='pomodoro__container--starter'>
          <button onClick={() => setIsActive(!isActive)}>
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer}>Reset</button>
        </div>

        <div className='pomodoro__container--duration-inputs'>
          <h2>Configuración</h2>
          <div>
            <label>Pomodoro: {pomodoroTime} minutos</label>
            <input
              type="range"
              min="25"
              max="120"
              value={pomodoroTime}
              onChange={(e) => updatePomodoroTime(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label>Pausa corta: {shortBreakTime} minutos</label>
            <input
              type="range"
              min="5"
              max="30"
              value={shortBreakTime}
              onChange={(e) => updateShortBreakTime(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label>Pausa larga: {longBreakTime} minutos</label>
            <input
              type="range"
              min="15"
              max="60"
              value={longBreakTime}
              onChange={(e) => updateLongBreakTime(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
