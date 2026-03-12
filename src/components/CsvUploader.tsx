'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { createClient } from '@/lib/supabase/client';
import type { CsvRow } from '@/lib/types';

export default function CsvUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<CsvRow[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'parsed' | 'validating' | 'ready' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const supabase = createClient();

    const handleFile = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        setWarnings([]);
        setMessage('');

        Papa.parse<CsvRow>(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data;

                // Validate headers
                const required = ['Name', 'Cluster', 'PP', 'DP', 'TP'];
                const headers = Object.keys(data[0] || {});
                const missing = required.filter((h) => !headers.includes(h));

                if (missing.length > 0) {
                    setMessage(`Missing CSV columns: ${missing.join(', ')}`);
                    setStatus('error');
                    return;
                }

                setParsedData(data);
                setStatus('parsed');
                setMessage(`Parsed ${data.length} rows. Click "Validate" to check names.`);
            },
            error: (err) => {
                setMessage(`Parse error: ${err.message}`);
                setStatus('error');
            },
        });
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile && droppedFile.name.endsWith('.csv')) {
                handleFile(droppedFile);
            } else {
                setMessage('Please drop a .csv file');
                setStatus('error');
            }
        },
        [handleFile]
    );

    const validateNames = async () => {
        setStatus('validating');
        setMessage('Checking names against profiles...');

        const names = parsedData.map((row) => row.Name.trim());
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('name')
            .in('name', names);

        if (error) {
            setMessage(`Validation error: ${error.message}`);
            setStatus('error');
            return;
        }

        const profileNames = new Set((profiles || []).map((p) => p.name));
        const unmatched = names.filter((n) => !profileNames.has(n));

        if (unmatched.length > 0) {
            setWarnings(unmatched);
            setMessage(
                `⚠️ ${unmatched.length} name(s) not found in profiles. You can still upload, but these entries won't have photos.`
            );
        } else {
            setMessage('✅ All names verified! Ready to upload.');
        }
        setStatus('ready');
    };

    const handleUpload = async () => {
        setUploading(true);
        setStatus('uploading');
        setMessage('Deleting existing data...');

        try {
            // Step 1: Delete all existing leaderboard data
            const { error: deleteError } = await supabase
                .from('leaderboard')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows

            if (deleteError) {
                throw new Error(`Delete failed: ${deleteError.message}`);
            }

            setMessage('Inserting new data...');

            // Step 2: Insert new data
            const rows = parsedData.map((row) => ({
                name: row.Name.trim(),
                cluster: row.Cluster.trim(),
                pp: parseFloat(row.PP) || 0,
                dp: parseFloat(row.DP) || 0,
                tp: parseFloat(row.TP) || 0,
            }));

            const { error: insertError } = await supabase
                .from('leaderboard')
                .insert(rows);

            if (insertError) {
                throw new Error(`Insert failed: ${insertError.message}`);
            }

            setMessage(`🏁 Success! ${rows.length} records uploaded. Leaderboard refreshed.`);
            setStatus('success');
            setParsedData([]);
            setFile(null);
            setWarnings([]);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Upload failed');
            setStatus('error');
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setParsedData([]);
        setWarnings([]);
        setMessage('');
        setStatus('idle');
        setUploading(false);
    };

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${dragOver
                        ? 'border-[#ED1C24] bg-[#ED1C24]/5'
                        : 'border-[#2a2a2a] hover:border-[#ED1C24]/50 bg-[#111]/50'
                    }`}
                onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.csv';
                    input.onchange = (e) => {
                        const f = (e.target as HTMLInputElement).files?.[0];
                        if (f) handleFile(f);
                    };
                    input.click();
                }}
            >
                <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 text-gray-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-medium">
                            {file ? file.name : 'Drop your CSV here or click to browse'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Expected headers: Name, Cluster, PP, DP, TP
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Message */}
            {message && (
                <div
                    className={`px-4 py-3 rounded-xl text-sm ${status === 'error'
                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                            : status === 'success'
                                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                        }`}
                >
                    {message}
                </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <p className="text-sm font-medium text-amber-400 mb-2">
                        ⚠️ Unmatched Names ({warnings.length})
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {warnings.map((name, i) => (
                            <p key={i} className="text-xs text-amber-400/70 pl-2 border-l-2 border-amber-500/30">
                                {name}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview Table */}
            {parsedData.length > 0 && (
                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                            Preview ({parsedData.length} rows)
                        </span>
                    </div>
                    <div className="overflow-x-auto max-h-60">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#2a2a2a]">
                                    {['#', 'Name', 'Cluster', 'PP', 'DP', 'TP'].map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 10).map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50"
                                    >
                                        <td className="px-3 py-2 text-gray-600">{i + 1}</td>
                                        <td className="px-3 py-2 text-white font-medium">{row.Name}</td>
                                        <td className="px-3 py-2 text-gray-400">{row.Cluster}</td>
                                        <td className="px-3 py-2 text-gray-400">{row.PP}</td>
                                        <td
                                            className={`px-3 py-2 ${parseFloat(row.DP) < 0 ? 'text-red-400' : 'text-gray-400'
                                                }`}
                                        >
                                            {row.DP}
                                        </td>
                                        <td className="px-3 py-2 text-gray-400">{row.TP}</td>
                                    </tr>
                                ))}
                                {parsedData.length > 10 && (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-2 text-center text-gray-600 text-xs">
                                            ... and {parsedData.length - 10} more rows
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {parsedData.length > 0 && (
                <div className="flex gap-3">
                    {status === 'parsed' && (
                        <button
                            onClick={validateNames}
                            className="flex-1 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium hover:bg-blue-500/30 transition-all cursor-pointer"
                        >
                            Validate Names
                        </button>
                    )}
                    {(status === 'ready' || status === 'parsed') && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1 py-3 bg-gradient-to-r from-[#ED1C24] to-[#b91520] text-white font-bold rounded-xl hover:from-[#ff2d35] hover:to-[#ED1C24] transition-all disabled:opacity-50 shadow-lg shadow-[#ED1C24]/20 cursor-pointer"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                            {uploading ? 'UPLOADING...' : '🏁 REWRITE LEADERBOARD'}
                        </button>
                    )}
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] rounded-xl hover:bg-[#2a2a2a] transition-all cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
