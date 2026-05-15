import React from 'react';
import type { IconProps } from '../IconProps';


export const Logo: React.FC<IconProps> = ({ className }) => {
    return (
        <svg
            className={className} 
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <defs>
                <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            <path
                stroke="url(#brain-gradient)"
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185"
            />
            {/* Inner neural nodes */}
            <circle cx="8" cy="11" r="1.5" fill="url(#brain-gradient)" />
            <circle cx="16" cy="11" r="1.5" fill="url(#brain-gradient)" />
            <circle cx="12" cy="14" r="1.5" fill="url(#brain-gradient)" />
            <circle cx="9" cy="16" r="1.5" fill="url(#brain-gradient)" />
            <circle cx="15" cy="16" r="1.5" fill="url(#brain-gradient)" />
            
            <line x1="8" y1="11" x2="12" y2="14" stroke="url(#brain-gradient)" strokeWidth="0.5" />
            <line x1="16" y1="11" x2="12" y2="14" stroke="url(#brain-gradient)" strokeWidth="0.5" />
            <line x1="9" y1="16" x2="12" y2="14" stroke="url(#brain-gradient)" strokeWidth="0.5" />
            <line x1="15" y1="16" x2="12" y2="14" stroke="url(#brain-gradient)" strokeWidth="0.5" />
        </svg>
    );
};