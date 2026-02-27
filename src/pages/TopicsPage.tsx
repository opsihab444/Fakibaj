import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChapterById, getSubjectById, getTopicsByChapter, updateTopicStatus } from '../data/mockData';
import type { Topic, Status } from '../data/mockData';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ArrowLeft, BookOpen, CheckCircle2, Play, Clock, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import type { Variants } from 'framer-motion';

const listVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const TopicsPage = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();

    const chapter = getChapterById(chapterId || '');
    const subject = chapter ? getSubjectById(chapter.subjectId) : null;

    const [topics, setTopics] = useState<Topic[]>(() => getTopicsByChapter(chapterId || ''));
    const [, forceUpdate] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleTopicStatus = useCallback((topicId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        const nextStatus: Status =
            topic.status === 'not_started' ? 'finished'
                : topic.status === 'ongoing' ? 'finished'
                    : 'not_started';

        updateTopicStatus(topicId, nextStatus);

        if (nextStatus === 'finished') {
            try {
                const audio = new Audio('/faaa.mp3');
                audio.volume = 0.7;
                audio.play();
            } catch (e) {
                // Ignore missing audio
            }
        }

        setTopics(getTopicsByChapter(chapterId || ''));
        forceUpdate(n => n + 1);
    }, [topics, chapterId]);

    const setOngoing = (topicId: string) => {
        const topic = topics.find(t => t.id === topicId);
        if (topic && topic.status !== 'finished') {
            updateTopicStatus(topicId, 'ongoing');
            setTopics(getTopicsByChapter(chapterId || ''));
        }
        navigate('/pomodoro');
    };

    if (!chapter || !subject) return <div style={{ textAlign: 'center', padding: '5rem', color: 'white' }}>চ্যাপ্টার পাওয়া যায়নি</div>;

    const completedCount = topics.filter(t => t.status === 'finished').length;
    const progressPercent = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;

    // Calculate SVG circle progress
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = Math.max(0, circumference - (progressPercent / 100) * circumference);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Link
                to={`/subject/${subject.id}`}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    textDecoration: 'none', color: 'var(--text-secondary)', marginBottom: '1.5rem',
                    transition: 'color 0.2s', fontSize: '0.9rem', fontWeight: 600,
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'white')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
                <ArrowLeft size={16} /> অধ্যায় লিস্ট
            </Link>

            {/* Immersive Hero Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                style={{
                    position: 'relative', overflow: 'hidden', padding: isMobile ? '2rem 1.5rem' : '3rem',
                    borderRadius: '24px', marginBottom: '2.5rem',
                    background: `linear-gradient(135deg, ${subject.color}20 0%, rgba(12,12,18,0.8) 100%)`,
                    border: `1px solid ${subject.color}30`,
                    boxShadow: `0 20px 40px -20px ${subject.color}40`
                }}
            >
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: `radial-gradient(circle, ${subject.color}30 0%, transparent 70%)`, filter: 'blur(50px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: `${subject.color}20`, borderRadius: '99px', color: subject.color, fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', border: `1px solid ${subject.color}40`, letterSpacing: '0.05em' }}>
                            {subject.title} • অধ্যায় {chapter.order}
                        </div>
                        <h1 style={{ fontSize: isMobile ? '2rem' : '2.8rem', margin: '0 0 1rem 0', color: 'white', lineHeight: 1.2, fontWeight: 800, letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            {chapter.title}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '600px' }}>
                            এই অধ্যায়ের সমস্ত টপিক মনযোগ দিয়ে সম্পন্ন করুন। যেকোনো টপিক শুরু করতে "পড়া শুরু করুন" বাটনে ক্লিক করুন।
                        </p>
                    </div>
                </div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', gap: '2.5rem', alignItems: 'flex-start' }}>

                {/* Left Column: Timeline list */}
                <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.4rem', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={20} color={subject.color} /> সিলেবাস টপিকসমূহ
                        </h2>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '12px' }}>
                            {topics.length} টি
                        </span>
                    </div>

                    {topics.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                            বর্তমানে এই অধ্যায়ের জন্য কোন টপিক নির্ধারিত নেই।
                        </div>
                    ) : (
                        <motion.div variants={listVariants} initial="hidden" animate="show" style={{ position: 'relative', paddingLeft: isMobile ? '1rem' : '1.5rem' }}>
                            {/* Vertical Line */}
                            <div style={{ position: 'absolute', top: '10px', bottom: '20px', left: isMobile ? '25px' : '33px', width: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', zIndex: 0 }} />

                            {topics.map((topic, index) => {
                                const isFinished = topic.status === 'finished';
                                const isOngoing = topic.status === 'ongoing';
                                const isActive = isFinished || isOngoing;

                                return (
                                    <motion.div
                                        key={topic.id}
                                        variants={itemVariants}
                                        style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
                                    >
                                        {/* Timeline Dot */}
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: '20px',
                                            background: isFinished ? subject.color : isOngoing ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                                            border: `4px solid ${isFinished ? `${subject.color}40` : isOngoing ? `rgba(245, 158, 11, 0.4)` : 'var(--glass-bg)'}`,
                                            boxShadow: isActive ? `0 0 15px ${isFinished ? subject.color : '#f59e0b'}80` : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {isFinished && <CheckCircle2 size={12} fill="white" color={subject.color} />}
                                        </div>

                                        {/* Content Card */}
                                        <motion.div
                                            className="glass-card"
                                            style={{
                                                flex: 1, overflow: 'hidden', padding: 0, cursor: 'pointer',
                                                border: isActive ? `1px solid ${isFinished ? subject.color : '#f59e0b'}40` : '1px solid var(--glass-border)',
                                                background: isActive ? `linear-gradient(90deg, rgba(20,20,30,0.8), ${isFinished ? subject.color : '#f59e0b'}05)` : 'var(--glass-bg)',
                                                boxShadow: isActive ? `0 10px 30px -10px ${isFinished ? subject.color : '#f59e0b'}30` : '0 4px 12px -6px rgba(0,0,0,0.2)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                opacity: isFinished ? 0.8 : 1
                                            }}
                                            whileHover={{ y: -3, boxShadow: `0 15px 35px -10px ${isFinished ? subject.color : 'rgba(255,255,255,0.1)'}` }}
                                            onClick={(e) => toggleTopicStatus(topic.id, e)}
                                        >
                                            <div style={{ padding: '1.25rem' }}>
                                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                                    <h3 style={{
                                                        fontSize: '1.15rem', margin: 0, fontWeight: 700, color: 'white', lineHeight: 1.4,
                                                        textDecoration: isFinished ? 'line-through' : 'none',
                                                        textDecorationColor: `${subject.color}80`
                                                    }}>
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '0.5rem' }}>{String(index + 1).padStart(2, '0')}</span>
                                                        {topic.title}
                                                    </h3>
                                                    <StatusBadge status={topic.status} color={subject.color} />
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                        <Clock size={14} /> আনুমানিক ১৫ মিনিট
                                                    </div>

                                                    {!isFinished && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setOngoing(topic.id); }}
                                                            className="primary-button"
                                                            style={{
                                                                padding: '0.5rem 1rem', fontSize: '0.8rem', background: isOngoing ? '#f59e0b' : subject.color,
                                                                display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', border: 'none'
                                                            }}
                                                        >
                                                            <Play size={14} fill="white" color="white" /> {isOngoing ? 'চালিয়ে যান' : 'পড়া শুরু করুন'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Progress indicator strip */}
                                            {isFinished && <div style={{ height: '3px', background: subject.color, width: '100%' }} />}
                                            {isOngoing && <div style={{ height: '3px', background: '#f59e0b', width: '40%', borderTopRightRadius: '3px' }} />}
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Sticky Stats & Actions */}
                <div style={{ width: isMobile ? '100%' : '340px', flexShrink: 0, position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Ring Progress Card */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(180deg, rgba(20,20,30,0.8), rgba(15,15,20,0.95))' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.5rem 0', color: 'white', fontWeight: 700, width: '100%', textAlign: 'left' }}>অধ্যায় ট্র্যাকার</h3>

                        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                                <motion.circle
                                    cx="80" cy="80" r={radius} fill="none" stroke={subject.color} strokeWidth="12" strokeLinecap="round"
                                    initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    style={{ filter: `drop-shadow(0 0 8px ${subject.color}60)` }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{Math.round(progressPercent)}<span style={{ fontSize: '1.2rem', color: subject.color }}>%</span></span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>সম্পন্ন</span>
                            </div>
                        </div>

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{completedCount}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>পড়া শেষ</div>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{topics.length - completedCount}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>বাকি আছে</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Action Card */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)', filter: 'blur(15px)', pointerEvents: 'none' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', color: '#ef4444' }}>
                                <Target size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'white', fontWeight: 700 }}>ফোকাস মোড</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                            মনোযোগ ধরে রাখতে পোমোডোরো টাইমার ব্যবহার করে পড়াশোনা করুন।
                        </p>
                        <button
                            onClick={() => navigate('/pomodoro')}
                            className="primary-button"
                            style={{ width: '100%', background: '#ef4444', color: 'white', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', border: 'none' }}
                        >
                            টাইমার ওপেন করুন <ArrowRight size={16} />
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
