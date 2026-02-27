import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { LogoIcon } from '../components/ui/LogoIcon';

export const AuthPage = () => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && name.trim().length < 2) {
            setError('নাম কমপক্ষে ২ অক্ষর হতে হবে');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
            setLoading(false);
            return;
        }

        const result = isLogin
            ? await signIn(email, password)
            : await signUp(email, password, name);

        if (result.error) {
            const msg = result.error;
            if (msg.includes('Invalid login')) setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে');
            else if (msg.includes('already registered')) setError('এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে');
            else if (msg.includes('valid email')) setError('সঠিক ইমেইল দিন');
            else if (msg.includes('Email not confirmed') || msg.includes('not_authorized')) setError('ইমেইল যাচাই হয়নি, আবার চেষ্টা করুন');
            else setError(msg);
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#040406',
            padding: isMobile ? '0.5rem' : '2rem',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Hind Siliguri', 'Outfit', sans-serif"
        }}>
            {/* Ambient Background Glows */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                <motion.div animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)', filter: 'blur(60px)' }} />
                <motion.div animate={{ x: [0, -120, 0], y: [0, 80, 0], scale: [1, 1.4, 1] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 60%)', filter: 'blur(80px)' }} />
            </div>

            {/* Grid Pattern */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)', zIndex: 0 }} />

            {/* Main Container Split Layout */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 20 }}
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? '0' : '1rem',
                    background: 'rgba(12, 12, 16, 0.4)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    borderRadius: '32px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* ---------- LEFT COL: Branding & Hero ---------- */}
                <div style={{
                    position: 'relative',
                    padding: isMobile ? '2.5rem 1rem 1.5rem 1rem' : '4rem 3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: isMobile ? 'center' : 'center',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    textAlign: isMobile ? 'center' : 'left',
                    minHeight: isMobile ? 'auto' : '100%',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(0,0,0,0) 100%)',
                    borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.03)',
                    borderBottom: isMobile ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                    <div style={{ zIndex: 1, position: 'relative' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.8rem', marginBottom: isMobile ? '1.2rem' : '2rem' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                filter: 'drop-shadow(0 8px 15px rgba(16, 185, 129, 0.3))'
                            }}>
                                <LogoIcon size={isMobile ? 48 : 56} />
                            </div>
                            <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                                ফাঁকি<span style={{ color: '#10b981' }}>বাজ</span>
                            </h1>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <h2 style={{ fontSize: isMobile ? '1.4rem' : '2.8rem', fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: isMobile ? '0.6rem' : '1.2rem', letterSpacing: '-0.02em' }}>
                                এসএসসি ২০২৬<br />
                                <span style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    সময় মাত্র ২ মাসেরও কম!
                                </span>
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? '0.85rem' : '1.05rem', lineHeight: 1.5, maxWidth: isMobile ? '100%' : '85%', fontWeight: 400, margin: isMobile ? '0 auto' : '0' }}>
                                আর দেরি নয়। এখনই শুরু করুন আপনার সম্পূর্ণ সিলেবাস ট্র্যাকিং আর ফাটাফাটি প্রস্তুতি!
                            </p>
                        </motion.div>
                    </div>

                    {/* Floating Hero UI Elements (Hidden on mobile) */}
                    {!isMobile && (
                        <div style={{ position: 'relative', flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3rem' }}>
                            <motion.div
                                animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute', right: '5%', top: '20%',
                                    background: 'rgba(15,15,20,0.8)', padding: '1rem 1.5rem', borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 3, backdropFilter: 'blur(10px)'
                                }}
                            >
                                <div style={{ padding: '0.6rem', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', color: '#34d399' }}><Target size={20} /></div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>লক্ষ্য পূরণ</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>৮৫% সম্পন্ন</div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                style={{
                                    position: 'absolute', left: '10%', bottom: '10%',
                                    background: 'linear-gradient(135deg, rgba(20,20,30,0.9) 0%, rgba(10,10,15,0.9) 100%)', padding: '1.25rem', borderRadius: '20px',
                                    border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 20px 50px rgba(16,185,129,0.1)',
                                    display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 2, backdropFilter: 'blur(10px)'
                                }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" /><circle cx="24" cy="24" r="20" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="125" strokeDashoffset="30" strokeLinecap="round" /></svg>
                                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>৭৬%</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>পদার্থবিজ্ঞান</div>
                                    <div style={{ display: 'flex', gap: '0.3rem' }}><CheckCircle size={12} color="#10b981" /><span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>অধ্যায় ৪ সম্পন্ন</span></div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* ---------- RIGHT COL: Auth Form ---------- */}
                <div style={{ padding: isMobile ? '1.5rem 1rem 2.5rem 1rem' : '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>

                        <div style={{ marginBottom: isMobile ? '1.2rem' : '2.5rem', textAlign: isMobile ? 'center' : 'left' }}>
                            <h3 style={{ fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 800, color: 'white', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
                                স্বাগতম! 🤪
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                                আপনার অ্যাকাউন্টে {isLogin ? 'লগইন' : 'সাইন আপ'} করে শুরু করুন।
                            </p>
                        </div>

                        {/* Tab Toggle */}
                        <div style={{
                            display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '5px', marginBottom: isMobile ? '1.5rem' : '2.5rem', border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            {['লগইন', 'সাইন আপ'].map((tab, i) => {
                                const active = (i === 0 && isLogin) || (i === 1 && !isLogin);
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => { setIsLogin(i === 0); setError(''); }}
                                        style={{
                                            flex: 1, padding: isMobile ? '0.65rem' : '0.85rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                            fontSize: isMobile ? '0.85rem' : '0.95rem', fontWeight: 700, transition: 'all 0.3s ease', position: 'relative',
                                            background: 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.4)',
                                            zIndex: 1
                                        }}
                                    >
                                        {active && (
                                            <motion.div
                                                layoutId="activeTab"
                                                style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', zIndex: -1, border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                        )}
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Error Alert */}
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, scale: 0.95, height: 0 }} animate={{ opacity: 1, scale: 1, height: 'auto' }} exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: isMobile ? '0.8rem' : '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '14px', marginBottom: isMobile ? '1rem' : '1.5rem', color: '#fca5a5', fontSize: '0.85rem', fontWeight: 500 }}
                                >
                                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.25rem' }}>
                            <AnimatePresence>
                                {!isLogin && (
                                    <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} style={{ overflow: 'hidden' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '0.4rem' }}>আপনার নাম</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                            <input
                                                type="text" placeholder="যেমন: শিহাব" value={name} onChange={(e) => setName(e.target.value)}
                                                style={{ width: '100%', padding: isMobile ? '0.8rem 1rem 0.8rem 2.8rem' : '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', color: 'white', fontSize: isMobile ? '0.9rem' : '1rem', outline: 'none', transition: 'all 0.3s' }}
                                                onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(16,185,129,0.5)'; }}
                                                onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '0.4rem' }}>ইমেইল অ্যাড্রেস</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                                        style={{ width: '100%', padding: isMobile ? '0.8rem 1rem 0.8rem 2.8rem' : '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', color: 'white', fontSize: isMobile ? '0.9rem' : '1rem', outline: 'none', transition: 'all 0.3s' }}
                                        onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(16,185,129,0.5)'; }}
                                        onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>পাসওয়ার্ড</label>
                                    {isLogin && <span style={{ fontSize: '0.75rem', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}>পাসওয়ার্ড ভুলে গেছেন?</span>}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                                        style={{ width: '100%', padding: isMobile ? '0.8rem 3rem 0.8rem 2.8rem' : '1rem 3rem 1rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', color: 'white', fontSize: isMobile ? '0.9rem' : '1rem', outline: 'none', transition: 'all 0.3s', letterSpacing: showPass ? 'normal' : '2px' }}
                                        onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(16,185,129,0.5)'; }}
                                        onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex' }}>
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                type="submit" disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.01, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                style={{
                                    width: '100%', padding: isMobile ? '0.9rem' : '1.1rem', borderRadius: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: isMobile ? '0.95rem' : '1rem', fontWeight: 700,
                                    background: loading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                    marginTop: isMobile ? '0.2rem' : '0.5rem', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
                                }}
                            >
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                                ) : (
                                    <>
                                        {isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
