import { motion } from 'framer-motion';
import { Bell, Trophy, BookOpen, Flame } from 'lucide-react';

export const NotificationsPage = () => {
    // Mock notifications for now
    const notifications = [
        {
            id: 1,
            type: 'achievement',
            title: 'নতুন ব্যাজ আনলক!',
            message: 'আপনি "ফায়ার স্টার্টার" 배জটি আনলক করেছেন ৩ দিনের স্ট্রিক সম্পূর্ণ করে।',
            time: '২ ঘণ্টা আগে',
            icon: Flame,
            color: '#f59e0b',
            read: false
        },
        {
            id: 2,
            type: 'reminder',
            title: 'পড়ার সময় হয়েছে',
            message: 'আজকের নির্ধারিত টপিক "পদার্থবিজ্ঞান - গতি" এখনো বাকি। পড়তে শুরু করুন।',
            time: '৫ ঘণ্টা আগে',
            icon: BookOpen,
            color: '#10b981',
            read: true
        },
        {
            id: 3,
            type: 'leaderboard',
            title: 'লিডারবোর্ড আপডেট',
            message: 'আপনি লিডারবোর্ডে ২ ধাপ উপরে উঠেছেন! বর্তমান অবস্থান: ১৫ তম।',
            time: 'গতকাল',
            icon: Trophy,
            color: '#ec4899',
            read: true
        }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '99px', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                        <Bell size={14} /> নোটিফিকেশন
                    </div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800, color: 'white' }}>সকল নোটিফিকেশন</h1>
                </div>
                <button className="primary-button" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    সব মার্ক অ্যাজ রিড
                </button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.map((notif, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={notif.id} className="glass-panel"
                        style={{
                            padding: '1.25rem 1.5rem',
                            display: 'flex', gap: '1.25rem', alignItems: 'center',
                            border: notif.read ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${notif.color}40`,
                            background: notif.read ? 'rgba(20,20,30,0.5)' : `linear-gradient(90deg, ${notif.color}10, transparent)`
                        }}
                    >
                        <div style={{
                            width: 50, height: 50, borderRadius: '50%', background: `${notif.color}20`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: notif.color,
                            flexShrink: 0
                        }}>
                            <notif.icon size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: 600 }}>{notif.title}</h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{notif.time}</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                {notif.message}
                            </p>
                        </div>
                        {!notif.read && (
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: notif.color, flexShrink: 0 }} />
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
