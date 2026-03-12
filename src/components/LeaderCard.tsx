'use client';

import type { LeaderboardEntry } from '@/lib/types';

interface LeaderCardProps {
    entry: LeaderboardEntry;
    rank: number;
    clusterColor: string;
    onClick: () => void;
}

export default function LeaderCard({
    entry,
    rank,
    clusterColor,
    onClick,
}: LeaderCardProps) {
    const isTop = rank <= 2;
    const photoUrl = entry.photo_url || null;

    return (
        <div
            className={`group relative cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${isTop ? 'col-span-1' : ''
                }`}
            onClick={onClick}
        >
            {/* Card container with skew effect */}
            <div
                className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${isTop
                        ? 'bg-gradient-to-br from-[#1a1a1a] to-[#111] border-opacity-60'
                        : 'bg-[#111]/80 border-[#2a2a2a] hover:border-opacity-60'
                    }`}
                style={{
                    borderColor: isTop ? clusterColor : undefined,
                    boxShadow: isTop ? `0 0 30px ${clusterColor}15` : undefined,
                }}
            >
                {/* Top accent bar */}
                <div
                    className="h-1 w-full"
                    style={{
                        background: `linear-gradient(to right, ${clusterColor}, transparent)`,
                    }}
                />

                <div className="p-4">
                    <div className="flex items-center gap-3">
                        {/* Rank number */}
                        <div className="relative flex-shrink-0">
                            <div
                                className="w-10 h-10 flex items-center justify-center rounded-lg transform -skew-x-6"
                                style={{
                                    background:
                                        rank === 1
                                            ? `linear-gradient(135deg, ${clusterColor}, ${clusterColor}88)`
                                            : rank === 2
                                                ? `linear-gradient(135deg, ${clusterColor}66, ${clusterColor}33)`
                                                : '#1a1a1a',
                                    border:
                                        rank > 2 ? `1px solid ${clusterColor}33` : 'none',
                                }}
                            >
                                <span
                                    className={`font-black text-lg skew-x-6 ${rank <= 2 ? 'text-white' : 'text-gray-500'
                                        }`}
                                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                                >
                                    {rank}
                                </span>
                            </div>
                            {rank === 1 && (
                                <div className="absolute -top-1 -right-1 text-xs">🏆</div>
                            )}
                        </div>

                        {/* Photo */}
                        <div
                            className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all duration-300 group-hover:border-opacity-80"
                            style={{ borderColor: `${clusterColor}44` }}
                        >
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={entry.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{
                                        background: `linear-gradient(135deg, ${clusterColor}44, ${clusterColor}22)`,
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

                        {/* Name & Cluster */}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate leading-tight">
                                {entry.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {entry.cluster}
                            </p>
                        </div>
                    </div>

                    {/* Score bars */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                            { label: 'PP', value: entry.pp },
                            { label: 'DP', value: entry.dp },
                            { label: 'TP', value: entry.tp },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
                                    {stat.label}
                                </p>
                                <div className="relative h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.max(0, Math.min(100, stat.value))}%`,
                                            background:
                                                stat.value < 0
                                                    ? '#EF4444'
                                                    : `linear-gradient(to right, ${clusterColor}88, ${clusterColor})`,
                                        }}
                                    />
                                </div>
                                <p
                                    className={`text-xs font-bold mt-1 ${stat.value < 0 ? 'text-red-400' : 'text-white'
                                        }`}
                                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                                >
                                    {stat.value.toFixed(1)}%
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hover glow */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                    style={{
                        boxShadow: `inset 0 0 40px ${clusterColor}08`,
                    }}
                />
            </div>
        </div>
    );
}
