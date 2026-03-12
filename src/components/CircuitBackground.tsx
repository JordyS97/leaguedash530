import Image from 'next/image';
import type { LeaderboardEntry, ClusterType } from '@/lib/types';
import { CLUSTER_CONFIG } from '@/lib/types';

interface CircuitBackgroundProps {
    topRiders?: { cluster: ClusterType; entry: LeaderboardEntry }[];
}

// Positions around the circuit for each cluster's top rider face
const FACE_POSITIONS: Record<string, { top: string; left: string }> = {
    MotoGP: { top: '15%', left: '42%' },
    Moto2: { top: '30%', left: '30%' },
    Moto3: { top: '65%', left: '35%' },
    MXGP: { top: '50%', left: '58%' },
    WSBK: { top: '80%', left: '50%' },
};

export default function CircuitBackground({ topRiders = [] }: CircuitBackgroundProps) {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
            {/* The real Mandalika Circuit PNG */}
            <div className="relative w-[700px] h-[700px]">
                {/* Yellow soft glow behind the circuit */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(255, 200, 50, 0.15) 0%, rgba(255, 200, 50, 0.05) 40%, transparent 70%)',
                        filter: 'blur(50px)',
                        transform: 'scale(1.4)',
                    }}
                />

                {/* Circuit image */}
                <div className="relative w-full h-full opacity-[0.15]">
                    <Image
                        src="/mandalika-circuit.png"
                        alt="Mandalika International Circuit"
                        fill
                        className="object-contain"
                        style={{
                            filter: 'invert(1) drop-shadow(0 0 20px rgba(255, 200, 50, 0.5)) drop-shadow(0 0 50px rgba(255, 200, 50, 0.2))',
                        }}
                        priority
                    />
                </div>

                {/* Top rider faces positioned on the circuit */}
                {topRiders.map(({ cluster, entry }) => {
                    const pos = FACE_POSITIONS[cluster];
                    const config = CLUSTER_CONFIG[cluster];
                    if (!pos) return null;

                    return (
                        <div
                            key={cluster}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                            style={{ top: pos.top, left: pos.left }}
                        >
                            {/* Face circle with cluster-colored ring */}
                            <div
                                className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg"
                                style={{
                                    borderColor: config.color,
                                    boxShadow: `0 0 15px ${config.color}44, 0 0 30px ${config.color}22`,
                                }}
                            >
                                {entry.photo_url ? (
                                    <img
                                        src={entry.photo_url}
                                        alt={entry.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: config.color + '33' }}
                                    >
                                        {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                            </div>
                            {/* Gold #1 badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-[8px] font-black text-black shadow-md">
                                1
                            </div>
                            {/* Name label */}
                            <div
                                className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider"
                                style={{
                                    backgroundColor: config.color + '22',
                                    color: config.color,
                                    border: `1px solid ${config.color}44`,
                                }}
                            >
                                {entry.name.split(' ')[0].slice(0, 6).toUpperCase()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Subtle grid lines overlay */}
            <svg
                className="absolute inset-0 w-full h-full opacity-[0.02]"
                xmlns="http://www.w3.org/2000/svg"
            >
                {Array.from({ length: 30 }).map((_, i) => (
                    <line
                        key={`h-${i}`}
                        x1="0"
                        y1={i * 40}
                        x2="100%"
                        y2={i * 40}
                        stroke="#ED1C24"
                        strokeWidth="0.5"
                    />
                ))}
                {Array.from({ length: 50 }).map((_, i) => (
                    <line
                        key={`v-${i}`}
                        x1={i * 40}
                        y1="0"
                        x2={i * 40}
                        y2="100%"
                        stroke="#ED1C24"
                        strokeWidth="0.5"
                    />
                ))}
            </svg>
        </div>
    );
}
