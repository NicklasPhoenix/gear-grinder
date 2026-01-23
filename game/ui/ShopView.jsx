import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MaterialIcon } from './MaterialIcons';

// Exchange rates - intentionally inefficient to preserve farming incentives
const EXCHANGE_RATES = [
    { from: 'gold', to: 'enhanceStone', fromAmount: 1000, toAmount: 10, fromName: 'Silver', toName: 'Enhance Stones' },
    { from: 'enhanceStone', to: 'blessedOrb', fromAmount: 100, toAmount: 5, fromName: 'Enhance Stones', toName: 'Blessed Orbs' },
    { from: 'blessedOrb', to: 'celestialShard', fromAmount: 50, toAmount: 3, fromName: 'Blessed Orbs', toName: 'Celestial Shards' },
];

function ExchangeRow({ exchange, state, gameManager }) {
    const [amount, setAmount] = useState(1);

    const currentAmount = state?.[exchange.from] ?? 0;
    const maxExchanges = Math.floor(currentAmount / exchange.fromAmount);
    const canAfford = amount > 0 && amount <= maxExchanges;

    const totalCost = amount * exchange.fromAmount;
    const totalGain = amount * exchange.toAmount;

    const handleExchange = () => {
        if (!canAfford || amount < 1) return;

        gameManager?.setState(prev => ({
            ...prev,
            [exchange.from]: (prev[exchange.from] || 0) - totalCost,
            [exchange.to]: (prev[exchange.to] || 0) + totalGain,
        }));

        gameManager?.emit('floatingText', {
            text: `+${totalGain.toLocaleString()} ${exchange.toName}!`,
            type: 'heal',
            target: 'player'
        });
    };

    const handleSetMax = () => {
        setAmount(Math.max(1, maxExchanges));
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setAmount(0);
            return;
        }
        const num = parseInt(val, 10);
        if (!isNaN(num) && num >= 0) {
            setAmount(num);
        }
    };

    return (
        <div className={`bg-slate-900/50 rounded-lg p-4 border transition-all ${
            maxExchanges > 0 ? 'border-slate-600 hover:border-slate-500' : 'border-slate-800'
        }`}>
            {/* Exchange Rate Display */}
            <div className="flex items-center justify-center gap-4 mb-4">
                {/* From side */}
                <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-2">
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

            {/* Balance Info */}
            <div className="text-center text-sm mb-3">
                <span className="text-slate-500">You have: </span>
                <span className={maxExchanges > 0 ? 'text-green-400 font-bold' : 'text-slate-400'}>
                    {currentAmount.toLocaleString()} {exchange.fromName}
                </span>
                {maxExchanges > 0 && (
                    <span className="text-slate-600 ml-2">
                        (max {maxExchanges.toLocaleString()}x)
                    </span>
                )}
            </div>

            {/* Amount Controls */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                {/* Amount Input with +/- buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setAmount(Math.max(1, amount - 1))}
                        disabled={amount <= 1}
                        className="w-8 h-8 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
                    >
                        -
                    </button>
                    <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        className="w-20 h-8 bg-slate-800 border border-slate-600 rounded text-center text-white font-bold focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={() => setAmount(Math.min(maxExchanges, amount + 1))}
                        disabled={amount >= maxExchanges}
                        className="w-8 h-8 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
                    >
                        +
                    </button>
                </div>

                {/* Max Button */}
                <button
                    onClick={handleSetMax}
                    disabled={maxExchanges < 1}
                    className="px-3 h-8 rounded text-sm font-bold bg-yellow-600/40 text-yellow-300 hover:bg-yellow-600/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Max
                </button>

                {/* Exchange Button */}
                <button
                    onClick={handleExchange}
                    disabled={!canAfford}
                    className={`flex-1 h-8 rounded text-sm font-bold transition-all ${
                        canAfford
                            ? 'bg-green-600/40 text-green-300 hover:bg-green-600/60 active:scale-[0.98]'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                >
                    Exchange
                </button>
            </div>

            {/* Preview of exchange */}
            {amount > 0 && maxExchanges > 0 && (
                <div className="mt-3 text-center text-sm">
                    <span className="text-red-400">-{totalCost.toLocaleString()} {exchange.fromName}</span>
                    <span className="text-slate-600 mx-2">→</span>
                    <span className="text-green-400">+{totalGain.toLocaleString()} {exchange.toName}</span>
                </div>
            )}
        </div>
    );
}

export default function ShopView() {
    const { state, gameManager } = useGame();

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
                        {EXCHANGE_RATES.map((exchange, idx) => (
                            <ExchangeRow
                                key={idx}
                                exchange={exchange}
                                state={state}
                                gameManager={gameManager}
                            />
                        ))}
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
