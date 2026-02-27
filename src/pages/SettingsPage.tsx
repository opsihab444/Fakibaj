import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Moon, Monitor, Smartphone, CircleUserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '99px', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <Settings size={14} /> সেটিংস
                </div>
                <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800, color: 'white' }}>অ্যাপ্লিকেশন সেটিংস</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>আপনার প্রোফাইল, নোটিফিকেশন এবং সিকিউরিটি সেটিংস পরিবর্তন করুন।</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Account Settings */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <CircleUserRound color="#3b82f6" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>অ্যাকাউন্ট</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>ইমেইল</span>
                            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{user?.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>পাসওয়ার্ড</span>
                            <button className="primary-button" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>পরিবর্তন করুন</button>
                        </div>
                    </div>
                </div>

                {/* Theme Settings */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Moon color="#8b5cf6" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>অ্যাপিয়ারেন্স</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
                            <span style={{ display: 'flex', gap: '0.75rem' }}><Moon size={20} /> ডার্ক মোড (ডিফল্ট)</span>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981' }} />
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <span style={{ display: 'flex', gap: '0.75rem' }}><Monitor size={20} /> সিস্টেম থিম</span>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--text-secondary)' }} />
                        </button>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Bell color="#f59e0b" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>নোটিফিকেশন</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { label: 'ডেইলি রিমাইন্ডার', sub: 'প্রতিদিন পড়ার কথা মনে করিয়ে দেওয়া', on: true },
                            { label: 'নতুন ব্যাজ অ্যালার্ট', sub: 'ব্যাজ আনলক হলে জানাবে', on: true },
                            { label: 'লিডারবোর্ড আপডেট', sub: 'র‍্যাংক পরিবর্তন হলে', on: false },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500 }}>{item.label}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.sub}</div>
                                </div>
                                <div style={{
                                    width: 44, height: 24, borderRadius: 12,
                                    background: item.on ? '#10b981' : 'rgba(255,255,255,0.1)',
                                    position: 'relative', cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                                        position: 'absolute', top: 2, left: item.on ? 22 : 2,
                                        transition: 'all 0.3s'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Shield color="#ec4899" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>সিকিউরিটি</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <Smartphone color="var(--text-secondary)" />
                            <div>
                                <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500 }}>২-স্টেপ ভেরিফিকেশন</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>অ্যাকাউন্টের নিরাপত্তা বৃদ্ধি করুন</div>
                                <button className="primary-button" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid #10b981', color: '#10b981' }}>এনাবল করুন</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
