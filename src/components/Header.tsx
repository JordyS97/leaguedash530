'use client';

import { useAuth } from './AuthProvider';
import Link from 'next/link';

export default function Header() {
    const { user, isAdmin, signOut } = useAuth();

    return (
        <header className="relative z-20 bg-gradient-to-r from-[#0D0D0D] via-[#1a1a1a] to-[#0D0D0D] border-b border-[#2a2a2a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-4">
                        {/* Logo Mark */}
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#ED1C24] to-[#b91520] rounded-xl flex items-center justify-center shadow-lg shadow-[#ED1C24]/20 transform -skew-x-6">
                                <span
                                    className="text-white font-black text-lg skew-x-6"
                                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                                >
                                    AL
                                </span>
                            </div>
                            {/* Accent line */}
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ED1C24] to-transparent" />
                        </div>

                        {/* Title Group */}
                        <div>
                            <h1
                                className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight"
                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                            >
                                LEADERS{' '}
                                <span className="text-[#ED1C24]">LEAGUE</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-px bg-[#ED1C24]" />
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-[0.3em]">
                                    Mandalika Edition
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Nav */}
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="px-4 py-2 text-xs uppercase tracking-widest text-gray-400 hover:text-[#ED1C24] border border-[#2a2a2a] hover:border-[#ED1C24]/50 rounded-lg transition-all duration-300"
                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                            >
                                Admin
                            </Link>
                        )}
                        {user ? (
                            <button
                                onClick={signOut}
                                className="px-4 py-2 text-xs uppercase tracking-widest text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-all duration-300 cursor-pointer"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 text-xs uppercase tracking-widest text-[#ED1C24] border border-[#ED1C24]/30 hover:bg-[#ED1C24] hover:text-white rounded-lg transition-all duration-300"
                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom racing stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-px">
                <div className="h-full bg-gradient-to-r from-transparent via-[#ED1C24]/50 to-transparent" />
            </div>
        </header>
    );
}
