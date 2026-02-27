import { useNavigate } from 'react-router-dom';
import { getSubjects } from '../data/mockData';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
    BookOpen, Sparkles, Atom, FlaskConical, Leaf, Calculator,
    Sprout, Globe, FileText, Heart, MapPin, Monitor, PenTool
} from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

const iconMap: Record<string, React.ReactNode> = {
    Atom: <Atom size={28} />,
    FlaskConical: <FlaskConical size={28} />,
    Leaf: <Leaf size={28} />,
    Calculator: <Calculator size={28} />,
    Sprout: <Sprout size={28} />,
    BookOpen: <BookOpen size={28} />,
    Globe: <Globe size={28} />,
    FileText: <FileText size={28} />,
    Heart: <Heart size={28} />,
    MapPin: <MapPin size={28} />,
    Monitor: <Monitor size={28} />,
    PenTool: <PenTool size={28} />,
};

import type { Variants } from 'framer-motion';

const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07
        }
    }
};

const itemVars: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const SubjectsPage = () => {
    const subjects = getSubjects();
    const navigate = useNavigate();

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    };

    const totalTopics = subjects.reduce((sum, s) => sum + s.totalChapters, 0);
    const avgProgress = subjects.length > 0
        ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
        >
            <header style={{ marginBottom: '2rem', position: 'relative' }}>
                <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '99px', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}
                >
                    <Sparkles size={14} /> এসএসসি ২০২৬ শর্ট সিলেবাস
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ fontSize: '2.5rem', marginBottom: '0.5rem', lineHeight: 1.3, letterSpacing: '-0.02em' }}
                >
                    <span className="text-gradient">সিলেবাস</span> এক্সপ্লোর করুন
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '550px', lineHeight: 1.7, marginBottom: '1.5rem' }}
                >
                    মোট {subjects.length} টি বিষয় • {totalTopics} টি অধ্যায় • গড় অগ্রগতি {avgProgress}%
                </motion.p>
            </header>

            <motion.div
                variants={containerVars}
                initial="hidden"
                animate="show"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem'
                }}
            >
                {subjects.map((subject) => (
                    <motion.div
                        key={subject.id}
                        variants={itemVars}
                        className="glass-card pattern-overlay"
                        style={{
                            padding: '1.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '230px',
                            background: `linear-gradient(145deg, rgba(12, 12, 18, 0.8) 0%, ${subject.color}08 100%)`,
                            borderTop: `2px solid ${subject.color}40`,
                            borderBottom: '1px solid var(--glass-border)',
                            borderLeft: '1px solid var(--glass-border)',
                            borderRight: '1px solid var(--glass-border)',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        }}
                        whileHover={{
                            y: -6,
                            boxShadow: `0 20px 40px -15px ${subject.color}40`,
                            borderColor: `${subject.color}60`,
                            background: `linear-gradient(145deg, rgba(18, 18, 26, 0.9) 0%, ${subject.color}15 100%)`,
                        }}
                        onClick={() => navigate(`/subject/${subject.id}`)}
                        onMouseMove={handleMouseMove}
                    >
                        <div className="glass-card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '14px',
                                    backgroundColor: `${subject.color}12`,
                                    color: subject.color,
                                    boxShadow: `0 0 15px ${subject.color}15`
                                }}>
                                    {iconMap[subject.icon] || <BookOpen size={28} />}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.7rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        {subject.totalChapters} টি অধ্যায়
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                                        কোড: {subject.code}
                                    </div>
                                </div>
                            </div>

                            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'white', lineHeight: 1.3 }}>{subject.title}</h2>
                            <p style={{
                                color: 'var(--text-secondary)',
                                marginBottom: '1.25rem',
                                flex: 1,
                                lineHeight: 1.6,
                                fontSize: '0.8rem'
                            }}>
                                {subject.description}
                            </p>

                            <div style={{ marginTop: 'auto' }}>
                                <ProgressBar progress={subject.progress} color={subject.color} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};
