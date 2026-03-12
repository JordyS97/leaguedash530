'use client';

import { useEffect, useCallback } from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import type { LeaderboardEntry } from '@/lib/types';
import { CLUSTER_CONFIG, type ClusterType } from '@/lib/types';

interface RadarChartModalProps {
    entry: LeaderboardEntry;
    onClose: () => void;
}

export default function RadarChartModal({ entry, onClose }: RadarChartModalProps) {
    const config = CLUSTER_CONFIG[entry.cluster as ClusterType];

    // Handle ESC key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    // Normalize values for radar chart
    // DP can be negative, so we shift all values up by the magnitude of the minimum
    const minVal = Math.min(entry.pp, entry.dp, entry.tp, 0);
    const offset = minVal < 0 ? Math.abs(minVal) : 0;
    const maxVal = Math.max(entry.pp + offset, entry.dp + offset, entry.tp + offset, 100);

    const radarData = [
        {
            metric: 'Performance (PP)',
            value: entry.pp + offset,
            actual: entry.pp,
            fullMark: maxVal,
        },
        {
            metric: 'Development (DP)',
            value: entry.dp + offset,
            actual: entry.dp,
            fullMark: maxVal,
        },
        {
            metric: 'Total Perf (TP)',
            value: entry.tp + offset,
            actual: entry.tp,
            fullMark: maxVal,
        },
    ];

    const photoUrl = entry.photo_url || null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg bg-gradient-to-br from-[#1a1a1a] to-[#0D0D0D] border border-[#2a2a2a] rounded-2xl shadow-2xl animate-slideUp overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top accent */}
                <div
                    className="h-1 w-full"
                    style={{
                        background: `linear-gradient(to right, ${config.color}, transparent)`,
                    }}
                />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-all z-10 cursor-pointer"
                >
                    ✕
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Player Info */}
                    <div className="flex items-center gap-4 mb-6">
                        <div
                            className="w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0"
                            style={{ borderColor: `${config.color}44` }}
                        >
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={entry.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                                    style={{
                                        background: `linear-gradient(135deg, ${config.color}44, ${config.color}22)`,
                                    }}
                                >
                                    {entry.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{entry.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-bold"
                                    style={{
                                        backgroundColor: `${config.color}22`,
                                        color: config.color,
                                        border: `1px solid ${config.color}33`,
                                    }}
                                >
                                    {entry.cluster}
                                </span>
                                <span className="text-xs text-gray-600">{config.tagline}</span>
                            </div>
                        </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="relative">
                        {/* Deficit zone indicator */}
                        {offset > 0 && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                <span className="text-[10px] text-red-400 uppercase tracking-wider">
                                    Deficit Zone Active
                                </span>
                            </div>
                        )}

                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                                    <PolarGrid
                                        stroke="#2a2a2a"
                                        strokeDasharray="3 3"
                                    />
                                    <PolarAngleAxis
                                        dataKey="metric"
                                        tick={{
                                            fill: '#9ca3af',
                                            fontSize: 11,
                                            fontFamily: 'Inter, sans-serif',
                                        }}
                                    />
                                    <PolarRadiusAxis
                                        angle={90}
                                        domain={[0, maxVal]}
                                        tick={{ fill: '#4b5563', fontSize: 9 }}
                                        axisLine={false}
                                    />
                                    <Radar
                                        name={entry.name}
                                        dataKey="value"
                                        stroke={config.color}
                                        fill={config.color}
                                        fillOpacity={0.25}
                                        strokeWidth={2}
                                        dot={{
                                            r: 4,
                                            fill: config.color,
                                            stroke: '#0D0D0D',
                                            strokeWidth: 2,
                                        }}
                                    />
                                    <Tooltip
                                        content={({ payload }) => {
                                            if (!payload || payload.length === 0) return null;
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 shadow-xl">
                                                    <p className="text-xs text-gray-400 mb-1">
                                                        {data.metric}
                                                    </p>
                                                    <p
                                                        className={`text-sm font-bold ${data.actual < 0 ? 'text-red-400' : 'text-white'
                                                            }`}
                                                    >
                                                        {data.actual.toFixed(1)}%
                                                    </p>
                                                </div>
                                            );
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Score Summary */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[
                            { label: 'Performance', key: 'pp', value: entry.pp },
                            { label: 'Development', key: 'dp', value: entry.dp },
                            { label: 'Total Perf', key: 'tp', value: entry.tp },
                        ].map((stat) => (
                            <div
                                key={stat.key}
                                className="text-center p-3 bg-[#111] rounded-xl border border-[#1a1a1a]"
                            >
                                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
                                    {stat.label}
                                </p>
                                <p
                                    className={`text-lg font-black ${stat.value < 0 ? 'text-red-400' : 'text-white'
                                        }`}
                                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                                >
                                    {stat.value.toFixed(1)}
                                    <span className="text-xs text-gray-600">%</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
