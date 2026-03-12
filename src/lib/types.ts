export interface Profile {
    id: string;
    name: string;
    cluster: string;
    photo_url: string | null;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    cluster: 'MotoGP' | 'Moto2' | 'Moto3' | 'MXGP' | 'WSBK';
    pp: number;
    dp: number;
    tp: number;
    photo_url?: string | null;
}

export interface CsvRow {
    Name: string;
    Cluster: string;
    PP: string;
    DP: string;
    TP: string;
}

export const CLUSTERS = ['MotoGP', 'Moto2', 'Moto3', 'MXGP', 'WSBK'] as const;
export type ClusterType = (typeof CLUSTERS)[number];

export const CLUSTER_CONFIG: Record<
    ClusterType,
    { color: string; gradient: string; icon: string; tagline: string }
> = {
    MotoGP: {
        color: '#ED1C24',
        gradient: 'from-red-600 to-red-900',
        icon: '🏁',
        tagline: 'Premier Class',
    },
    Moto2: {
        color: '#3B82F6',
        gradient: 'from-blue-500 to-blue-800',
        icon: '⚡',
        tagline: 'Rising Stars',
    },
    Moto3: {
        color: '#10B981',
        gradient: 'from-emerald-500 to-emerald-800',
        icon: '🔥',
        tagline: 'Speed Demons',
    },
    MXGP: {
        color: '#F59E0B',
        gradient: 'from-amber-500 to-amber-800',
        icon: '🏆',
        tagline: 'Off-Road Kings',
    },
    WSBK: {
        color: '#8B5CF6',
        gradient: 'from-violet-500 to-violet-800',
        icon: '🏍️',
        tagline: 'Superbike Legends',
    },
};
