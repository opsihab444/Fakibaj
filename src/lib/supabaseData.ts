import { supabase } from './supabase';
import type { Status } from '../data/mockData';

// =============================================
// Supabase Data Service
// Handles all database read/write for user progress
// =============================================

let cachedStatuses: Record<string, Status> = {};
let isLoaded = false;

/**
 * Load all topic statuses for the current user from Supabase.
 * Called once on login, cached in memory for fast access.
 */
export async function loadStatusesFromSupabase(userId: string): Promise<Record<string, Status>> {
    try {
        const { data, error } = await supabase
            .from('user_topic_status')
            .select('topic_id, status')
            .eq('user_id', userId);

        if (error) {
            console.error('Error loading statuses:', error);
            // Fallback to localStorage
            return loadFromLocalStorage(userId);
        }

        const statuses: Record<string, Status> = {};
        if (data) {
            data.forEach((row: any) => {
                statuses[row.topic_id] = row.status as Status;
            });
        }

        cachedStatuses = statuses;
        isLoaded = true;

        // Also save to localStorage as backup
        saveToLocalStorage(userId, statuses);

        return statuses;
    } catch (err) {
        console.error('Failed to load from Supabase:', err);
        return loadFromLocalStorage(userId);
    }
}

/**
 * Save a single topic status to Supabase (upsert).
 */
export async function saveStatusToSupabase(userId: string, topicId: string, status: Status): Promise<void> {
    // Update cache immediately
    if (status === 'not_started') {
        delete cachedStatuses[topicId];
    } else {
        cachedStatuses[topicId] = status;
    }

    // Save to localStorage as backup
    saveToLocalStorage(userId, cachedStatuses);

    try {
        if (status === 'not_started') {
            // Delete the row
            await supabase
                .from('user_topic_status')
                .delete()
                .eq('user_id', userId)
                .eq('topic_id', topicId);
        } else {
            // Upsert the status
            await supabase
                .from('user_topic_status')
                .upsert({
                    user_id: userId,
                    topic_id: topicId,
                    status: status,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,topic_id'
                });
        }
    } catch (err) {
        console.error('Failed to save to Supabase:', err);
    }
}

/**
 * Record daily activity (topic completion) to Supabase.
 */
export async function recordActivityToSupabase(userId: string, delta: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Also save to localStorage
    recordActivityToLocalStorage(userId, delta);

    try {
        // Try to get existing entry for today
        const { data: existing } = await supabase
            .from('user_activity_log')
            .select('completed_count')
            .eq('user_id', userId)
            .eq('activity_date', today)
            .single();

        if (existing) {
            // Update existing
            const newCount = Math.max(0, existing.completed_count + delta);
            await supabase
                .from('user_activity_log')
                .update({ completed_count: newCount })
                .eq('user_id', userId)
                .eq('activity_date', today);
        } else if (delta > 0) {
            // Insert new
            await supabase
                .from('user_activity_log')
                .insert({
                    user_id: userId,
                    activity_date: today,
                    completed_count: delta
                });
        }
    } catch (err) {
        console.error('Failed to record activity:', err);
    }
}

/**
 * Load activity log from Supabase for charts and streaks.
 */
export async function loadActivityFromSupabase(userId: string): Promise<{ date: string; completed: number }[]> {
    try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('user_activity_log')
            .select('activity_date, completed_count')
            .eq('user_id', userId)
            .gte('activity_date', cutoffStr)
            .order('activity_date', { ascending: true });

        if (error) {
            console.error('Error loading activity:', error);
            return loadActivityFromLocalStorage(userId);
        }

        return (data || []).map((row: any) => ({
            date: row.activity_date,
            completed: row.completed_count
        }));
    } catch (err) {
        console.error('Failed to load activity from Supabase:', err);
        return loadActivityFromLocalStorage(userId);
    }
}

/**
 * Get cached statuses (for synchronous access after initial load).
 */
export function getCachedStatuses(): Record<string, Status> {
    return cachedStatuses;
}

export function isDataLoaded(): boolean {
    return isLoaded;
}

export function resetCache() {
    cachedStatuses = {};
    isLoaded = false;
}

// =============================================
// LocalStorage Fallback Helpers
// =============================================

function loadFromLocalStorage(userId: string): Record<string, Status> {
    try {
        const raw = localStorage.getItem(`ssc2026_topic_status_${userId}`);
        if (raw) return JSON.parse(raw) as Record<string, Status>;
    } catch { /* ignore */ }
    return {};
}

function saveToLocalStorage(userId: string, statuses: Record<string, Status>) {
    localStorage.setItem(`ssc2026_topic_status_${userId}`, JSON.stringify(statuses));
}

function recordActivityToLocalStorage(userId: string, delta: number) {
    try {
        const key = `ssc2026_activity_log_${userId}`;
        const raw = localStorage.getItem(key);
        const log: { date: string; completed: number }[] = raw ? JSON.parse(raw) : [];
        const today = new Date().toISOString().split('T')[0];

        const existing = log.find(e => e.date === today);
        if (existing) {
            existing.completed = Math.max(0, existing.completed + delta);
        } else if (delta > 0) {
            log.push({ date: today, completed: delta });
        }

        // Keep only last 30 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const filtered = log.filter(e => e.date >= cutoffStr);
        localStorage.setItem(key, JSON.stringify(filtered));
    } catch { /* ignore */ }
}

function loadActivityFromLocalStorage(userId: string): { date: string; completed: number }[] {
    try {
        const raw = localStorage.getItem(`ssc2026_activity_log_${userId}`);
        if (raw) return JSON.parse(raw) as { date: string; completed: number }[];
    } catch { /* ignore */ }
    return [];
}
