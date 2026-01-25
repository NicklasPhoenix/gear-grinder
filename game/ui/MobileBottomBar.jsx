import React from 'react';
import { formatWithCommas } from '../utils/format';
import { LEVEL_UP } from '../data/constants';

/**
 * MobileBottomBar - XP bar and level display for mobile
 *
 * Layout:
 * ┌─────────────────────────────────┐
 * │ Lv.41    ████████████░░░░  XP  │
 * │          1,719,808 / 1,805,943 │
 * └─────────────────────────────────┘
 */
export default function MobileBottomBar({ level, xp }) {
    const xpForLevel = (lvl) => Math.floor(LEVEL_UP.BASE_XP * Math.pow(LEVEL_UP.XP_SCALING, lvl - 1));
    const xpNeeded = xpForLevel(level);
    const progress = Math.min(100, (xp / xpNeeded) * 100);

    return (
        <div className="bg-slate-950 border-t border-slate-800 px-3 py-2">
            <div className="flex items-center gap-3">
                {/* Level Badge */}
                <div className="flex items-center gap-1 min-w-[60px]">
                    <span className="text-slate-500 text-xs">Lv.</span>
                    <span className="text-xl font-bold text-purple-400">{level}</span>
                </div>

                {/* XP Bar */}
                <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>XP</span>
                        <span>{formatWithCommas(xp)} / {formatWithCommas(xpNeeded)}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
