'use client';

import { useState } from 'react';
import type { LeaderboardEntry, ClusterType } from '@/lib/types';
import { CLUSTER_CONFIG } from '@/lib/types';
import LeaderCard from './LeaderCard';
import RadarChartModal from './RadarChartModal';

interface ClusterGridProps {
    data: LeaderboardEntry[];
}

export default function ClusterGrid({ data }: ClusterGridProps) {
    const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

    // Group by cluster and sort by TP descending (ranking)
    const grouped = data.reduce((acc, entry) => {
        const cluster = entry.cluster as ClusterType;
        if (!acc[cluster]) acc[cluster] = [];
        acc[cluster].push(entry);
        return acc;
    }, {} as Record<ClusterType, LeaderboardEntry[]>);

    // Sort each cluster by TP
    Object.values(grouped).forEach((entries) =>
        entries.sort((a, b) => b.tp - a.tp)
    );

    const clusters: ClusterType[] = ['MotoGP', 'Moto2', 'Moto3', 'MXGP'];

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {clusters.map((cluster) => {
                    const entries = grouped[cluster] || [];
                    const config = CLUSTER_CONFIG[cluster];

                    return (
                        <div key={cluster} className="relative">
                            {/* Cluster Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg transform -skew-x-6"
                                    style={{
                                        background: `linear-gradient(135deg, ${config.color}22, ${config.color}11)`,
                                        border: `1px solid ${config.color}33`,
                                    }}
                                >
                                    <span className="text-lg skew-x-6">{config.icon}</span>
                                    <span
                                        className="font-black text-sm tracking-wider skew-x-6"
                                        style={{
                                            fontFamily: 'Orbitron, sans-serif',
                                            color: config.color,
                                        }}
                                    >
                                        {cluster.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-px"
                                        style={{ backgroundColor: `${config.color}44` }}
                                    />
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">
                                        {config.tagline}
                                    </span>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-[#2a2a2a] to-transparent" />
                                <span className="text-xs text-gray-600">
                                    {entries.length} riders
                                </span>
                            </div>

                            {/* Cards grid */}
                            {entries.length === 0 ? (
                                <div className="text-center py-12 text-gray-600 border border-dashed border-[#2a2a2a] rounded-xl">
                                    <p className="text-sm">No data available</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {entries.map((entry, idx) => (
                                        <LeaderCard
                                            key={entry.id}
                                            entry={entry}
                                            rank={idx + 1}
                                            clusterColor={config.color}
                                            onClick={() => setSelectedEntry(entry)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Radar Chart Modal */}
            {selectedEntry && (
                <RadarChartModal
                    entry={selectedEntry}
                    onClose={() => setSelectedEntry(null)}
                />
            )}
        </>
    );
}
