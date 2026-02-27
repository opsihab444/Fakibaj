import React from 'react';

interface LogoProps {
    size?: number | string;
    className?: string;
    color?: string;
}

export const LogoIcon: React.FC<LogoProps> = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Soft Shadow */}
        <ellipse cx="50" cy="85" rx="30" ry="6" fill="#000000" opacity="0.3" />

        {/* Body Base & Outline */}
        <path d="M20 60 C20 15, 80 15, 80 60 C80 95, 20 95, 20 60 Z" fill="#10b981" stroke="#047857" strokeWidth="4" strokeLinejoin="round" />
        <path d="M26 60 C26 23, 74 23, 74 60 C74 88, 26 88, 26 60 Z" fill="#34d399" />

        {/* Unbothered Half Closed Sleepy Eyes */}
        <rect x="32" y="44" width="12" height="4" rx="2" fill="#040406" />
        <path d="M30 40 Q37.5 35 45 40" stroke="#047857" strokeWidth="3" strokeLinecap="round" fill="none" />

        <rect x="56" y="44" width="12" height="4" rx="2" fill="#040406" />
        <path d="M55 40 Q62.5 35 70 40" stroke="#047857" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Tiny cute lazy smile (covered partially) */}
        <path d="M44 54 Q 50 58 56 54" stroke="#047857" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Big Pink Bubble Gum Bubble */}
        <circle cx="50" cy="66" r="15" fill="#f472b6" stroke="#db2777" strokeWidth="2.5" />
        {/* Bubble highlight reflection */}
        <path d="M41 61 A 8 8 0 0 1 48 53" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />

        {/* Comic Style Sleepy Zzzs */}
        <path d="M68 25 L82 25 L73 35 L87 35" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M85 10 L95 10 L88 17 L98 17" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
    </svg>
);
