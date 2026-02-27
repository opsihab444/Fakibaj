import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapterById, getSubjectById, getTopicsByChapter, updateTopicStatus } from '../data/mockData';
import type { Topic, Status } from '../data/mockData';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import type { Variants } from 'framer-motion';

const listVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const TopicsPage = () => {
    const { chapterId } = useParams();

    const chapter = getChapterById(chapterId || '');
    const subject = chapter ? getSubjectById(chapter.subjectId) : null;

    const [topics, setTopics] = useState<Topic[]>(() => getTopicsByChapter(chapterId || ''));
    const [, forceUpdate] = useState(0);

    const toggleTopicStatus = useCallback((topicId: string) => {
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        const nextStatus: Status =
            topic.status === 'not_started' ? 'finished'
                : topic.status === 'ongoing' ? 'finished'
                    : 'not_started';

        updateTopicStatus(topicId, nextStatus);

        // Play funny sound when marking as done
        if (nextStatus === 'finished') {
            try {
                const audio = new Audio('/faaa.mp3');
                audio.volume = 0.7;
                audio.play();
            } catch (e) {
                // silently fail if audio can't play
            }
        }

        // Refresh local state
        setTopics(getTopicsByChapter(chapterId || ''));
        forceUpdate(n => n + 1);
    }, [topics, chapterId]);

    if (!chapter || !subject) return <div style={{ textAlign: 'center', padding: '5rem', color: 'white' }}>চ্যাপ্টার পাওয়া যায়নি</div>;

    const completedCount = topics.filter(t => t.status === 'finished').length;
    const progressPercent = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ marginBottom: '3rem' }}>
                <Link
                    to={`/subject/${subject.id}`}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        textDecoration: 'none', color: subject.color, marginBottom: '2rem',
                        transition: 'background-color 0.2s', fontSize: '0.9rem', fontWeight: 600,
                        background: `${subject.color}15`, padding: '0.5rem 1rem', borderRadius: '99px'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = `${subject.color}25`)}
                    onMouseOut={(e) => (e.currentTarget.style.background = `${subject.color}15`)}
                >
                    <ArrowLeft size={16} /> অধ্যায় লিস্টে ফিরে যান
                </Link>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white', lineHeight: 1.3 }}>{chapter.title}</h1>
                <p style={{ color: subject.color, fontSize: '1.1rem', marginBottom: '2rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                    {subject.title} • অধ্যায় {chapter.order}
                </p>

                <div className="glass-panel" style={{ maxWidth: '600px', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: `1px solid ${subject.color}30`, background: `linear-gradient(135deg, rgba(12,12,18,0.7), ${subject.color}0a)` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '1rem', fontWeight: 600 }}>
                        <span>অধ্যায় অগ্রগতি</span>
                        <span style={{ color: subject.color }}>{completedCount} / {topics.length} টি টপিক সম্পন্ন</span>
                    </div>
                    <ProgressBar progress={progressPercent} showLabel={false} color={subject.color} />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    সিলেবাসের টপিকসমূহ ({topics.length} টি)
                </h2>

                <motion.div variants={listVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {topics.map((topic, index) => (
                        <motion.div
                            key={topic.id}
                            variants={itemVariants}
                            className="glass-card"
                            style={{
                                padding: '1.25rem 1.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1.5rem',
                                cursor: 'pointer',
                                borderLeft: topic.status === 'finished'
                                    ? `4px solid ${subject.color}`
                                    : '4px solid var(--glass-border)',
                                background: topic.status === 'finished' ? `${subject.color}10` : 'var(--glass-bg)',
                                boxShadow: topic.status === 'finished'
                                    ? `-4px 0 15px -8px ${subject.color}a0, 0 4px 12px -6px rgba(0,0,0,0.3)`
                                    : '0 4px 12px -6px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                            whileHover={{
                                x: 3,
                                boxShadow: topic.status === 'finished'
                                    ? `-6px 0 20px -8px ${subject.color}, 0 8px 16px -8px rgba(0,0,0,0.4)`
                                    : '0 8px 16px -8px rgba(0,0,0,0.4)'
                            }}
                            onClick={() => toggleTopicStatus(topic.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '0.85rem', fontWeight: 700,
                                    color: topic.status === 'finished' ? subject.color : 'var(--text-secondary)',
                                    width: '28px', textAlign: 'center', flexShrink: 0
                                }}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <div style={{
                                    color: topic.status === 'finished' ? subject.color : 'var(--text-secondary)',
                                    background: topic.status === 'finished' ? `${subject.color}20` : 'rgba(255,255,255,0.05)',
                                    padding: '0.65rem', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'all 0.25s'
                                }}>
                                    {topic.status === 'finished' ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{
                                        fontSize: '1.05rem', margin: 0, fontWeight: 600, color: 'white',
                                        lineHeight: 1.5,
                                        textDecoration: topic.status === 'finished' ? 'line-through' : 'none',
                                        opacity: topic.status === 'finished' ? 0.7 : 1
                                    }}>
                                        {topic.title}
                                    </h3>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                <StatusBadge status={topic.status} color={subject.color} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {topics.length === 0 && (
                    <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                        বর্তমানে এই অধ্যায়ের জন্য কোন টপিক নির্ধারিত নেই।
                    </div>
                )}
            </div>
        </motion.div>
    );
};
