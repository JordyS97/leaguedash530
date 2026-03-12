'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import CsvUploader from '@/components/CsvUploader';
import ProfileManager from '@/components/ProfileManager';

export default function AdminPage() {
    const { user, isAdmin, loading, signOut } = useAuth();
    const router = useRouter();
    const [checkingAdmin, setCheckingAdmin] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else {
                setCheckingAdmin(false);
            }
        }
    }, [user, loading, router]);

    if (loading || checkingAdmin) {
        return (
            <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
                <div className="animate-pulse text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
                <div className="max-w-md text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30">
                        <span className="text-3xl">🚫</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">Access Denied</h2>
                    <p className="text-gray-500 text-sm">
                        You don&apos;t have admin privileges. Contact your administrator.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <a
                            href="/"
                            className="px-4 py-2 text-sm text-gray-400 border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-all"
                        >
                            Back to Leaderboard
                        </a>
                        <button
                            onClick={signOut}
                            className="px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0D0D]">
            {/* Admin Header */}
            <header className="bg-gradient-to-r from-[#0D0D0D] via-[#1a1a1a] to-[#0D0D0D] border-b border-[#2a2a2a]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <a
                                href="/"
                                className="text-gray-500 hover:text-white transition-colors text-sm"
                            >
                                ← Board
                            </a>
                            <div className="w-px h-5 bg-[#2a2a2a]" />
                            <h1
                                className="text-sm font-bold text-white tracking-wider"
                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                            >
                                ADMIN <span className="text-[#ED1C24]">PANEL</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-600">{user?.email}</span>
                            <button
                                onClick={signOut}
                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-all cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Section Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#ED1C24]/10 border border-[#ED1C24]/20">
                            <span className="text-lg">📊</span>
                        </div>
                        <div>
                            <h2
                                className="text-lg font-bold text-white"
                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                            >
                                CSV <span className="text-[#ED1C24]">UPLOAD</span>
                            </h2>
                            <p className="text-xs text-gray-600">
                                Upload CSV data to populate or replace the leaderboard
                            </p>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                        <div className="flex items-start gap-2">
                            <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
                            <p className="text-xs text-amber-400/80">
                                <strong className="text-amber-400">Destructive action:</strong>{' '}
                                Uploading a CSV will <strong>DELETE ALL</strong> existing leaderboard
                                data, then insert the new data. This cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sample CSV Download */}
                <div className="mb-6 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-sm">📄</span>
                        <p className="text-xs text-gray-400">
                            Need the CSV format? Download the sample template with headers: <code className="text-gray-300 bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[10px]">Name, Cluster, PP, DP, TP</code>
                        </p>
                    </div>
                    <a
                        href="/sample_leaderboard.csv"
                        download="sample_leaderboard.csv"
                        className="flex-shrink-0 px-4 py-2 text-xs uppercase tracking-wider text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                        Download Sample
                    </a>
                </div>

                {/* CSV Uploader */}
                <CsvUploader />

                {/* Divider */}
                <div className="my-10 border-t border-[#2a2a2a]" />

                {/* Profile Manager */}
                <ProfileManager />
            </main>
        </div>
    );
}
