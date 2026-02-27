import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Shield, LogOut, ChevronRight, BookOpen, Target, Award, Clock, Camera, Trash2, Edit3, CheckCircle2, X, Crop, Loader2 } from 'lucide-react';
import { getDashboardStats } from '../data/studyData';
import { supabase } from '../lib/supabase';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// ─── Crop helper: creates a cropped image blob from canvas ───
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await createImage(imageSrc);

    // Use OffscreenCanvas if available, else regular canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    // Set output canvas to the exact crop dimensions
    const safeWidth = Math.round(pixelCrop.width);
    const safeHeight = Math.round(pixelCrop.height);
    canvas.width = safeWidth;
    canvas.height = safeHeight;

    // Draw ONLY the cropped region from the source image onto the canvas
    // drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
        image,
        Math.round(pixelCrop.x),  // source x
        Math.round(pixelCrop.y),  // source y
        safeWidth,                 // source width
        safeHeight,                // source height
        0,                         // destination x
        0,                         // destination y
        safeWidth,                 // destination width
        safeHeight                 // destination height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas is empty'));
        }, 'image/jpeg', 0.92);
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', err => reject(err));
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = url;
    });
}

export const ProfilePage = () => {
    const { user, signOut } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const stats = getDashboardStats();

    // ─── Crop Modal State ───
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ব্যবহারকারী';
    const userEmail = user?.email || '';
    const userInitial = userName.charAt(0).toUpperCase();

    const joinDateObj = user?.created_at ? new Date(user.created_at) : new Date();
    const joinDate = joinDateObj.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    const joinedYear = joinDateObj.getFullYear();

    // ─── Load avatar from Supabase on mount ───
    useEffect(() => {
        if (!user) return;
        loadAvatar(user.id);
    }, [user]);

    const loadAvatar = async (userId: string) => {
        // Try to get the public URL for the avatar
        const filePath = `${userId}/profile.jpg`;
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

        if (data?.publicUrl) {
            // Check if file actually exists by adding cache buster
            const urlWithCacheBuster = `${data.publicUrl}?t=${Date.now()}`;
            try {
                const res = await fetch(urlWithCacheBuster, { method: 'HEAD' });
                if (res.ok) {
                    setAvatarUrl(urlWithCacheBuster);
                    // Also cache in localStorage for sidebar
                    localStorage.setItem(`avatar_${userId}`, urlWithCacheBuster);
                    window.dispatchEvent(new Event('avatarUpdated'));
                }
            } catch {
                // File doesn't exist yet, that's okay
            }
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    // ─── File selection opens crop modal ───
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        if (!file.type.startsWith('image/')) {
            alert('অনুগ্রহ করে একটি ছবি নির্বাচন করুন');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('ছবি ১০ মেগাবাইটের থেকে ছোট হতে হবে');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageSrc(reader.result as string);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // ─── Upload cropped image to Supabase ───
    const handleCropSave = async () => {
        if (!user || !imageSrc || !croppedAreaPixels) return;
        setUploading(true);

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const filePath = `${user.id}/profile.jpg`;

            // Upload to Supabase Storage (upsert)
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, croppedBlob, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + uploadError.message);
                setUploading(false);
                return;
            }

            // Get public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

            setAvatarUrl(publicUrl);
            localStorage.setItem(`avatar_${user.id}`, publicUrl);
            window.dispatchEvent(new Event('avatarUpdated'));

            setCropModalOpen(false);
            setImageSrc(null);
        } catch (err) {
            console.error('Crop/upload error:', err);
            alert('ছবি প্রক্রিয়াকরণে সমস্যা হয়েছে');
        }
        setUploading(false);
    };

    // ─── Remove avatar from Supabase ───
    const removeAvatar = async () => {
        if (!user) return;
        setUploading(true);

        const filePath = `${user.id}/profile.jpg`;
        await supabase.storage.from('avatars').remove([filePath]);

        localStorage.removeItem(`avatar_${user.id}`);
        setAvatarUrl(null);
        window.dispatchEvent(new Event('avatarUpdated'));
        setUploading(false);
    };

    const profileStats = [
        { icon: <BookOpen size={24} />, label: 'বিষয়', value: `${stats.totalSubjects}`, color: '#ec4899' },
        { icon: <Target size={24} />, label: 'সম্পন্ন টপিক', value: `${stats.completedTopics}`, color: '#10b981' },
        { icon: <Award size={24} />, label: 'মোট অগ্রগতি', value: `${stats.overallProgress}%`, color: '#f59e0b' },
        { icon: <Clock size={24} />, label: 'বাকি টপিক', value: `${stats.remainingTopics}`, color: '#6366f1' },
    ];

    return (
        <motion.div
            initial="hidden" animate="visible" variants={stagger}
            style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />

            {/* ═══════════ CROP MODAL ═══════════ */}
            <AnimatePresence>
                {cropModalOpen && imageSrc && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(0,0,0,0.4)', zIndex: 10
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                                <Crop size={22} color="#10b981" /> ছবি ক্রপ করুন
                            </div>
                            <button
                                onClick={() => { setCropModalOpen(false); setImageSrc(null); }}
                                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Crop Area */}
                        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', height: '500px', marginTop: '60px', borderRadius: '16px', overflow: 'hidden' }}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                style={{
                                    containerStyle: { borderRadius: '16px' },
                                    cropAreaStyle: { border: '3px solid #10b981', boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }
                                }}
                            />
                        </div>

                        {/* Zoom Slider */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '400px', padding: '0 2rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>জুম</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1} max={3} step={0.05}
                                onChange={e => setZoom(Number(e.target.value))}
                                style={{
                                    flex: 1, height: '4px', appearance: 'none', background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '2px', outline: 'none', cursor: 'pointer',
                                    accentColor: '#10b981'
                                }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => { setCropModalOpen(false); setImageSrc(null); }}
                                style={{
                                    padding: '0.85rem 2rem', borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                                    fontFamily: 'inherit'
                                }}
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={handleCropSave}
                                disabled={uploading}
                                style={{
                                    padding: '0.85rem 2.5rem', borderRadius: '14px',
                                    background: uploading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer',
                                    fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    boxShadow: uploading ? 'none' : '0 6px 20px rgba(16,185,129,0.3)'
                                }}
                            >
                                {uploading ? (
                                    <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> আপলোড হচ্ছে...</>
                                ) : (
                                    <>✓ সেভ করুন</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════ PROFILE HEADER ═══════════ */}
            <motion.div variants={fadeUp} style={{
                position: 'relative',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.03) 100%)',
                border: '1px solid rgba(16,185,129,0.08)',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
            }}>
                {/* Abstract Top Cover */}
                <div style={{
                    height: '160px', width: '100%',
                    background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2310b981\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(12,12,18,1) 100%)' }} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 2 }}
                        style={{ position: 'absolute', top: -100, right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)', borderRadius: '50%' }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 2 }}
                        style={{ position: 'absolute', bottom: -100, left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)', borderRadius: '50%' }}
                    />
                </div>

                {/* Profile Info Section */}
                <div style={{ padding: '0 2.5rem 2.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

                    {/* Floating Avatar */}
                    <div style={{
                        marginTop: '-70px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        marginBottom: '1rem',
                        position: 'relative'
                    }}>
                        <div
                            style={{
                                position: 'relative', width: '130px', height: '130px', borderRadius: '50%',
                                padding: '5px', background: 'rgba(12,12,18,0.9)', backdropFilter: 'blur(10px)',
                                zIndex: 10, marginBottom: '0.75rem'
                            }}
                            onMouseEnter={() => setIsHoveringAvatar(true)}
                            onMouseLeave={() => setIsHoveringAvatar(false)}
                        >
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                background: avatarUrl ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '3.5rem', fontWeight: 800, color: 'white',
                                boxShadow: '0 10px 30px rgba(16,185,129,0.2)',
                                overflow: 'hidden', position: 'relative'
                            }}>
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        style={{
                                            width: '100%', height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                            borderRadius: '50%'
                                        }}
                                    />
                                ) : userInitial}

                                {/* Hover Overlay for Image Upload */}
                                <AnimatePresence>
                                    {isHoveringAvatar && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                gap: '0.5rem', cursor: 'pointer', backdropFilter: 'blur(2px)'
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera size={28} color="white" />
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>ছবি আপডেট</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Remove Image Button */}
                            {avatarUrl && isHoveringAvatar && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={(e) => { e.stopPropagation(); removeAvatar(); }}
                                    style={{
                                        position: 'absolute', top: -10, right: -10, width: 32, height: 32, borderRadius: '50%',
                                        background: '#ef4444', border: '2px solid #0c0c12', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)', zIndex: 11
                                    }}
                                    title="ছবি মুছুন"
                                >
                                    <Trash2 size={14} />
                                </motion.button>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '99px', color: '#34d399', fontSize: '0.8rem', fontWeight: 700 }}>
                                <Shield size={14} /> প্রো মেম্বার
                            </div>
                        </div>
                    </div>

                    {/* Name and Basic Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.02em', textAlign: 'center' }}>
                                {userName}
                            </h2>
                            <CheckCircle2 size={24} color="#10b981" />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} /> {userEmail}
                        </p>
                    </div>

                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

                {/* Left Column - Stats */}
                <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Award size={20} color="#10b981" /> আপনার পারফরম্যান্স
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {profileStats.map((stat, i) => (
                            <motion.div
                                key={i} className="glass-card"
                                whileHover={{ y: -4, boxShadow: `0 15px 30px -10px ${stat.color}40` }}
                                style={{
                                    padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                                    border: `1px solid ${stat.color}20`, background: `linear-gradient(135deg, rgba(12,12,18,0.8) 0%, ${stat.color}08 100%)`
                                }}
                            >
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Column - Account Settings */}
                <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={20} color="#10b981" /> অ্যাকাউন্ট তথ্য
                    </h3>

                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        {[
                            { icon: <User size={18} />, label: 'পূর্ণ নাম', value: userName },
                            { icon: <Mail size={18} />, label: 'ইমেইল অ্যাড্রেস', value: userEmail },
                            { icon: <Calendar size={18} />, label: `সদস্য হয়েছেন (${joinedYear})`, value: joinDate },
                        ].map((item, i, arr) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1.25rem 1.5rem',
                                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                transition: 'background-color 0.2s',
                                cursor: 'default'
                            }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{item.label}</span>
                                </div>
                                <span style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600 }}>{item.value}</span>
                            </div>
                        ))}
                        <div
                            style={{
                                padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                cursor: 'pointer', transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.05)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Edit3 size={18} color="#10b981" />
                                <span style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600 }}>প্রোফাইল ছবি পরিবর্তন করুন</span>
                            </div>
                            <ChevronRight size={18} color="#10b981" />
                        </div>
                    </div>

                    {/* Logout Area */}
                    <div style={{ marginTop: 'auto' }}>
                        {!showLogoutConfirm ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setShowLogoutConfirm(true)}
                                style={{
                                    width: '100%', padding: '1.1rem',
                                    background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '16px', color: '#f87171', fontSize: '1rem', fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                    transition: 'all 0.3s ease', fontFamily: 'inherit'
                                }}
                            >
                                <LogOut size={20} /> লগ আউট করুন
                            </motion.button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(153,27,27,0.1) 100%)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '1.5rem',
                                    textAlign: 'center'
                                }}
                            >
                                <p style={{ color: 'white', fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
                                    আপনি কি নিশ্চিত লগ আউট করতে চান?
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', flex: 1, transition: 'background 0.2s', fontFamily: 'inherit' }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', flex: 1, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', fontFamily: 'inherit' }}
                                    >
                                        লগ আউট
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Inline styles for spin animation */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
    );
};
