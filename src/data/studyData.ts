/**
 * ফাঁকিবাজ — স্টাডি ট্র্যাকার
 * ──────────────────────────────────────────────
 * Central data store for syllabus, progress, activity & streaks.
 * All user data is synced with Supabase (no localStorage).
 */

import syllabusRaw from '../../database/data.json' with { type: 'json' };
import { supabase } from '../lib/supabase';

// ============================================
// Types
// ============================================
export type Status = 'not_started' | 'ongoing' | 'finished';

export interface Topic {
    id: string;
    chapterId: string;
    title: string;
    type: 'reading';
    status: Status;
}

export interface Chapter {
    id: string;
    subjectId: string;
    title: string;
    order: number;
    totalTopics: number;
    completedTopics: number;
    status: Status;
    description: string;
}

export interface Subject {
    id: string;
    title: string;
    code: string;
    description: string;
    icon: string;
    totalChapters: number;
    completedChapters: number;
    progress: number;
    color: string;
}

interface DailyActivity {
    date: string;      // YYYY-MM-DD
    completed: number; // topics completed that day
}

// ============================================
// Icon & Color mapping by subject code
// ============================================
const subjectMeta: Record<string, { icon: string; color: string }> = {
    '101': { icon: 'BookOpen', color: '#ec4899' },
    '102': { icon: 'PenTool', color: '#f43f5e' },
    '107': { icon: 'Globe', color: '#3b82f6' },
    '108': { icon: 'FileText', color: '#6366f1' },
    '109': { icon: 'Calculator', color: '#8b5cf6' },
    '111': { icon: 'Heart', color: '#f97316' },
    '134': { icon: 'Sprout', color: '#84cc16' },
    '136': { icon: 'Atom', color: '#61DAFB' },
    '137': { icon: 'FlaskConical', color: '#f59e0b' },
    '138': { icon: 'Leaf', color: '#10b981' },
    '150': { icon: 'MapPin', color: '#0ea5e9' },
    '154': { icon: 'Monitor', color: '#06b6d4' },
};

// ============================================
// In-Memory State (Synced with Supabase)
// ============================================
let currentUserId: string | null = null;
let topicStatuses: Record<string, Status> = {};
let activityLog: DailyActivity[] = [];

export function setCurrentUserId(uid: string | null) {
    currentUserId = uid;
    if (!uid) {
        topicStatuses = {};
        activityLog = [];
    }
}

export function getCurrentUserId(): string | null {
    return currentUserId;
}

// ============================================
// Build syllabus structure from JSON
// ============================================
interface JsonTopic { chapter_name: string; topics: string[]; }
interface JsonSubject { subject_name: string; subject_code: string; chapters: JsonTopic[]; }

const jsonData = syllabusRaw as { syllabus: JsonSubject[] };

const allTopics: Topic[] = [];
const allChapters: Chapter[] = [];
const allSubjects: Subject[] = [];

jsonData.syllabus.forEach((subj, si) => {
    const subjectId = `s${si + 1}`;
    let totalSubjectTopics = 0;
    let completedSubjectTopics = 0;

    subj.chapters.forEach((ch, ci) => {
        const chapterId = `${subjectId}_c${ci + 1}`;
        let completedInChapter = 0;

        ch.topics.forEach((topicTitle, ti) => {
            const topicId = `${chapterId}_t${ti + 1}`;
            const status: Status = topicStatuses[topicId] || 'not_started';

            allTopics.push({
                id: topicId,
                chapterId,
                title: topicTitle,
                type: 'reading',
                status,
            });

            if (status === 'finished') {
                completedInChapter++;
                completedSubjectTopics++;
            }
            totalSubjectTopics++;
        });

        const chapterStatus: Status =
            completedInChapter === ch.topics.length && ch.topics.length > 0
                ? 'finished'
                : completedInChapter > 0
                    ? 'ongoing'
                    : 'not_started';

        allChapters.push({
            id: chapterId,
            subjectId,
            title: ch.chapter_name,
            order: ci + 1,
            totalTopics: ch.topics.length,
            completedTopics: completedInChapter,
            status: chapterStatus,
            description: `${subj.subject_name} — ${ch.chapter_name} এর সকল টপিক।`,
        });
    });

    const meta = subjectMeta[subj.subject_code] || { icon: 'BookOpen', color: '#a855f7' };
    const completedChapters = allChapters.filter(
        (c) => c.subjectId === subjectId && c.status === 'finished'
    ).length;

    allSubjects.push({
        id: subjectId,
        title: subj.subject_name,
        code: subj.subject_code,
        description: `এসএসসি ২০২৬ শর্ট সিলেবাস অনুযায়ী ${subj.subject_name} এর সকল অধ্যায় ও টপিক।`,
        icon: meta.icon,
        totalChapters: subj.chapters.length,
        completedChapters,
        progress: totalSubjectTopics > 0
            ? Math.round((completedSubjectTopics / totalSubjectTopics) * 100)
            : 0,
        color: meta.color,
    });
});

// ============================================
// Supabase Sync
// ============================================

/** Load user progress from Supabase into memory */
async function loadFromSupabase() {
    if (!currentUserId) return;
    try {
        const { data } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', currentUserId)
            .single();

        if (data) {
            if (data.topic_statuses) topicStatuses = data.topic_statuses;
            if (data.activity_log) activityLog = data.activity_log;
        }
    } catch (err) {
        console.error('Supabase load error:', err);
    }
}

/** Push current in-memory state to Supabase */
async function saveToSupabase() {
    if (!currentUserId) return;
    try {
        await supabase.from('user_progress').upsert({
            user_id: currentUserId,
            topic_statuses: topicStatuses,
            activity_log: activityLog,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch (err) {
        console.error('Supabase save error:', err);
    }
}

// ============================================
// Recalculation Helpers
// ============================================
function recalculateAll() {
    const saved = topicStatuses;

    allTopics.forEach((t) => {
        t.status = saved[t.id] || 'not_started';
    });

    allChapters.forEach((ch) => {
        const chapTopics = allTopics.filter((t) => t.chapterId === ch.id);
        ch.completedTopics = chapTopics.filter((t) => t.status === 'finished').length;
        ch.status =
            ch.completedTopics === ch.totalTopics && ch.totalTopics > 0
                ? 'finished'
                : ch.completedTopics > 0
                    ? 'ongoing'
                    : 'not_started';
    });

    allSubjects.forEach((subj) => {
        const subjChapters = allChapters.filter((c) => c.subjectId === subj.id);
        subj.completedChapters = subjChapters.filter((c) => c.status === 'finished').length;
        const subjTopics = allTopics.filter((t) => subjChapters.some((c) => c.id === t.chapterId));
        const completed = subjTopics.filter((t) => t.status === 'finished').length;
        subj.progress = subjTopics.length > 0 ? Math.round((completed / subjTopics.length) * 100) : 0;
    });
}

// ============================================
// Public API
// ============================================

/**
 * Fetch user data from Supabase and recalculate everything.
 * Call on login / auth state change.
 */
export async function reinitializeData() {
    if (currentUserId) {
        await loadFromSupabase();
    }
    recalculateAll();
}

export const getSubjects = () => allSubjects;
export const getSubjectById = (id: string) => allSubjects.find((s) => s.id === id);
export const getChaptersBySubject = (subjectId: string) =>
    allChapters.filter((c) => c.subjectId === subjectId).sort((a, b) => a.order - b.order);
export const getChapterById = (id: string) => allChapters.find((c) => c.id === id);
export const getTopicsByChapter = (chapterId: string) =>
    allTopics.filter((t) => t.chapterId === chapterId);

/** Update a topic status & sync to Supabase */
export const updateTopicStatus = (topicId: string, newStatus: Status) => {
    const topic = allTopics.find((t) => t.id === topicId);
    if (!topic) return;

    const wasFinished = topic.status === 'finished';
    topic.status = newStatus;

    // Update in-memory statuses
    if (newStatus === 'not_started') {
        delete topicStatuses[topicId];
    } else {
        topicStatuses[topicId] = newStatus;
    }

    // Track activity
    if (newStatus === 'finished' && !wasFinished) {
        recordActivity(1);
    } else if (newStatus !== 'finished' && wasFinished) {
        recordActivity(-1);
    }

    // Recalculate chapter
    const chapter = allChapters.find((c) => c.id === topic.chapterId);
    if (chapter) {
        const chapterTopics = allTopics.filter((t) => t.chapterId === chapter.id);
        chapter.completedTopics = chapterTopics.filter((t) => t.status === 'finished').length;
        chapter.status =
            chapter.completedTopics === chapter.totalTopics && chapter.totalTopics > 0
                ? 'finished'
                : chapter.completedTopics > 0
                    ? 'ongoing'
                    : 'not_started';

        // Recalculate subject
        const subject = allSubjects.find((s) => s.id === chapter.subjectId);
        if (subject) {
            const subjectChapters = allChapters.filter((c) => c.subjectId === subject.id);
            subject.completedChapters = subjectChapters.filter((c) => c.status === 'finished').length;
            const subjectTopics = allTopics.filter((t) =>
                subjectChapters.some((c) => c.id === t.chapterId)
            );
            const completedCount = subjectTopics.filter((t) => t.status === 'finished').length;
            subject.progress = subjectTopics.length > 0
                ? Math.round((completedCount / subjectTopics.length) * 100)
                : 0;
        }
    }

    // Sync to Supabase in background
    saveToSupabase();
};

export const getDashboardStats = () => {
    const totalSubjects = allSubjects.length;
    const completedSubjects = allSubjects.filter((s) => s.progress === 100).length;
    const ongoingSubjects = allSubjects.filter((s) => s.progress > 0 && s.progress < 100).length;
    const totalChapters = allChapters.length;
    const completedChapters = allChapters.filter((c) => c.status === 'finished').length;
    const totalTopics = allTopics.length;
    const completedTopics = allTopics.filter((t) => t.status === 'finished').length;
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
        totalSubjects,
        completedSubjects,
        ongoingSubjects,
        totalChapters,
        completedChapters,
        remainingChapters: totalChapters - completedChapters,
        overallProgress,
        totalTopics,
        completedTopics,
        remainingTopics: totalTopics - completedTopics,
    };
};

// ============================================
// Activity Tracking & Streak System
// ============================================

function getDateStr(d: Date = new Date()): string {
    return d.toISOString().split('T')[0];
}

function recordActivity(delta: number) {
    const today = getDateStr();
    const existing = activityLog.find((e) => e.date === today);
    if (existing) {
        existing.completed = Math.max(0, existing.completed + delta);
    } else if (delta > 0) {
        activityLog.push({ date: today, completed: delta });
    }
    // Keep only last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = getDateStr(cutoff);
    activityLog = activityLog.filter((e) => e.date >= cutoffStr);
}

/** Returns last N days activity for chart display */
export function getActivityChartData(days: number = 7): { name: string; completed: number }[] {
    const result: { name: string; completed: number }[] = [];
    const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getDateStr(d);
        const entry = activityLog.find((e) => e.date === dateStr);
        result.push({
            name: dayNames[d.getDay()],
            completed: entry ? entry.completed : 0,
        });
    }
    return result;
}

/** Returns streak info: current streak count and this week's day activity */
export function getStreakData(): { streak: number; weekDays: { label: string; active: boolean }[] } {
    const logDates = new Set(activityLog.filter((e) => e.completed > 0).map((e) => e.date));

    let streak = 0;
    const checkDate = new Date();
    if (!logDates.has(getDateStr(checkDate))) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (logDates.has(getDateStr(checkDate))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    const weekLabels = ['সো', 'ম', 'বু', 'বৃ', 'শু', 'শ', 'র'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const weekDays = weekLabels.map((label, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return { label, active: logDates.has(getDateStr(d)) };
    });

    return { streak, weekDays };
}
