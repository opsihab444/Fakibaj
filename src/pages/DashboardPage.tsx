import { useState, useEffect } from 'react';
import { getDashboardStats, getSubjects, getActivityChartData, getStreakData } from '../data/mockData';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Target, TrendingUp, Award, Flame, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const stagger: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

export const DashboardPage = () => {
    const stats = getDashboardStats();
    const subjects = getSubjects();
    const navigate = useNavigate();
    const activityData = getActivityChartData(7);
    const streakData = getStreakData();

    // Exam countdown logic: April 21, 2026 at 10:00 AM
    const targetDate = new Date('2026-04-21T10:00:00');
    const calculateTimeLeft = () => {
        const difference = targetDate.getTime() - new Date().getTime();
        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Custom modern SVG icons
    const SubjectsIcon = ({ color }: { color: string }) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="8" height="8" rx="2.5" stroke={color} strokeWidth="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="2.5" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <rect x="3" y="13" width="8" height="8" rx="2.5" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <rect x="13" y="13" width="8" height="8" rx="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
        </svg>
    );

    const ChaptersIcon = ({ color }: { color: string }) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 18V6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4 8H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 4V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <rect x="11" y="11" width="6" height="2" rx="1" fill={color} fillOpacity="0.4" />
            <rect x="11" y="15" width="4" height="2" rx="1" fill={color} fillOpacity="0.25" />
        </svg>
    );

    const CompletedIcon = ({ color }: { color: string }) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
            <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.2" opacity="0.4" fill={color} fillOpacity="0.08" />
            <path d="M9 12.5L11 14.5L15.5 9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const RemainingIcon = ({ color }: { color: string }) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
            <path d="M12 7V12L15 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="19" cy="5" r="2.5" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" />
            <path d="M18 5H20" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M19 4V6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );

    const quickStats = [
        { icon: SubjectsIcon, label: 'বিষয়', value: stats.totalSubjects, sub: `${stats.completedSubjects} সম্পন্ন`, color: '#14b8a6' },
        { icon: ChaptersIcon, label: 'অধ্যায়', value: stats.completedChapters, sub: `/ ${stats.totalChapters} টি`, color: '#10b981' },
        { icon: CompletedIcon, label: 'টপিক সম্পন্ন', value: stats.completedTopics, sub: `/ ${stats.totalTopics} টি`, color: '#34d399' },
        { icon: RemainingIcon, label: 'বাকি টপিক', value: stats.remainingTopics, sub: 'টি', color: '#f59e0b' },
    ];

    // Top subjects by progress
    const topSubjects = [...subjects]
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 5);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {/* Hero Header */}
            <header style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? '1.5rem' : '0', marginBottom: '2rem' }}>
                <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '99px', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}
                    >
                        <Award size={14} /> এসএসসি ২০২৬ প্রস্তুতি ট্র্যাকার
                    </motion.div>

                    <h1 style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.5rem', lineHeight: 1.3, letterSpacing: '-0.02em', color: 'white', fontWeight: 800 }}>
                        আপনার <span style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>অ্যানালিটিক্স</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '550px', lineHeight: 1.7, margin: isMobile ? '0 auto' : '0' }}>
                        আপনার সামগ্রিক শেখার অগ্রগতি ট্র্যাক করুন এবং আপনার যাত্রায় কী অর্জন করেছেন তা দেখুন।
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                        position: 'relative',
                        display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: isMobile ? 'space-between' : 'flex-start',
                        padding: '1.25rem 1.5rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.02) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        borderRadius: '24px',
                        boxShadow: '0 0 30px rgba(16, 185, 129, 0.1), inset 0 0 20px rgba(16, 185, 129, 0.02)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', opacity: 0.5, pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                            লক্ষ্যঃ এসএসসি ২০২৬
                        </span>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 0.9, fontFamily: 'monospace', textShadow: '0 0 20px rgba(16, 185, 129, 0.6)' }}>
                                {timeLeft.days.toLocaleString('bn-BD')}
                            </span>
                            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600, paddingBottom: '0.2rem' }}>দিন বাকি</span>
                        </div>
                    </div>

                    {/* Pulsing Target Icon */}
                    <div style={{ position: 'relative', zIndex: 1, width: '55px', height: '55px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)' }}>
                        <Target size={26} color="#34d399" />
                        {/* Pulsing ring animation */}
                        <motion.div
                            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                            style={{ position: 'absolute', inset: -1, borderRadius: '18px', border: '1px solid #10b981' }}
                        />
                    </div>
                </motion.div>
            </header>

            <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Quick Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {quickStats.map((stat, i) => (
                        <motion.div key={i} variants={fadeUp} className="glass-panel"
                            style={{
                                padding: isMobile ? '1rem' : '1.5rem',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: isMobile ? '0.75rem' : '1.5rem',
                                cursor: 'default',
                                border: '1px solid rgba(255, 255, 255, 0.03)',
                                background: `linear-gradient(135deg, rgba(12,12,18,0.7) 0%, rgba(12,12,18,0.4) 100%)`,
                                transition: 'all 0.3s ease'
                            }}
                            whileHover={{
                                y: -5,
                                borderColor: `${stat.color}40`,
                                boxShadow: `0 15px 35px -15px ${stat.color}40`
                            }}
                        >
                            {/* Abstract subtle glow behind icon */}
                            <div style={{
                                position: 'absolute', top: '50%', left: '0', width: '140px', height: '140px',
                                transform: 'translateY(-50%)',
                                background: `radial-gradient(circle, ${stat.color}15 0%, transparent 60%)`,
                                zIndex: 0, pointerEvents: 'none'
                            }} />

                            <div style={{ zIndex: 1, flexShrink: 0 }}>
                                <div style={{
                                    width: isMobile ? '40px' : '60px', height: isMobile ? '40px' : '60px', borderRadius: isMobile ? '12px' : '20px',
                                    background: `${stat.color}08`, color: stat.color,
                                    border: `1px solid ${stat.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 4px 20px -5px ${stat.color}30`
                                }}>
                                    {isMobile ? <stat.icon color={stat.color} style={{ transform: 'scale(0.8)' }} /> : <stat.icon color={stat.color} />}
                                </div>
                            </div>

                            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? '0rem' : '0.2rem', minWidth: 0, width: '100%' }}>
                                <span style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {stat.label}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: isMobile ? '1.3rem' : '2.2rem', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                                        {stat.value}
                                    </span>
                                    {stat.sub && (
                                        <span style={{ fontSize: isMobile ? '0.65rem' : '0.85rem', color: stat.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            {stat.sub}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Progress Banner */}
                <motion.div variants={fadeUp} className="glass-card pattern-overlay"
                    style={{
                        padding: isMobile ? '1.5rem' : '2rem 2.5rem',
                        background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
                        boxShadow: '0 0 30px rgba(16, 185, 129, 0.08)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                <Target color="#34d399" size={20} />
                                <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white', fontWeight: 700 }}>সামগ্রিক অগ্রগতি</h2>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.85rem' }}>
                                {stats.completedTopics} টি টপিক সম্পন্ন, {stats.remainingTopics} টি বাকি
                            </p>
                        </div>
                        <div style={{
                            fontSize: '3rem', fontWeight: 800, lineHeight: 1,
                            background: 'linear-gradient(135deg, #ffffff 0%, #34d399 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            {stats.overallProgress}%
                        </div>
                    </div>
                    <ProgressBar progress={stats.overallProgress} showLabel={false} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
                        <span><span style={{ color: '#34d399', fontWeight: 700 }}>{stats.completedTopics}</span> টপিক সম্পন্ন</span>
                        <span>{stats.remainingTopics} টপিক বাকি</span>
                    </div>
                </motion.div>

                {/* Middle Grid: Chart + Side Cards */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem' }}>
                    {/* Chart - Real Activity Data */}
                    <motion.div variants={fadeUp} className="glass-panel" style={{ flex: isMobile ? 'none' : 1.6, width: '100%', padding: isMobile ? '1.5rem' : '1.75rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <TrendingUp color="#10b981" size={20} />
                                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'white' }}>শেখার গতি</h3>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.8rem', borderRadius: '8px' }}>
                                গত ৭ দিন
                            </span>
                        </div>
                        {activityData.every(d => d.completed === 0) ? (
                            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                <TrendingUp size={40} strokeWidth={1} style={{ opacity: 0.3 }} />
                                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>এখনো কোনো টপিক সম্পন্ন করেননি</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>টপিক পড়ুন, এখানে আপনার গতি দেখা যাবে!</p>
                            </div>
                        ) : (
                            <div style={{ width: '100%', height: '220px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(15,15,20,0.95)', border: '1px solid var(--glass-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', fontSize: '0.85rem' }}
                                            itemStyle={{ color: '#34d399', fontWeight: 700 }}
                                            formatter={(value: any) => [`${value} টি টপিক`, 'সম্পন্ন']}
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        />
                                        <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                            {activityData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={_entry.completed > 0 ? 'url(#barGrad)' : 'rgba(255,255,255,0.05)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </motion.div>

                    {/* Side Stats Stack */}
                    <div style={{ flex: isMobile ? 'none' : 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Streak Card */}
                        <motion.div variants={fadeUp} className="glass-panel pattern-overlay"
                            style={{
                                padding: '1.5rem', flex: 1,
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(16, 185, 129, 0.05))',
                                border: '1px solid rgba(245, 158, 11, 0.12)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                                        <Flame size={20} />
                                    </div>
                                    <h3 style={{ fontSize: '1rem', margin: 0, color: 'white' }}>ধারাবাহিকতা</h3>
                                </div>
                                <Zap size={16} color="#f59e0b" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: streakData.streak > 0 ? '#f59e0b' : 'var(--text-secondary)', lineHeight: 1 }}>
                                    {streakData.streak}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {streakData.streak > 0 ? 'দিন ধরে শিখছেন' : 'দিন — আজ শুরু করুন!'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '1rem' }}>
                                {streakData.weekDays.map((d, i) => (
                                    <div key={i}
                                        style={{
                                            flex: 1, height: '6px', borderRadius: '3px',
                                            background: d.active ? 'linear-gradient(90deg, #f59e0b, #10b981)' : 'rgba(255,255,255,0.06)',
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                                {streakData.weekDays.map((d, i) => (
                                    <span key={i} style={{ fontSize: '0.55rem', color: d.active ? '#f59e0b' : 'var(--text-secondary)', flex: 1, textAlign: 'center', fontWeight: d.active ? 700 : 400 }}>{d.label}</span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Top Subjects Card */}
                        <motion.div variants={fadeUp} className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                                    <Clock size={20} />
                                </div>
                                <h3 style={{ fontSize: '1rem', margin: 0, color: 'white' }}>বিষয়ভিত্তিক অগ্রগতি</h3>
                            </div>
                            {topSubjects.map((subj, i) => (
                                <div key={subj.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '0.6rem 0',
                                        borderBottom: i < topSubjects.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/subject/${subj.id}`)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: subj.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {subj.title}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: subj.progress > 0 ? '#34d399' : 'var(--text-secondary)', fontWeight: 600, flexShrink: 0 }}>
                                        {subj.progress}%
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

            </motion.div>
        </motion.div>
    );
};
