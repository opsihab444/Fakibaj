import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Target, CheckCircle } from 'lucide-react';
import { LogoIcon } from '../components/ui/LogoIcon';

const InputField = ({ icon: Icon, type, placeholder, value, onChange, label, extra, actionIcon: ActionIcon, onAction, isMobile }: any) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{label}</label>
            {extra && extra}
        </div>
        <div style={{ position: 'relative' }}>
            <Icon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', zIndex: 2 }} />
            <input
                type={type} placeholder={placeholder} value={value} onChange={onChange} required
                style={{
                    width: '100%', padding: isMobile ? '0.9rem 2.8rem 0.9rem 3rem' : '1.1rem 3rem 1.1rem 3rem',
                    background: 'rgba(20, 20, 28, 0.6)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px', color: 'white', fontSize: isMobile ? '0.9rem' : '1rem',
                    outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                    letterSpacing: type === 'password' ? '2px' : 'normal'
                }}
                onFocus={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                    e.target.style.borderColor = 'rgba(16,185,129,0.5)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1), inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
                onBlur={(e) => {
                    e.target.style.background = 'rgba(20, 20, 28, 0.6)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
            />
            {ActionIcon && (
                <button type="button" onClick={onAction} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex' }}>
                    <ActionIcon size={18} />
                </button>
            )}
        </div>
    </div>
);

export const AuthPage = () => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await signIn(loginEmail, loginPassword);
        handleResult(result);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (regName.trim().length < 2) {
            setError('নাম কমপক্ষে ২ অক্ষর হতে হবে');
            setLoading(false);
            return;
        }
        if (regPassword.length < 6) {
            setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
            setLoading(false);
            return;
        }
        const result = await signUp(regEmail, regPassword, regName);
        handleResult(result);
    };

    const handleResult = (result: any) => {
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

    // Animation Variants
    const formVariants = {
        hidden: (isLoginFlow: boolean) => ({
            opacity: 0,
            x: isLoginFlow ? -40 : 40,
            scale: 0.95,
            filter: 'blur(4px)'
        }),
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                type: 'spring', stiffness: 300, damping: 25, mass: 0.8, staggerChildren: 0.05
            }
        },
        exit: (isLoginFlow: boolean) => ({
            opacity: 0,
            x: isLoginFlow ? 40 : -40,
            scale: 0.95,
            filter: 'blur(4px)',
            transition: { duration: 0.2, ease: 'easeIn' }
        })
    } as any;


    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#040406', padding: isMobile ? '0.5rem' : '2rem', position: 'relative', overflow: 'hidden',
            fontFamily: "'Hind Siliguri', 'Outfit', sans-serif"
        }}>
            {/* Ambient Background Glows */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '10%', left: '10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)', filter: 'blur(80px)' }} />
                <motion.div animate={{ x: [0, -60, 0], y: [0, 60, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '10%', right: '10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 60%)', filter: 'blur(100px)' }} />
            </div>

            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)', zIndex: 0 }} />

            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
                style={{
                    width: '100%', maxWidth: '1000px',
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                    background: 'rgba(15, 15, 20, 0.4)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)',
                    overflow: 'hidden', position: 'relative', zIndex: 1
                }}
            >
                {/* LEFT COL: Branding & Visuals */}
                <div style={{
                    order: isMobile ? 2 : 1,
                    width: isMobile ? '100%' : '55%',
                    padding: isMobile ? '1.5rem' : '4rem',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 100%)',
                    borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    borderTop: isMobile ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    position: 'relative'
                }}>
                    {!isMobile && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.4))' }}>
                                <LogoIcon size={60} />
                            </div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.03em' }}>
                                ফাঁকি<span style={{ color: '#10b981' }}>বাজ</span>
                            </h1>
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ textAlign: isMobile ? 'center' : 'left' }}>
                        {isMobile ? (
                            <>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
                                    এসএসসি ২০২৬: <span style={{ color: '#ef4444' }}>মাত্র ২ মাসেরও কম!</span>
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>প্রস্তুতি হোক আরও স্মার্ট, আরও দ্রুত!</p>
                            </>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                                    প্রস্তুতি হোক <br />
                                    <span style={{ background: 'linear-gradient(135deg, #a7f3d0 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        আরও স্মার্ট, আরও দ্রুত!
                                    </span>
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '400px', margin: 0 }}>
                                    এসএসসি ২০২৬ এর সম্পূর্ণ সিলেবাস ট্র্যাক করুন, লিডারবোর্ডে টপে থাকুন আর ফাটিয়ে রেজাল্ট করুন।
                                </p>
                            </>
                        )}
                    </motion.div>

                    {!isMobile && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Target size={16} color="#34d399" /> <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>স্মার্ট ট্র্যাকিং</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <CheckCircle size={16} color="#34d399" /> <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>১০০% কভার</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* RIGHT COL: Dynamic Auth Forms */}
                <div style={{
                    order: isMobile ? 1 : 2,
                    width: isMobile ? '100%' : '45%',
                    padding: isMobile ? '2.5rem 1.5rem 1rem' : '4rem 3rem',
                    display: 'flex', flexDirection: 'column', position: 'relative'
                }}>
                    {isMobile && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                            <div style={{ filter: 'drop-shadow(0 0 15px rgba(16,185,129,0.3))' }}>
                                <LogoIcon size={42} />
                            </div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                                ফাঁকি<span style={{ color: '#10b981' }}>বাজ</span>
                            </h1>
                        </motion.div>
                    )}

                    {/* Advanced Toggle Switch */}
                    <div style={{
                        display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '6px',
                        marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative',
                        maxWidth: '400px', margin: '0 auto 2.5rem auto', width: '100%'
                    }}>
                        <motion.div
                            animate={{ x: isLogin ? 0 : '100%' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            style={{
                                position: 'absolute', top: 6, bottom: 6, left: 6, width: 'calc(50% - 6px)',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                                borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 0
                            }}
                        />
                        {['লগইন', 'সাইন আপ'].map((tab, i) => {
                            const active = (i === 0 && isLogin) || (i === 1 && !isLogin);
                            return (
                                <button
                                    key={tab} onClick={() => { setIsLogin(i === 0); setError(''); }}
                                    style={{
                                        flex: 1, padding: '0.85rem', borderRadius: '14px', border: 'none', cursor: 'pointer',
                                        fontSize: '0.95rem', fontWeight: 800, transition: 'all 0.3s ease',
                                        background: 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.4)',
                                        zIndex: 1, textShadow: active ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                                    }}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>

                    {/* Smooth Error Alert */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.9rem', fontWeight: 600, maxWidth: '400px', width: '100%', margin: '0 auto 1.5rem auto' }}
                            >
                                <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form Container with AnimatePresence for Complete Swapping */}
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', flex: 1, minHeight: isMobile ? '380px' : '440px' }}>
                        <AnimatePresence mode="wait" custom={isLogin}>
                            {isLogin ? (
                                /* LOGIN FORM */
                                <motion.form
                                    key="login-form"
                                    custom={true} variants={formVariants} initial="hidden" animate="visible" exit="exit"
                                    onSubmit={handleLogin}
                                    style={{ width: '100%', position: 'absolute', top: 0, left: 0 }}
                                >
                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>ফিরে আসার জন্য ধন্যবাদ! 👋</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>আপনার পড়াশোনার গিয়ার আপ করুন।</p>
                                    </div>

                                    <InputField icon={Mail} type="email" placeholder="example@email.com" label="ইমেইল অ্যাড্রেস" value={loginEmail} onChange={(e: any) => setLoginEmail(e.target.value)} isMobile={isMobile} />

                                    <InputField
                                        icon={Lock} type={showPass ? 'text' : 'password'} placeholder="••••••••" label="পাসওয়ার্ড" value={loginPassword} onChange={(e: any) => setLoginPassword(e.target.value)}
                                        extra={<span style={{ fontSize: '0.8rem', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}>ভুলে গেছেন?</span>}
                                        actionIcon={showPass ? EyeOff : Eye} onAction={() => setShowPass(!showPass)} isMobile={isMobile}
                                    />

                                    <motion.button
                                        type="submit" disabled={loading}
                                        whileHover={{ scale: loading ? 1 : 1.02, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                                        whileTap={{ scale: loading ? 1 : 0.98 }}
                                        style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.05rem', fontWeight: 800, background: loading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginTop: '2rem', transition: 'box-shadow 0.3s ease' }}
                                    >
                                        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : <><ArrowRight size={20} /> লগইন করুন</>}
                                    </motion.button>
                                </motion.form>
                            ) : (
                                /* SIGNUP FORM */
                                <motion.form
                                    key="signup-form"
                                    custom={false} variants={formVariants} initial="hidden" animate="visible" exit="exit"
                                    onSubmit={handleRegister}
                                    style={{ width: '100%', position: 'absolute', top: 0, left: 0 }}
                                >
                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>যোগ দিন এখনই! 🚀</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>নতুন অ্যাকাউন্ট তৈরি করে যাত্রা শুরু করুন।</p>
                                    </div>

                                    <InputField icon={User} type="text" placeholder="আপনার নাম" label="সম্পূর্ণ নাম" value={regName} onChange={(e: any) => setRegName(e.target.value)} isMobile={isMobile} />

                                    <InputField icon={Mail} type="email" placeholder="example@email.com" label="ইমেইল অ্যাড্রেস" value={regEmail} onChange={(e: any) => setRegEmail(e.target.value)} isMobile={isMobile} />

                                    <InputField
                                        icon={Lock} type={showPass ? 'text' : 'password'} placeholder="••••••••" label="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" value={regPassword} onChange={(e: any) => setRegPassword(e.target.value)}
                                        actionIcon={showPass ? EyeOff : Eye} onAction={() => setShowPass(!showPass)} isMobile={isMobile}
                                    />

                                    <motion.button
                                        type="submit" disabled={loading}
                                        whileHover={{ scale: loading ? 1 : 1.02, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                                        whileTap={{ scale: loading ? 1 : 0.98 }}
                                        style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.05rem', fontWeight: 800, background: loading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginTop: '2rem', transition: 'box-shadow 0.3s ease' }}
                                    >
                                        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : <><ArrowRight size={20} /> অ্যাকাউন্ট তৈরি করুন</>}
                                    </motion.button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
