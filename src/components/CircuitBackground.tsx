export default function CircuitBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.08]">
            <svg
                viewBox="0 0 1200 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid slice"
            >
                {/* Mandalika-inspired circuit outline */}
                <path
                    d="M300 200 C300 200 350 100 500 120 C650 140 680 80 750 100 
             C820 120 900 90 950 150 C1000 210 1050 250 1020 350 
             C990 450 1000 500 950 550 C900 600 850 650 750 640 
             C650 630 600 680 500 660 C400 640 350 600 300 550 
             C250 500 200 450 220 350 C240 250 300 200 300 200Z"
                    stroke="#ED1C24"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Inner track detail */}
                <path
                    d="M340 220 C340 220 380 140 510 155 C640 170 670 115 730 135 
             C790 155 860 130 910 180 C960 230 1000 260 980 340 
             C960 420 965 460 920 510 C875 560 830 600 740 590 
             C650 580 610 630 510 615 C410 600 370 565 330 520 
             C290 475 250 430 265 350 C280 270 340 220 340 220Z"
                    stroke="#ED1C24"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="8 4"
                    strokeLinecap="round"
                />

                {/* Start/Finish line */}
                <line
                    x1="290"
                    y1="270"
                    x2="350"
                    y2="270"
                    stroke="#ED1C24"
                    strokeWidth="4"
                />

                {/* Turn markers */}
                {[
                    { x: 500, y: 110, n: '1' },
                    { x: 750, y: 85, n: '2' },
                    { x: 960, y: 145, n: '3' },
                    { x: 1030, y: 350, n: '4' },
                    { x: 960, y: 555, n: '5' },
                    { x: 750, y: 650, n: '6' },
                    { x: 500, y: 670, n: '7' },
                    { x: 300, y: 555, n: '8' },
                    { x: 215, y: 350, n: '9' },
                ].map((turn) => (
                    <g key={turn.n}>
                        <circle cx={turn.x} cy={turn.y} r="12" fill="#ED1C24" opacity="0.3" />
                        <text
                            x={turn.x}
                            y={turn.y + 4}
                            textAnchor="middle"
                            fill="#ED1C24"
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="Orbitron, sans-serif"
                        >
                            {turn.n}
                        </text>
                    </g>
                ))}

                {/* DRS Zone markers */}
                <rect x="600" y="95" width="80" height="16" rx="3" fill="#ED1C24" opacity="0.15" />
                <text
                    x="640"
                    y="107"
                    textAnchor="middle"
                    fill="#ED1C24"
                    fontSize="8"
                    fontFamily="Orbitron, sans-serif"
                    opacity="0.5"
                >
                    DRS ZONE
                </text>

                {/* Decorative grid lines */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <line
                        key={`h-${i}`}
                        x1="0"
                        y1={i * 40}
                        x2="1200"
                        y2={i * 40}
                        stroke="#ED1C24"
                        strokeWidth="0.3"
                        opacity="0.3"
                    />
                ))}
                {Array.from({ length: 30 }).map((_, i) => (
                    <line
                        key={`v-${i}`}
                        x1={i * 40}
                        y1="0"
                        x2={i * 40}
                        y2="800"
                        stroke="#ED1C24"
                        strokeWidth="0.3"
                        opacity="0.3"
                    />
                ))}
            </svg>
        </div>
    );
}
