import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { setCurrentUserId, reinitializeData } from '../data/studyData';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const syncUserData = async (u: User | null) => {
        setCurrentUserId(u?.id ?? null);
        await reinitializeData();
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            await syncUserData(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                await syncUserData(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
            },
        });
        if (error) return { error: error.message };

        // If session returned directly (email confirmation disabled), we're done
        if (data.session) {
            return { error: null };
        }

        // Otherwise try auto sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) return { error: signInError.message };

        return { error: null };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
