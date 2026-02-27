import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubjectById, getChaptersBySubject } from '../data/mockData';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ArrowLeft, Layers, BookOpen, ChevronRight, CheckCircle2, Play, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import type { Variants } from 'framer-motion';

const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const ChaptersPage = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const subject = getSubjectById(subjectId || '');
    const chapters = getChaptersBySubject(subjectId || '');

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    if (!subject) return <div style={{ textAlign: 'center', padding: '5rem', color: 'white' }}>বিষয় পাওয়া যায়নি</div>;

    const completedChapters = chapters.filter(c => c.status === 'finished').length;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <Link
                to="/subjects"
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    textDecoration: 'none', color: 'var(--text-secondary)', marginBottom: '1.5rem',
                    transition: 'color 0.2s', fontSize: '0.9rem', fontWeight: 600,
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'white')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
                <ArrowLeft size={16} /> সিলেবাসে ফিরে যান
            </Link>

            {/* Immersive Hero Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                style={{
                    position: 'relative', overflow: 'hidden', padding: isMobile ? '2rem 1.5rem' : '3.5rem',
                    borderRadius: '24px', marginBottom: '3rem',
                    background: `linear-gradient(135deg, ${subject.color}20 0%, rgba(12,12,18,0.9) 100%)`,
                    border: `1px solid ${subject.color}30`,
                    boxShadow: `0 20px 40px -20px ${subject.color}40`
                }}
            >
                {/* Visual Elements */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', background: `radial-gradient(circle at right, ${subject.color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', fontSize: '15rem', opacity: 0.03, zIndex: 0, pointerEvents: 'none' }}>
                    <Layers color={subject.color} />
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '2rem' }}>
                    <div style={{ flex: 1, maxWidth: '600px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: `${subject.color}20`, borderRadius: '99px', color: subject.color, fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem', border: `1px solid ${subject.color}40`, letterSpacing: '0.05em' }}>
                            <BookOpen size={14} /> সাবজেক্ট কোড: {subject.code}
                        </div>

                        <h1 style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', margin: '0 0 1rem 0', color: 'white', lineHeight: 1.1, fontWeight: 900, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${subject.color}, ${subject.color}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 10px 25px -5px ${subject.color}60` }}>
                                <Layers size={isMobile ? 24 : 32} color="white" />
                            </div>
                            {subject.title}
                        </h1>

                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '1.1rem', lineHeight: 1.6 }}>
                            {subject.description}
                        </p>
                    </div>

                    <div style={{ minWidth: isMobile ? '100%' : '280px', background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>কোর্স অগ্রগতি</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{subject.progress}<span style={{ fontSize: '1.2rem', color: subject.color }}>%</span></div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{completedChapters} <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>/ {chapters.length}</span></div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>অধ্যায় সম্পন্ন</div>
                            </div>
                        </div>
                        <ProgressBar progress={subject.progress} showLabel={false} color={subject.color} height={8} />
                    </div>
                </div>
            </motion.div>

            {/* Content Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LayoutGrid size={24} color={subject.color} /> সিলেবাসের অধ্যায়সমূহ
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1rem', borderRadius: '99px' }}>
                    মোট {chapters.length} টি
                </div>
            </div>

            <motion.div variants={containerVars} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
                {chapters.map((chapter) => {
                    const isFinished = chapter.status === 'finished';
                    const isOngoing = chapter.status === 'ongoing';
                    const progress = chapter.totalTopics > 0 ? (chapter.completedTopics / chapter.totalTopics) * 100 : 0;

                    return (
                        <motion.div
                            key={chapter.id}
                            variants={itemVars}
                            className="glass-card"
                            style={{
                                padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                height: '100%',
                                border: isFinished ? `1px solid ${subject.color}40` : isOngoing ? `1px solid ${subject.color}80` : '1px solid var(--glass-border)',
                                background: isOngoing ? `linear-gradient(180deg, rgba(20,20,30,0.9), ${subject.color}15)` : 'var(--glass-bg)',
                                boxShadow: isOngoing ? `0 10px 30px -10px ${subject.color}30` : '0 4px 12px -6px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            whileHover={{ y: -5, boxShadow: `0 20px 40px -15px ${isFinished ? subject.color : 'rgba(255,255,255,0.1)'}80`, borderColor: isFinished ? subject.color : 'rgba(255,255,255,0.2)' }}
                            onClick={() => navigate(`/chapter/${chapter.id}`)}
                        >
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '14px',
                                        background: isFinished ? `${subject.color}20` : 'rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isFinished ? subject.color : 'var(--text-secondary)',
                                        fontSize: '1.2rem', fontWeight: 900, flexShrink: 0,
                                        border: isFinished ? `1px solid ${subject.color}40` : '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {String(chapter.order).padStart(2, '0')}
                                    </div>
                                    <StatusBadge status={chapter.status} color={subject.color} />
                                </div>

                                <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', color: 'white', lineHeight: 1.4, fontWeight: 700 }}>
                                    {chapter.title}
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: 'auto' }}>
                                    <BookOpen size={16} />
                                    <span>{chapter.totalTopics} টি টপিক • আনুমানিক {chapter.totalTopics * 1.5} ঘণ্টা</span>
                                </div>

                                {/* Progress Footer */}
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem', marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>অগ্রগতি</span>
                                        <span style={{ color: 'white', fontWeight: 800 }}>{chapter.completedTopics}/{chapter.totalTopics} <span style={{ color: subject.color }}>({Math.round(progress)}%)</span></span>
                                    </div>
                                    <ProgressBar progress={progress} showLabel={false} color={subject.color} height={6} />
                                </div>
                            </div>

                            {/* Card Action Area */}
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                background: isFinished ? `${subject.color}15` : isOngoing ? `${subject.color}25` : 'rgba(255,255,255,0.02)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isFinished ? subject.color : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isFinished ? <><CheckCircle2 size={18} /> সম্পন্ন হয়েছে</> : isOngoing ? <><Play size={18} fill={subject.color} color={subject.color} /> চালিয়ে যান</> : 'শুরু করুন'}
                                </span>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                                }}>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {chapters.length === 0 && (
                <div className="glass-panel" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                    <Layers size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                    এই সিলেবাসের জন্য এখনও কোন অধ্যায় যুক্ত করা হয়নি।
                </div>
            )}
        </motion.div>
    );
};
