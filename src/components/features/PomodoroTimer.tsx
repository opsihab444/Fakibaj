import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings2, X, Focus, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PomodoroTimer = () => {
    // Timer States
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
    const [cycleCount, setCycleCount] = useState(0);

    // Settings States
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
        cyclesToLongBreak: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false
    });

    // Audio elements (using a generic web audio api beep for now)
    const playAlarm = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
            osc.start();
            osc.stop(ctx.currentTime + 1);
        } catch (e) {
            console.error('Audio play failed', e);
        }
    };

    // Main Timer Effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            playAlarm();
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Handle Timer Completion
    const handleTimerComplete = () => {
        setIsActive(false);

        if (mode === 'pomodoro') {
            const newCount = cycleCount + 1;
            setCycleCount(newCount);

            if (newCount % settings.cyclesToLongBreak === 0) {
                switchMode('longBreak');
                if (settings.autoStartBreaks) setIsActive(true);
            } else {
                switchMode('shortBreak');
                if (settings.autoStartBreaks) setIsActive(true);
            }
        } else {
            switchMode('pomodoro');
            if (settings.autoStartPomodoros) setIsActive(true);
        }
    };

    const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(settings[newMode] * 60);
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(settings[mode] * 60);
    };

    // Format Time (MM:SS)
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = 100 - ((timeLeft / (settings[mode] * 60)) * 100);

    // Color theme based on mode
    const theme = {
        pomodoro: { primary: '#ef4444', light: 'rgba(239, 68, 68, 0.1)', icon: <Focus size={18} /> },
        shortBreak: { primary: '#10b981', light: 'rgba(16, 185, 129, 0.1)', icon: <Coffee size={18} /> },
        longBreak: { primary: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)', icon: <Coffee size={18} /> }
    };

    const currentTheme = theme[mode];

    return (
        <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto', fontFamily: "'Hind Siliguri', 'Outfit', sans-serif" }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{
                    padding: '2.5rem 2rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    borderTop: `4px solid ${currentTheme.primary}`,
                    position: 'relative', overflow: 'hidden'
                }}
            >
                {/* Background Glow */}
                <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '60%', height: '60%', background: `radial-gradient(circle, ${currentTheme.light} 0%, transparent 70%)`, filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '2rem', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentTheme.primary, fontWeight: 700, padding: '0.4rem 1rem', background: currentTheme.light, borderRadius: '99px', fontSize: '0.85rem' }}>
                        {currentTheme.icon}
                        {mode === 'pomodoro' ? 'ফোকাস সেশন' : mode === 'shortBreak' ? 'ছোট বিরতি' : 'বড় বিরতি'}
                    </div>
                    <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <Settings2 size={22} />
                    </button>
                </div>

                {/* Main Timer Display */}
                <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, marginBottom: '2.5rem' }}>
                    {/* SVG Circle Progress */}
                    <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <motion.circle
                            cx="140" cy="140" r="130" fill="none" stroke={currentTheme.primary} strokeWidth="6" strokeLinecap="round"
                            initial={{ strokeDasharray: '816', strokeDashoffset: '816' }}
                            animate={{ strokeDashoffset: String(816 - (816 * progress) / 100) }}
                            transition={{ duration: 0.5, ease: 'linear' }}
                        />
                    </svg>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '5.5rem', fontWeight: 800, color: 'white', lineHeight: 1, fontFamily: 'monospace', letterSpacing: '-0.02em', textShadow: `0 0 20px ${currentTheme.light}` }}>
                            {formatTime(timeLeft)}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {mode === 'pomodoro' && `সেশন ${cycleCount % settings.cyclesToLongBreak + 1} / ${settings.cyclesToLongBreak}`}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '1rem', zIndex: 1, width: '100%', justifyContent: 'center' }}>
                    <button
                        onClick={resetTimer}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                        <RotateCcw size={22} />
                    </button>

                    <button
                        onClick={toggleTimer}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: currentTheme.primary, border: 'none', color: 'white', cursor: 'pointer', transition: 'all 0.3s', boxShadow: `0 10px 30px ${currentTheme.light}` }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        {isActive ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" style={{ marginLeft: '4px' }} />}
                    </button>

                    <div style={{ width: '60px' }} /> {/* Spacer for symmetry */}
                </div>

                {/* Mode Selectors */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '16px', zIndex: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                    {([
                        { id: 'pomodoro', label: 'পোমোডোরো' },
                        { id: 'shortBreak', label: 'ছোট বিরতি' },
                        { id: 'longBreak', label: 'বড় বিরতি' }
                    ] as const).map(m => (
                        <button
                            key={m.id}
                            onClick={() => switchMode(m.id)}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                                background: mode === m.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: mode === m.id ? 'white' : 'var(--text-secondary)'
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Quick Settings Panel Component Overlay */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="glass-panel"
                        style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '1rem', padding: '1.5rem', zIndex: 10 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>পোমোডোরো সেটিংস</h3>
                            <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ফোকাস (মিনিট)</label>
                                <input type="number" value={settings.pomodoro} onChange={e => setSettings({ ...settings, pomodoro: Number(e.target.value) })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '8px', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ছোট বিরতি</label>
                                <input type="number" value={settings.shortBreak} onChange={e => setSettings({ ...settings, shortBreak: Number(e.target.value) })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '8px', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>বড় বিরতি</label>
                                <input type="number" value={settings.longBreak} onChange={e => setSettings({ ...settings, longBreak: Number(e.target.value) })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '8px', outline: 'none' }} />
                            </div>
                        </div>

                        <button
                            onClick={() => { switchMode(mode); setShowSettings(false); }}
                            className="primary-button" style={{ width: '100%' }}
                        >
                            সেভ করুন
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
