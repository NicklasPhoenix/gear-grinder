import React from 'react';
import { useGame } from '../context/GameContext';
import { MaterialIcon } from './MaterialIcons';

// Exchange rates - intentionally inefficient to preserve farming incentives
const EXCHANGE_RATES = [
    { from: 'gold', to: 'enhanceStone', fromAmount: 1000, toAmount: 10, fromName: 'Silver', toName: 'Enhance Stones' },
    { from: 'enhanceStone', to: 'blessedOrb', fromAmount: 100, toAmount: 5, fromName: 'Enhance Stones', toName: 'Blessed Orbs' },
    { from: 'blessedOrb', to: 'celestialShard', fromAmount: 50, toAmount: 3, fromName: 'Blessed Orbs', toName: 'Celestial Shards' },
];

export default function ShopView() {
    const { state, gameManager } = useGame();

    const handleExchange = (exchange) => {
        const currentFrom = state?.[exchange.from] ?? 0;
        if (currentFrom < exchange.fromAmount) return;

        gameManager?.setState(prev => ({
            ...prev,
            [exchange.from]: (prev[exchange.from] || 0) - exchange.fromAmount,
            [exchange.to]: (prev[exchange.to] || 0) + exchange.toAmount,
        }));

        // Visual feedback
        gameManager?.emit('floatingText', {
            text: `+${exchange.toAmount} ${exchange.toName}!`,
            type: 'heal',
            target: 'player'
        });
    };

    const handleExchangeAll = (exchange) => {
        const currentFrom = state?.[exchange.from] ?? 0;
        const maxExchanges = Math.floor(currentFrom / exchange.fromAmount);
        if (maxExchanges < 1) return;

        const totalFrom = maxExchanges * exchange.fromAmount;
        const totalTo = maxExchanges * exchange.toAmount;

        gameManager?.setState(prev => ({
            ...prev,
            [exchange.from]: (prev[exchange.from] || 0) - totalFrom,
            [exchange.to]: (prev[exchange.to] || 0) + totalTo,
        }));

        gameManager?.emit('floatingText', {
            text: `+${totalTo} ${exchange.toName}!`,
            type: 'heal',
            target: 'player'
        });
    };

    return (
        <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-lg mx-auto w-full space-y-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-200 mb-2">Resource Exchange</h2>
                    <p className="text-slate-500 text-sm">Convert surplus resources into what you need</p>
                </div>

                {/* Exchange Info */}
                <div className="game-panel">
                    <div className="game-panel-header">How It Works</div>
                    <div className="p-4">
                        <p className="text-sm text-slate-400">
                            Exchange rates are <span className="text-yellow-400">intentionally inefficient</span> -
                            farming is always more efficient! Use this when you have a surplus of one
                            resource and urgently need another.
                        </p>
                    </div>
                </div>

                {/* Exchange Options */}
                <div className="game-panel">
                    <div className="game-panel-header">Available Exchanges</div>
                    <div className="p-4 space-y-4">
                        {EXCHANGE_RATES.map((exchange, idx) => {
                            const currentAmount = state?.[exchange.from] ?? 0;
                            const canAfford = currentAmount >= exchange.fromAmount;
                            const maxExchanges = Math.floor(currentAmount / exchange.fromAmount);

                            return (
                                <div
                                    key={idx}
                                    className={`bg-slate-900/50 rounded-lg p-4 border transition-all ${
                                        canAfford ? 'border-slate-600 hover:border-slate-500' : 'border-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-4 mb-3">
                                        {/* From side */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                                <MaterialIcon type={exchange.from === 'gold' ? 'gold' : exchange.from} size={24} />
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-slate-200">
                                                    {exchange.fromAmount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-500">{exchange.fromName}</div>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="text-2xl text-slate-600">→</div>

                                        {/* To side */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                                <MaterialIcon type={exchange.to} size={24} />
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-slate-200">
                                                    {exchange.toAmount}
                                                </div>
                                                <div className="text-xs text-slate-500">{exchange.toName}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current balance and buttons */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                                        <div className="text-sm">
                                            <span className="text-slate-500">You have: </span>
                                            <span className={canAfford ? 'text-green-400 font-bold' : 'text-slate-400'}>
                                                {currentAmount.toLocaleString()} {exchange.fromName}
                                            </span>
                                            {maxExchanges > 0 && (
                                                <span className="text-slate-600 ml-2">
                                                    ({maxExchanges}x possible)
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {maxExchanges > 1 && (
                                                <button
                                                    onClick={() => handleExchangeAll(exchange)}
                                                    className="px-3 py-1.5 rounded text-sm font-bold bg-yellow-600/40 text-yellow-300 hover:bg-yellow-600/60 active:scale-95 transition-all"
                                                >
                                                    All ({maxExchanges}x)
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleExchange(exchange)}
                                                disabled={!canAfford}
                                                className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${
                                                    canAfford
                                                        ? 'bg-green-600/40 text-green-300 hover:bg-green-600/60 active:scale-95'
                                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                }`}
                                            >
                                                Exchange
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tips */}
                <div className="game-panel">
                    <div className="game-panel-header">Tips</div>
                    <div className="p-4 space-y-2 text-sm text-slate-400">
                        <p>• Farm boss zones for the best enhancement stone drops</p>
                        <p>• Higher zones drop blessed orbs and celestial shards directly</p>
                        <p>• Salvaging high-tier gear returns more enhancement stones</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
