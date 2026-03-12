'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data } = await supabase
                    .from('admin_users')
                    .select('id')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(!!data);
            }
            setLoading(false);
        };

        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                const { data } = await supabase
                    .from('admin_users')
                    .select('id')
                    .eq('id', currentUser.id)
                    .single();
                setIsAdmin(!!data);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch (e) {
            console.error('Sign out error:', e);
        }
        setUser(null);
        setIsAdmin(false);
        // Force full page reload to clear all state
        window.location.replace('/');
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
