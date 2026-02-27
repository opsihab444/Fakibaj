import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardUser {
    id: string;
    rank: number;
    name: string;
    score: number;
    avatar?: string;
    streak: number;
    isCurrentUser?: boolean;
}

export const LeaderboardPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetch users and their topic status count (score = completed count * 10)
                // In a real prod app, you'd calculate this via a Postgres function/view.
                // For now we'll do a simple fetch since the user base is small or we aggregate it.

                // Let's use RPC if we had it, otherwise we simulate it by fetching all completed topics 
                // and grouping by user. Since row level security might hide other users' data, 
                // we need a secure way to get leaderboard. 
                // Assuming RLS allows reading basic stats or we create a specific view/function.

                // FOR NOW: Let's fetch all users from a public aggregate we create or just show mock + current user real score.
                // To do it properly with Supabase RLS, you'd need a public view `leaderboard_view`.

                // We will simulate real data mixed with some placeholders since we don't have a public profiles table ready.

                // Let's get current user's actual score
                let currentUserScore = 0;
                let currentUserStreak = 0;
                let currentUserName = user?.user_metadata?.full_name || 'আপনি';

                if (user) {
                    const { count: topicCount } = await supabase
                        .from('user_topic_status')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .eq('status', 'finished');

                    currentUserScore = (topicCount || 0) * 10;

                    // Simple mock streak calculation for current user based on logs
                    const { data: logs } = await supabase
                        .from('user_activity_log')
                        .select('date')
                        .eq('user_id', user.id)
                        .order('date', { ascending: false })
                        .limit(30);

                    if (logs && logs.length > 0) {
                        currentUserStreak = logs.length; // rough estimate
                    }
                }

                // Generative mock data combined with real user
                const mockBase = [
                    { id: 'm1', name: 'Tarikul Islam', score: 3200, streak: 18 },
                    { id: 'm2', name: 'Ayesha Siddiqua', score: 2950, streak: 15 },
                    { id: 'm3', name: 'Mahmud Hasan', score: 2700, streak: 5 },
                    { id: 'm4', name: 'Nusrat Jahan', score: 2500, streak: 13 },
                    { id: 'm5', name: 'Rakib Hossain', score: 2300, streak: 11 },
                    { id: 'm6', name: 'Farhan Sadiq', score: 2100, streak: 7 },
                    { id: 'm7', name: 'Sumaiya Akter', score: 1950, streak: 2 },
                ];

                if (user) {
                    mockBase.push({
                        id: user.id,
                        name: currentUserName,
                        score: currentUserScore,
                        streak: currentUserStreak
                    });
                }

                // Sort by score
                mockBase.sort((a, b) => b.score - a.score);

                // Assign ranks
                const rankedUsers = mockBase.map((u, index) => ({
                    ...u,
                    rank: index + 1,
                    isCurrentUser: u.id === user?.id
                }));

                setUsers(rankedUsers);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user]);

    const getRankStyle = (rank: number) => {
        if (rank === 1) return { borderColor: 'rgba(251, 191, 36, 0.4)', background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, rgba(20,20,30,0.8) 100%)' };
        if (rank === 2) return { borderColor: 'rgba(148, 163, 184, 0.3)', background: 'linear-gradient(90deg, rgba(148, 163, 184, 0.12) 0%, rgba(20,20,30,0.8) 100%)' };
        if (rank === 3) return { borderColor: 'rgba(180, 83, 9, 0.3)', background: 'linear-gradient(90deg, rgba(180, 83, 9, 0.12) 0%, rgba(20,20,30,0.8) 100%)' };
        return { borderColor: 'rgba(255, 255, 255, 0.05)', background: 'rgba(20, 20, 30, 0.5)' };
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-secondary)' }}>Loading Leaderboard...</div>;
    }

    const top3 = users.slice(0, 3);
    const restUsers = users.slice(3);

    // Reorder top 3 for podium visualization: 2, 1, 3
    const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    style={{ width: 80, height: 80, margin: '0 auto 1.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(16, 185, 129, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(251, 191, 36, 0.4)', boxShadow: '0 0 40px rgba(251, 191, 36, 0.15)' }}
                >
                    <Trophy size={40} color="#fbbf24" />
                </motion.div>
                <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0', fontWeight: 900, background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
                    হল অফ ফেম
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                    টপিক সম্পন্ন করুন, স্ট্রিক বজায় রাখুন এবং শীর্ষস্থান অধিকার করুন!
                </p>
            </header>

            {/* Podium for Top 3 */}
            {top3.length >= 3 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '4rem', padding: '0 1rem', position: 'relative' }}>
                    {/* Podium Background Glow */}
                    <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '100px', background: 'radial-gradient(ellipse at bottom, rgba(251,191,36,0.15) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0 }} />

                    {podiumOrder.map((u, i) => {
                        const isFirst = u.rank === 1;
                        const height = isFirst ? 200 : u.rank === 2 ? 160 : 130;
                        const colors = isFirst ? ['#fde68a', '#fbbf24', '#b45309'] : u.rank === 2 ? ['#f1f5f9', '#94a3b8', '#475569'] : ['#fdba74', '#b45309', '#78350f'];

                        return (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1), type: 'spring', damping: 15 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1, maxWidth: '160px' }}
                            >
                                {/* Avatar & Crown */}
                                <div style={{ position: 'relative', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {isFirst && (
                                        <motion.div
                                            initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}
                                            style={{ position: 'absolute', top: -35, filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.8))' }}
                                        >
                                            <Crown size={32} color="#fbbf24" strokeWidth={2.5} />
                                        </motion.div>
                                    )}
                                    <div style={{
                                        width: isFirst ? 80 : 65, height: isFirst ? 80 : 65,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${colors[1]}, ${colors[2]})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 800, fontSize: isFirst ? '2rem' : '1.5rem',
                                        border: `4px solid ${colors[0]}`,
                                        boxShadow: `0 10px 25px -5px ${colors[1]}60`,
                                        position: 'relative', zIndex: 2
                                    }}>
                                        {u.name.charAt(0)}
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: -10,
                                        background: colors[1], color: 'white',
                                        width: 28, height: 28, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 800, fontSize: '0.9rem', border: '3px solid #0f0f13', zIndex: 3
                                    }}>
                                        {u.rank}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                                    <div style={{ color: 'white', fontWeight: 700, fontSize: isFirst ? '1.1rem' : '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px', margin: '0 auto' }}>
                                        {u.name.split(' ')[0]}
                                    </div>
                                    <div style={{ color: colors[1], fontWeight: 800, fontSize: isFirst ? '1.3rem' : '1.1rem', marginTop: '0.2rem' }}>
                                        {u.score} <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>pts</span>
                                    </div>
                                </div>

                                {/* Podium Base */}
                                <div style={{
                                    width: '100%', height: height,
                                    background: `linear-gradient(180deg, ${colors[1]}20 0%, rgba(20,20,30,0.8) 100%)`,
                                    borderTop: `2px solid ${colors[1]}50`,
                                    borderLeft: `1px solid ${colors[1]}20`,
                                    borderRight: `1px solid ${colors[1]}20`,
                                    borderTopLeftRadius: '12px', borderTopRightRadius: '12px',
                                    display: 'flex', justifyContent: 'center', padding: '1rem 0'
                                }}>
                                    <div style={{ opacity: 0.4 }}>
                                        <Trophy size={isFirst ? 60 : 40} color={colors[1]} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* List for the rest */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 100px 100px', padding: '0 1.5rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                    <span style={{ textAlign: 'center' }}>র‍্যাংক</span>
                    <span>শিক্ষার্থী</span>
                    <span style={{ textAlign: 'center' }}>স্ট্রিক</span>
                    <span style={{ textAlign: 'right' }}>স্কোর</span>
                </div>

                {restUsers.map((u, i) => (
                    <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (i * 0.05) }}
                        className="glass-panel"
                        style={{
                            display: 'grid', gridTemplateColumns: '70px 1fr 100px 100px', alignItems: 'center',
                            padding: '1rem 1.5rem',
                            borderWidth: '1px', borderStyle: 'solid',
                            ...getRankStyle(u.rank),
                            ...(u.isCurrentUser ? { boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08), rgba(20,20,30,0.8))' } : {})
                        }}
                        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{u.rank}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #3f3f46, #18181b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                                {u.name.charAt(0)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'white', fontWeight: u.isCurrentUser ? 700 : 500, fontSize: '1rem' }}>
                                    {u.name}
                                    {u.isCurrentUser && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 700 }}>আপনি</span>}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: u.streak > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>
                            <Flame size={16} /> <span style={{ fontWeight: 700 }}>{u.streak}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700, fontSize: '1.05rem', fontFamily: 'monospace' }}>
                            {u.score}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
