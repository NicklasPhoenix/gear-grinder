import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';

// Knight idle animation frames
const KNIGHT_IDLE_FRAMES = Array.from({ length: 12 }, (_, i) =>
    `/assets/animations/knight-idle/idle${i + 1}.png`
);

const FRAME_DURATION = 100; // ms per frame

export default function LevelUpModal({ level, onClose }) {
    const { state, gameManager } = useGame();
    const [currentFrame, setCurrentFrame] = useState(0);
    const [showContent, setShowContent] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Auto-pause setting
    const pauseOnLevelUp = state?.pauseOnLevelUp ?? true;

    // Pause combat when modal opens (if setting enabled)
    useEffect(() => {
        if (pauseOnLevelUp && gameManager && !state?.combatPaused) {
            gameManager.setState(prev => ({ ...prev, combatPaused: true }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pauseOnLevelUp, gameManager]);

    // Animate knight idle
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % KNIGHT_IDLE_FRAMES.length);
        }, FRAME_DURATION);
        return () => clearInterval(interval);
    }, []);

    // Show content with slight delay for entrance animation
    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle close with animation
    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    // Close on click or key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    // Auto-close after 5 seconds if not interacted with
    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [handleClose]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
                isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleClose}
        >
            {/* Darkened background */}
            <div
                className="absolute inset-0 bg-black/85"
                style={{
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Radial glow behind character */}
            <div
                className={`absolute w-[400px] h-[400px] rounded-full transition-all duration-500 ${
                    showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{
                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)',
                }}
            />

            {/* Main content */}
            <div
                className={`relative flex flex-col items-center transition-all duration-500 ${
                    showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Level Up Text - Above character */}
                <div
                    className={`mb-4 transition-all duration-700 delay-100 ${
                        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
                    }`}
                >
                    <h1
                        className="text-5xl md:text-6xl font-black tracking-wider animate-pulse"
                        style={{
                            color: '#fbbf24',
                            textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(147, 51, 234, 0.6), 0 4px 0 #b45309, 0 6px 10px rgba(0,0,0,0.5)'
                        }}
                    >
                        LEVEL UP!
                    </h1>
                </div>

                {/* Knight Animation */}
                <div
                    className={`relative flex items-center justify-center transition-all duration-500 delay-200 ${
                        showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                >
                    {/* Glow ring around character */}
                    <div
                        className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full animate-ping"
                        style={{
                            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
                            animationDuration: '2s',
                        }}
                    />

                    {/* Character sprite */}
                    <img
                        src={KNIGHT_IDLE_FRAMES[currentFrame]}
                        alt="Knight"
                        className="w-48 h-48 md:w-64 md:h-64 object-contain"
                        style={{
                            imageRendering: 'pixelated',
                            filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.6))'
                        }}
                    />
                </div>

                {/* Level Number */}
                <div
                    className={`mt-4 transition-all duration-700 delay-300 ${
                        showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50'
                    }`}
                >
                    <div
                        className="text-8xl md:text-9xl font-black"
                        style={{
                            color: '#ffffff',
                            textShadow: '0 0 30px rgba(147, 51, 234, 1), 0 0 60px rgba(147, 51, 234, 0.8), 0 6px 0 #7c3aed, 0 8px 15px rgba(0,0,0,0.5)'
                        }}
                    >
                        {level}
                    </div>
                </div>

                {/* Stat Points Info */}
                <div
                    className={`mt-4 transition-all duration-700 delay-400 ${
                        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                >
                    <div className="px-6 py-2 bg-purple-900/50 rounded-full border border-purple-500/50">
                        <span className="text-purple-200 text-lg font-semibold">
                            +3 Stat Points
                        </span>
                    </div>
                </div>

                {/* Click to continue hint */}
                <div
                    className={`mt-8 transition-all duration-700 delay-500 ${
                        showContent ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <span className="text-slate-400 text-sm animate-pulse">
                        Click anywhere or press any key to continue
                    </span>
                </div>

                {/* Paused indicator */}
                {pauseOnLevelUp && (
                    <div
                        className={`mt-2 transition-all duration-700 delay-500 ${
                            showContent ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <span className="text-yellow-500/60 text-xs">
                            Combat paused
                        </span>
                    </div>
                )}
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-purple-400/60 rounded-full animate-float-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* CSS for particle animation */}
            <style>{`
                @keyframes float-particle {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    50% {
                        transform: translateY(-100px) scale(1.5);
                        opacity: 0.8;
                    }
                    90% {
                        opacity: 0;
                    }
                }
                .animate-float-particle {
                    animation: float-particle 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
