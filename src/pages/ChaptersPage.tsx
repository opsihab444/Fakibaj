import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubjectById, getChaptersBySubject } from '../data/mockData';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ArrowLeft, Layers, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

import type { Variants } from 'framer-motion';

const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVars: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const ChaptersPage = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const subject = getSubjectById(subjectId || '');
    const chapters = getChaptersBySubject(subjectId || '');

    if (!subject) return <div style={{ textAlign: 'center', padding: '5rem', color: 'white' }}>বিষয় পাওয়া যায়নি</div>;

    const completedChapters = chapters.filter(c => c.status === 'finished').length;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    to="/subjects"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        textDecoration: 'none', color: subject.color, marginBottom: '2rem',
                        transition: 'background-color 0.2s', fontSize: '0.9rem', fontWeight: 600,
                        background: `${subject.color}15`, padding: '0.5rem 1rem', borderRadius: '99px'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = `${subject.color}25`)}
                    onMouseOut={(e) => (e.currentTarget.style.background = `${subject.color}15`)}
                >
                    <ArrowLeft size={16} /> সিলেবাসে ফিরে যান
                </Link>

                <div className="glass-panel" style={{
                    position: 'relative', overflow: 'hidden', padding: '2.5rem',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap',
                    background: `linear-gradient(135deg, rgba(12,12,18,0.8), ${subject.color}15)`,
                    borderColor: `${subject.color}30`
                }}>
                    {/* Background SVG Pattern */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${subject.color.replace('#', '%23')}' fill-opacity='0.08' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Cg/%3E%3C/svg%3E")`,
                        zIndex: 0, pointerEvents: 'none'
                    }} />

                    {/* Gradient Glow */}
                    <div style={{
                        position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '200%',
                        background: `radial-gradient(circle, ${subject.color}10 0%, transparent 60%)`,
                        zIndex: 0, pointerEvents: 'none'
                    }} />

                    <div style={{ flex: 1, minWidth: '280px', position: 'relative', zIndex: 1 }}>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', lineHeight: 1.3 }}
                        >
                            <Layers size={40} color={subject.color} /> {subject.title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                            style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.25rem', maxWidth: '700px', lineHeight: 1.6 }}
                        >
                            {subject.description}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                        >
                            <BookOpen size={14} color={subject.color} /> সাবজেক্ট কোড: <span style={{ color: 'white', fontWeight: 600 }}>{subject.code}</span>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ padding: '1.5rem', minWidth: '280px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>অগ্রগতি</span>
                            <span style={{ color: 'white' }}>{completedChapters} / {chapters.length} অধ্যায়</span>
                        </div>
                        <ProgressBar progress={subject.progress} showLabel={false} color={subject.color} />
                        <div style={{ marginTop: '1rem', fontSize: '2.5rem', fontWeight: 800, textAlign: 'right', color: subject.color }}>
                            {subject.progress}%
                        </div>
                    </motion.div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    অধ্যায়সমূহ ({chapters.length} টি)
                </h2>

                <motion.div variants={containerVars} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {chapters.map((chapter) => (
                        <motion.div
                            key={chapter.id}
                            variants={itemVars}
                            className="glass-card"
                            style={{
                                padding: '1.5rem 2rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1.5rem',
                                borderLeft: chapter.status === 'finished'
                                    ? `4px solid ${subject.color}`
                                    : chapter.status === 'ongoing'
                                        ? `4px solid ${subject.color}90`
                                        : '4px solid var(--glass-border)',
                                background: chapter.status === 'ongoing' ? `${subject.color}0a` : 'var(--glass-bg)',
                                boxShadow: chapter.status === 'finished'
                                    ? `-6px 0 20px -8px ${subject.color}a0, 0 8px 16px -8px rgba(0,0,0,0.4)`
                                    : chapter.status === 'ongoing'
                                        ? `-4px 0 15px -8px ${subject.color}60, 0 8px 16px -8px rgba(0,0,0,0.2)`
                                        : '0 8px 16px -8px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                            whileHover={{
                                x: 4,
                                boxShadow: chapter.status !== 'not_started'
                                    ? `-8px 0 25px -8px ${subject.color}, 0 12px 24px -10px rgba(0,0,0,0.5)`
                                    : '0 12px 24px -10px rgba(0,0,0,0.5)'
                            }}
                            onClick={() => navigate(`/chapter/${chapter.id}`)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '12px',
                                    background: chapter.status === 'finished' ? `${subject.color}20` : 'rgba(255,255,255,0.04)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: chapter.status === 'finished' ? subject.color : 'var(--text-secondary)',
                                    fontSize: '0.85rem', fontWeight: 800, flexShrink: 0
                                }}>
                                    {String(chapter.order).padStart(2, '0')}
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'white', lineHeight: 1.4 }}>{chapter.title}</h3>
                                        <StatusBadge status={chapter.status} color={subject.color} />
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                        {chapter.completedTopics}/{chapter.totalTopics} টপিক সম্পন্ন
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                                <div style={{ width: '120px' }}>
                                    <ProgressBar
                                        progress={chapter.totalTopics > 0 ? (chapter.completedTopics / chapter.totalTopics) * 100 : 0}
                                        showLabel={false}
                                        color={subject.color}
                                    />
                                </div>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: subject.color,
                                    transition: 'all 0.2s'
                                }}>
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {chapters.length === 0 && (
                    <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                        এই সিলেবাসের জন্য এখনও কোন অধ্যায় উপলব্ধ নেই।
                    </div>
                )}
            </div>
        </motion.div>
    );
};
