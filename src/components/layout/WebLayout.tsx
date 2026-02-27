import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LibraryBig, Settings, Bell, Search, PanelLeftClose, PanelLeft, LogOut, UserCircle, Target, Trophy, Clock } from 'lucide-react';
import { LogoIcon } from '../ui/LogoIcon';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export const WebLayout = () => {
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
    const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ব্যবহারকারী';
    const userInitial = userName.charAt(0).toUpperCase();

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Exam countdown logic: March 21, 2026 at 10:00 AM
    const targetDate = new Date('2026-03-21T10:00:00');

    const calculateTimeLeft = () => {
        const difference = targetDate.getTime() - new Date().getTime();
        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24)
            };
        }
        return { days: 0, hours: 0 };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    // Update countdown and listen for sidebar avatar updates
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000 * 60); // Update every minute is enough since we only show days and hours

        if (!user) return () => clearInterval(timer);
        const key = `avatar_${user.id}`;
        const stored = localStorage.getItem(key);
        if (stored) setAvatarUrl(stored);

        const handleUpdate = () => {
            const up = localStorage.getItem(key);
            setAvatarUrl(up);
        };

        window.addEventListener('avatarUpdated', handleUpdate);
        return () => {
            window.removeEventListener('avatarUpdated', handleUpdate);
            clearInterval(timer);
        };
    }, [user]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    const sidebarWidth = sidebarOpen ? 260 : (isMobile ? 0 : 80);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.5)', zIndex: 45, backdropFilter: 'blur(4px)'
                        }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarWidth, x: (!sidebarOpen && isMobile) ? -260 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    background: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: sidebarOpen ? '2rem 1.5rem' : '2rem 0.5rem',
                    zIndex: 50,
                    overflow: 'hidden'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', paddingLeft: sidebarOpen ? '0.5rem' : '0.75rem', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))',
                        flexShrink: 0
                    }}>
                        <LogoIcon size={44} />
                    </div>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }} className="text-gradient">
                                ফাঁকি<span style={{ color: '#10b981' }}>বাজ</span>
                            </h1>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.15em', marginTop: '-1px' }}>অনলাইন একাডেমি</span>
                        </motion.div>
                    )}
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, alignItems: sidebarOpen ? 'stretch' : 'center' }}>
                    {sidebarOpen && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, margin: '1rem 0 0.5rem 0.5rem' }}>মেনু</div>}

                    <NavLink to="/" end style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1rem', borderRadius: '12px',
                        color: isActive ? '#34d399' : 'var(--text-secondary)',
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        textDecoration: 'none', fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s ease',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center'
                    })}>
                        <LayoutDashboard size={22} style={{ flexShrink: 0 }} />
                        {sidebarOpen && <span style={{ whiteSpace: 'nowrap', fontSize: '1.05rem' }}>ড্যাশবোর্ড</span>}
                    </NavLink>

                    <NavLink to="/subjects" style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1rem', borderRadius: '12px',
                        color: isActive ? '#34d399' : 'var(--text-secondary)',
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        textDecoration: 'none', fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s ease',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center'
                    })}>
                        <LibraryBig size={22} style={{ flexShrink: 0 }} />
                        {sidebarOpen && <span style={{ whiteSpace: 'nowrap', fontSize: '1.05rem' }}>বিষয় ও সিলেবাস</span>}
                    </NavLink>

                    <NavLink to="/leaderboard" style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1rem', borderRadius: '12px',
                        color: isActive ? '#34d399' : 'var(--text-secondary)',
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        textDecoration: 'none', fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s ease',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center'
                    })}>
                        <Trophy size={22} style={{ flexShrink: 0 }} />
                        {sidebarOpen && <span style={{ whiteSpace: 'nowrap', fontSize: '1.05rem' }}>লিডারবোর্ড</span>}
                    </NavLink>

                    <NavLink to="/pomodoro" style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1rem', borderRadius: '12px',
                        color: isActive ? '#34d399' : 'var(--text-secondary)',
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        textDecoration: 'none', fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s ease',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center'
                    })}>
                        <Clock size={22} style={{ flexShrink: 0 }} />
                        {sidebarOpen && <span style={{ whiteSpace: 'nowrap', fontSize: '1.05rem' }}>পোমোডোরো</span>}
                    </NavLink>

                    <NavLink to="/profile" style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1rem', borderRadius: '12px',
                        color: isActive ? '#34d399' : 'var(--text-secondary)',
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        textDecoration: 'none', fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s ease',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center'
                    })}>
                        <UserCircle size={22} style={{ flexShrink: 0 }} />
                        {sidebarOpen && <span style={{ whiteSpace: 'nowrap', fontSize: '1.05rem' }}>প্রোফাইল</span>}
                    </NavLink>
                </nav>

                <div style={{
                    padding: sidebarOpen ? '1rem' : '0.75rem',
                    background: 'rgba(16, 185, 129, 0.04)',
                    borderRadius: '14px',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    marginTop: '0.5rem',
                    flexShrink: 0
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.85rem',
                        flexShrink: 0,
                        overflow: 'hidden',
                        boxShadow: '0 0 0 2px rgba(6, 6, 9, 1), 0 0 0 4px rgba(16, 185, 129, 0.3)'
                    }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : userInitial}
                    </div>
                    {sidebarOpen && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                            <div style={{ fontSize: '0.65rem', color: '#34d399', whiteSpace: 'nowrap', fontWeight: 600, letterSpacing: '0.05em' }}>✦ প্রো মেম্বার</div>
                        </div>
                    )}
                    {sidebarOpen && (
                        <button
                            onClick={signOut}
                            title="লগ আউট"
                            style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                borderRadius: '10px',
                                padding: '0.45rem',
                                cursor: 'pointer',
                                color: '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <motion.div
                initial={false}
                animate={{ marginLeft: isMobile ? 0 : sidebarWidth }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}
            >
                {/* Topbar */}
                <header style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.5rem',
                    background: 'rgba(5, 5, 8, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--glass-border)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'color 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#34d399'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            {sidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
                        </button>

                        {!isMobile && (
                            <div style={{ position: 'relative', width: '350px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="কোর্স, টপিক বা এলাকা খুঁজুন..."
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        padding: '0.75rem 1rem 0.75rem 2.8rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>
                        )}

                        {/* Countdown Badge */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '99px',
                            color: '#10b981',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            marginLeft: isMobile ? 0 : '1rem'
                        }}>
                            <Target size={14} /> এসএসসি ২০২৬: {timeLeft.days.toLocaleString('bn-BD')} দিন {timeLeft.hours.toLocaleString('bn-BD')} ঘণ্টা
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        {isMobile && <Search size={20} color="var(--text-secondary)" />}
                        <button
                            onClick={() => navigate('/notifications')}
                            style={{ background: 'transparent', border: 'none', color: location.pathname === '/notifications' ? '#34d399' : 'var(--text-secondary)', cursor: 'pointer', position: 'relative' }}
                        >
                            <Bell size={20} />
                            <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            style={{ background: 'transparent', border: 'none', color: location.pathname === '/settings' ? '#34d399' : 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <main style={{ padding: isMobile ? '1.5rem' : '2rem', flex: 1, maxWidth: '100vw', overflowX: 'hidden' }}>
                    <AnimatePresence mode="wait">
                        <Outlet />
                    </AnimatePresence>
                </main>
            </motion.div>
        </div>
    );
};
