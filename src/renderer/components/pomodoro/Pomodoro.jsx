import React, { useEffect, useMemo, useRef, useState } from 'react';

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const PhaseBadge = ({ phase }) => {
  const label = phase === 'work' ? 'Work' : phase === 'shortBreak' ? 'Short Break' : 'Long Break';
  const color = phase === 'work' ? 'var(--accent-primary)' : 'var(--success)';
  return (
    <span className="px-2 py-1 text-xs rounded font-medium" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color }}>
      {label}
    </span>
  );
};

const Pomodoro = () => {
  const [cfg, setCfg] = useState({ workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, autoStartNext: true });
  const [phase, setPhase] = useState('work'); // work | shortBreak | longBreak
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef(null);

  // Load initial config from main
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const appCfg = await window.electronAPI.getPomodoroConfig();
        if (mounted && appCfg) {
          setCfg(prev => ({ ...prev, ...appCfg }));
          setSecondsLeft((appCfg.workMinutes || 25) * 60);
        }
      } catch {
        // no-op
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Global shortcut toggle handler
  useEffect(() => {
    const handler = () => {
      if (running) pause(); else start();
    };
    try { window.electronAPI.onPomodoroToggleStartPause(handler); } catch {
      // no-op
    }
    return () => { try { window.electronAPI.removePomodoroToggleStartPauseListener(handler); } catch {
      // no-op
    } };
  }, [running]);

  const currentPhaseMinutes = useMemo(() => {
    if (phase === 'work') return cfg.workMinutes;
    if (phase === 'shortBreak') return cfg.shortBreakMinutes;
    return cfg.longBreakMinutes;
  }, [phase, cfg]);

  const start = () => {
    if (running) return;
    setRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);
          handlePhaseComplete();
          return 0;
        }
        const next = prev - 1;
        try { window.electronAPI.pomodoroSetIndicator(`${formatTime(next)} ${phase === 'work' ? '• Work' : phase === 'shortBreak' ? '• Short' : '• Long'}`); } catch {
          // no-op
        }
        return next;
      });
    }, 1000);
    try { window.electronAPI.pomodoroSetIndicator(`${formatTime(secondsLeft)} ${phase === 'work' ? '• Work' : phase === 'shortBreak' ? '• Short' : '• Long'}`); } catch {
      // no-op
    }
  };

  const pause = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    try { window.electronAPI.pomodoroSetIndicator(''); } catch {
      // no-op
    }
  };

  const reset = () => {
    pause();
    setSecondsLeft(currentPhaseMinutes * 60);
  };

  const switchPhase = (nextPhase) => {
    setPhase(nextPhase);
    setSecondsLeft((nextPhase === 'work' ? cfg.workMinutes : nextPhase === 'shortBreak' ? cfg.shortBreakMinutes : cfg.longBreakMinutes) * 60);
    if (cfg.autoStartNext) setTimeout(start, 300);
  };

  const notify = async (title, body) => {
    try { await window.electronAPI.pomodoroNotify(title, body); } catch {
      // no-op
    }
  };

  const handlePhaseComplete = async () => {
    if (phase === 'work') {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      const isLong = nextCount % (cfg.sessionsBeforeLongBreak || 4) === 0;
      await notify('Pomodoro complete', isLong ? 'Time for a long break' : 'Time for a short break');
      switchPhase(isLong ? 'longBreak' : 'shortBreak');
    } else {
      await notify('Break finished', 'Back to work');
      switchPhase('work');
    }
  };

  const saveCfg = async (partial) => {
    const merged = { ...cfg, ...partial };
    setCfg(merged);
    try { await window.electronAPI.updatePomodoroConfig(merged); } catch {
      // no-op
    }
    // If we change the length while idle, reset timer to reflect new length
    if (!running) setSecondsLeft((phase === 'work' ? merged.workMinutes : phase === 'shortBreak' ? merged.shortBreakMinutes : merged.longBreakMinutes) * 60);
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto card">
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Pomodoro</h2>
          <PhaseBadge phase={phase} />
        </div>

        <div className="flex flex-col items-center gap-6 py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="text-6xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              {formatTime(secondsLeft)}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sessions completed: {completedSessions}
            </div>
          </div>
          <div className="flex gap-3">
            {!running ? (
              <button onClick={start} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>Start</button>
            ) : (
              <button onClick={pause} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: 'var(--warning)', color: 'white' }}>Pause</button>
            )}
            <button onClick={reset} className="px-4 py-2 rounded-lg font-medium" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>Reset</button>
          </div>
          <div className="flex gap-2 mt-2">
            {[{ w:25,s:5,l:15 },{ w:50,s:10,l:20 },{ w:90,s:15,l:30 }].map((p, i) => (
              <button key={i}
                onClick={() => saveCfg({ workMinutes: p.w, shortBreakMinutes: p.s, longBreakMinutes: p.l })}
                className="px-2 py-1 rounded border text-xs"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                {p.w}/{p.s}/{p.l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Work (minutes)</label>
            <input type="number" min="1" value={cfg.workMinutes}
              onChange={(e) => saveCfg({ workMinutes: Math.max(1, parseInt(e.target.value) || 25) })}
              className="w-full rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Short Break (minutes)</label>
            <input type="number" min="1" value={cfg.shortBreakMinutes}
              onChange={(e) => saveCfg({ shortBreakMinutes: Math.max(1, parseInt(e.target.value) || 5) })}
              className="w-full rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Long Break (minutes)</label>
            <input type="number" min="1" value={cfg.longBreakMinutes}
              onChange={(e) => saveCfg({ longBreakMinutes: Math.max(1, parseInt(e.target.value) || 15) })}
              className="w-full rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Sessions before long break</label>
            <input type="number" min="1" value={cfg.sessionsBeforeLongBreak}
              onChange={(e) => saveCfg({ sessionsBeforeLongBreak: Math.max(1, parseInt(e.target.value) || 4) })}
              className="w-full rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto-start next phase</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Automatically start the next session or break</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={!!cfg.autoStartNext}
                onChange={(e) => saveCfg({ autoStartNext: e.target.checked })} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;

