import syllabusRaw from '../../database/data.json' with { type: 'json' };
import {
  loadStatusesFromSupabase,
  saveStatusToSupabase,
  recordActivityToSupabase,
  loadActivityFromSupabase,
  getCachedStatuses,
  resetCache,
} from '../lib/supabaseData';

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
// Current user tracking
// ============================================
let currentUserId: string | null = null;

export function setCurrentUserId(uid: string | null) {
  currentUserId = uid;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

// ============================================
// Build data dynamically from JSON
// ============================================

interface JsonTopic {
  chapter_name: string;
  topics: string[];
}

interface JsonSubject {
  subject_name: string;
  subject_code: string;
  chapters: JsonTopic[];
}

const jsonData = syllabusRaw as { syllabus: JsonSubject[] };

// --- Generate all topics ---
const allTopics: Topic[] = [];
const allChapters: Chapter[] = [];
const allSubjects: Subject[] = [];

function buildStaticData() {
  // Clear arrays
  allTopics.length = 0;
  allChapters.length = 0;
  allSubjects.length = 0;

  const savedStatuses = getCachedStatuses();

  jsonData.syllabus.forEach((subj, si) => {
    const subjectId = `s${si + 1}`;
    let totalSubjectTopics = 0;
    let completedSubjectTopics = 0;

    subj.chapters.forEach((ch, ci) => {
      const chapterId = `${subjectId}_c${ci + 1}`;
      let completedInChapter = 0;

      ch.topics.forEach((topicTitle, ti) => {
        const topicId = `${chapterId}_t${ti + 1}`;
        const status: Status = savedStatuses[topicId] || 'not_started';

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
    const totalChapters = subj.chapters.length;
    const progress = totalSubjectTopics > 0
      ? Math.round((completedSubjectTopics / totalSubjectTopics) * 100)
      : 0;

    allSubjects.push({
      id: subjectId,
      title: subj.subject_name,
      code: subj.subject_code,
      description: `এসএসসি ২০২৬ শর্ট সিলেবাস অনুযায়ী ${subj.subject_name} এর সকল অধ্যায় ও টপিক।`,
      icon: meta.icon,
      totalChapters,
      completedChapters,
      progress,
      color: meta.color,
    });
  });
}

// Initial build with empty statuses
buildStaticData();

// ============================================
// Public Exports
// ============================================
export const mockSubjects = allSubjects;
export const mockChapters = allChapters;
export const mockTopics = allTopics;

/**
 * Initialize data from Supabase for the current user.
 * Call this on login.
 */
export async function initializeDataFromSupabase(userId: string): Promise<void> {
  setCurrentUserId(userId);
  await loadStatusesFromSupabase(userId);
  // Rebuild static data with loaded statuses
  buildStaticData();
}

/**
 * Reload all topic statuses (for logout/switch user).
 */
export function reinitializeData() {
  buildStaticData();
}

/**
 * Clear user data cache (for logout).
 */
export function clearUserData() {
  resetCache();
  setCurrentUserId(null);
  buildStaticData();
}

export const getSubjects = () => allSubjects;
export const getSubjectById = (id: string) => allSubjects.find((s) => s.id === id);
export const getChaptersBySubject = (subjectId: string) =>
  allChapters.filter((c) => c.subjectId === subjectId).sort((a, b) => a.order - b.order);
export const getChapterById = (id: string) => allChapters.find((c) => c.id === id);
export const getTopicsByChapter = (chapterId: string) =>
  allTopics.filter((t) => t.chapterId === chapterId);

// Update a topic status & persist to Supabase
export const updateTopicStatus = (topicId: string, newStatus: Status) => {
  const topic = allTopics.find((t) => t.id === topicId);
  if (topic) {
    const wasFinished = topic.status === 'finished';
    topic.status = newStatus;

    // Save to Supabase (async, fire-and-forget for fast UI)
    if (currentUserId) {
      saveStatusToSupabase(currentUserId, topicId, newStatus);

      // Track activity
      if (newStatus === 'finished' && !wasFinished) {
        recordActivityToSupabase(currentUserId, 1);
      } else if (newStatus !== 'finished' && wasFinished) {
        recordActivityToSupabase(currentUserId, -1);
      }
    }

    // Recalculate chapter stats
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

      // Recalculate subject stats
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
  }
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
// (Now Supabase-backed)
// ============================================

/**
 * Returns last N days activity for chart display
 * Now loads from Supabase
 */
export async function getActivityChartDataAsync(days: number = 7): Promise<{ name: string; completed: number }[]> {
  const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  const result: { name: string; completed: number }[] = [];

  let log: { date: string; completed: number }[] = [];
  if (currentUserId) {
    log = await loadActivityFromSupabase(currentUserId);
  }

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = log.find((e) => e.date === dateStr);
    result.push({
      name: dayNames[d.getDay()],
      completed: entry ? entry.completed : 0,
    });
  }
  return result;
}

/**
 * Sync version for backward compat - uses cached/localStorage data
 */
export function getActivityChartData(days: number = 7): { name: string; completed: number }[] {
  const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  const result: { name: string; completed: number }[] = [];

  let log: { date: string; completed: number }[] = [];
  if (currentUserId) {
    try {
      const raw = localStorage.getItem(`ssc2026_activity_log_${currentUserId}`);
      if (raw) log = JSON.parse(raw);
    } catch { /* ignore */ }
  }

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = log.find((e) => e.date === dateStr);
    result.push({
      name: dayNames[d.getDay()],
      completed: entry ? entry.completed : 0,
    });
  }
  return result;
}

/**
 * Returns streak info
 */
export function getStreakData(): { streak: number; weekDays: { label: string; active: boolean }[] } {
  let log: { date: string; completed: number }[] = [];
  if (currentUserId) {
    try {
      const raw = localStorage.getItem(`ssc2026_activity_log_${currentUserId}`);
      if (raw) log = JSON.parse(raw);
    } catch { /* ignore */ }
  }

  const logDates = new Set(log.filter((e) => e.completed > 0).map((e) => e.date));

  const getDateStr = (d: Date) => d.toISOString().split('T')[0];

  // Calculate consecutive streak ending today or yesterday
  let streak = 0;
  const checkDate = new Date();
  if (!logDates.has(getDateStr(checkDate))) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (logDates.has(getDateStr(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Build this week's activity (Mon–Sun)
  const weekLabels = ['সো', 'ম', 'বু', 'বৃ', 'শু', 'শ', 'র'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const weekDays = weekLabels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label,
      active: logDates.has(getDateStr(d)),
    };
  });

  return { streak, weekDays };
}
