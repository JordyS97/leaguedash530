'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/admin';
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Use hard redirect (window.location.href) instead of router.push
            // this ensures that the session cookie is correctly sent to the middleware
            // on the first request to the admin page, avoiding loops.
            window.location.href = redirectTo;
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center relative overflow-hidden">
            {/* Background Racing Lines */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#ED1C24] to-transparent" />
                <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-[#ED1C24] to-transparent" />
                <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-[#ED1C24] to-transparent" />
                {/* Diagonal speed lines */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[10%] left-[5%] w-[200px] h-[2px] bg-gradient-to-r from-[#ED1C24] to-transparent rotate-[30deg]" />
                    <div className="absolute top-[30%] right-[15%] w-[300px] h-[2px] bg-gradient-to-r from-[#ED1C24] to-transparent rotate-[-20deg]" />
                    <div className="absolute bottom-[20%] left-[10%] w-[250px] h-[2px] bg-gradient-to-r from-[#ED1C24] to-transparent rotate-[15deg]" />
                    <div className="absolute bottom-[40%] right-[5%] w-[180px] h-[2px] bg-gradient-to-r from-[#ED1C24] to-transparent rotate-[-35deg]" />
                </div>
            </div>

            {/* Radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ED1C24] rounded-full opacity-5 blur-[100px]" />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0D0D0D] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ED1C24] to-[#b91520] mb-4 shadow-lg shadow-[#ED1C24]/20">
                            <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                AL
                            </span>
                        </div>
                        <h1
                            className="text-2xl font-bold text-white mb-1"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                            LEADERS LEAGUE
                        </h1>
                        <p className="text-gray-500 text-sm tracking-widest uppercase">
                            Mandalika Edition
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#ED1C24]/30" />
                        <span className="text-xs text-gray-600 uppercase tracking-widest">Admin Access</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#ED1C24]/30" />
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]/50 transition-all"
                                placeholder="admin@astramotor.id"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-[#ED1C24] to-[#b91520] text-white font-bold rounded-xl hover:from-[#ff2d35] hover:to-[#ED1C24] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ED1C24]/20 hover:shadow-[#ED1C24]/40 cursor-pointer"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    AUTHENTICATING...
                                </span>
                            ) : (
                                'SIGN IN'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <a href="/" className="text-sm text-gray-500 hover:text-[#ED1C24] transition-colors">
                            ← Back to Leaderboard
                        </a>
                    </div>
                </div>

                {/* Bottom accent */}
                <div className="mt-6 text-center text-xs text-gray-700">
                    <p>© {new Date().getFullYear()} Astra Motor • Leaders League</p>
                </div>
            </div>
        </div>
    );
}
