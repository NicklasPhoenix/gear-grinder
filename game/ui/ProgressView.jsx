import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { COLLECTION_CATEGORIES, getOverallCollectionProgress, getCategoryProgress } from '../data/collections';
import { checkObjectives, formatTimeRemaining, applyObjectiveReward } from '../data/dailyObjectives';
import { getEndlessTitle, getNextMilestone, startEndlessRun, endEndlessRun, ENDLESS_CONFIG } from '../data/endlessMode';
import { MaterialIcon } from './MaterialIcons';

const SUB_TABS = [
    { id: 'objectives', label: 'Objectives', icon: '📋' },
    { id: 'collections', label: 'Collections', icon: '🏆' },
    { id: 'endless', label: 'Endless', icon: '♾️' },
];

export default function ProgressView() {
    const { state, gameManager } = useGame();
    const [activeTab, setActiveTab] = useState('objectives');
    const [selectedCategory, setSelectedCategory] = useState(COLLECTION_CATEGORIES[0].id);

    return (
        <div className="h-full flex flex-col">
            {/* Sub-tabs */}
            <div className="flex gap-1 p-2 border-b border-slate-700">
                {SUB_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-all ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <span className="mr-1">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {activeTab === 'objectives' && (
                    <ObjectivesSection state={state} gameManager={gameManager} />
                )}
                {activeTab === 'collections' && (
                    <CollectionsSection
                        state={state}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />
                )}
                {activeTab === 'endless' && (
                    <EndlessSection state={state} gameManager={gameManager} />
                )}
            </div>
        </div>
    );
}

function ObjectivesSection({ state, gameManager }) {
    const objectives = checkObjectives(state);

    const handleClaimDaily = () => {
        if (!objectives.daily.complete || objectives.daily.claimed) return;
        gameManager.setState(prev => {
            const newState = { ...prev };
            applyObjectiveReward(newState, objectives.daily.objective.reward);
            newState.dailyObjectiveClaimed = true;
            return newState;
        });
        gameManager.emit('floatingText', { text: 'Daily Claimed!', type: 'levelup', target: 'player' });
    };

    const handleClaimWeekly = () => {
        if (!objectives.weekly.complete || objectives.weekly.claimed) return;
        gameManager.setState(prev => {
            const newState = { ...prev };
            applyObjectiveReward(newState, objectives.weekly.objective.reward);
            newState.weeklyObjectiveClaimed = true;
            return newState;
        });
        gameManager.emit('floatingText', { text: 'Weekly Claimed!', type: 'levelup', target: 'player' });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📋</span> Daily & Weekly Objectives
            </h3>

            {/* Daily Objective */}
            <ObjectiveCard
                title="Daily Objective"
                objective={objectives.daily.objective}
                progress={objectives.daily.progress}
                target={objectives.daily.target}
                complete={objectives.daily.complete}
                claimed={objectives.daily.claimed}
                timeRemaining={objectives.daily.timeRemaining}
                onClaim={handleClaimDaily}
                color="blue"
            />

            {/* Weekly Objective */}
            <ObjectiveCard
                title="Weekly Objective"
                objective={objectives.weekly.objective}
                progress={objectives.weekly.progress}
                target={objectives.weekly.target}
                complete={objectives.weekly.complete}
                claimed={objectives.weekly.claimed}
                timeRemaining={objectives.weekly.timeRemaining}
                onClaim={handleClaimWeekly}
                color="purple"
            />
        </div>
    );
}

function ObjectiveCard({ title, objective, progress, target, complete, claimed, timeRemaining, onClaim, color }) {
    const percentage = Math.min(100, Math.round((progress / target) * 100));
    const colorClasses = {
        blue: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-400' },
        purple: { bg: 'bg-purple-600', border: 'border-purple-500', text: 'text-purple-400' }
    };
    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`bg-slate-800/60 rounded-lg border ${complete ? 'border-green-500' : colors.border} p-4`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="text-xs text-slate-500 uppercase">{title}</div>
                    <div className={`font-bold ${colors.text}`}>{objective?.name || 'Loading...'}</div>
                </div>
                <div className="text-xs text-slate-500">
                    Resets in {formatTimeRemaining(timeRemaining)}
                </div>
            </div>

            <p className="text-sm text-slate-300 mb-3">{objective?.description || '...'}</p>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{progress.toLocaleString()} / {target.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${complete ? 'bg-green-500' : colors.bg} transition-all`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2 text-xs">
                    {objective?.reward && Object.entries(objective.reward).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded">
                            <MaterialIcon type={key === 'silver' ? 'gold' : key} size={14} />
                            <span className="text-slate-300">+{value}</span>
                        </div>
                    ))}
                </div>

                {complete && !claimed && (
                    <button
                        onClick={onClaim}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded transition-colors"
                    >
                        CLAIM
                    </button>
                )}
                {claimed && (
                    <span className="text-green-400 text-sm font-bold">✓ Claimed</span>
                )}
            </div>
        </div>
    );
}

function CollectionsSection({ state, selectedCategory, setSelectedCategory }) {
    const overall = getOverallCollectionProgress(state);
    const categoryData = getCategoryProgress(state, selectedCategory);

    return (
        <div className="space-y-4">
            {/* Overall Progress */}
            <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🏆</span> Collection Progress
                    </h3>
                    <span className="text-2xl font-bold text-yellow-400">{overall.percentage}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                        style={{ width: `${overall.percentage}%` }}
                    />
                </div>
                <div className="text-xs text-slate-400 mt-1 text-right">
                    {overall.completed} / {overall.total} collected
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 flex-wrap">
                {COLLECTION_CATEGORIES.map(cat => {
                    const catProgress = getCategoryProgress(state, cat.id);
                    const isComplete = catProgress?.percentage === 100;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                selectedCategory === cat.id
                                    ? 'bg-blue-600 text-white'
                                    : isComplete
                                        ? 'bg-green-600/30 text-green-400 border border-green-500/50'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {cat.icon} {cat.name}
                            <span className="ml-1 opacity-60">{catProgress?.percentage}%</span>
                        </button>
                    );
                })}
            </div>

            {/* Category Items */}
            {categoryData && (
                <div className="bg-slate-800/40 rounded-lg p-3">
                    <div className="text-sm text-slate-400 mb-3">{categoryData.description}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categoryData.items.map(item => (
                            <div
                                key={item.id}
                                className={`p-2 rounded border ${
                                    item.isComplete
                                        ? 'bg-slate-700/50 border-green-500/50'
                                        : 'bg-slate-800/50 border-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-sm font-bold ${item.isComplete ? '' : 'opacity-50'}`}
                                        style={{ color: item.isComplete ? item.color : '#666' }}
                                    >
                                        {item.name}
                                    </span>
                                    {item.isComplete && <span className="text-green-400 text-xs">✓</span>}
                                </div>
                                {categoryData.getTotal() > 1 && (
                                    <div className="text-xs text-slate-500 mt-1">
                                        {item.progress} / {item.total} pieces
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function EndlessSection({ state, gameManager }) {
    const isActive = state.endlessActive;
    const bestWave = state.endlessBestWave || 0;
    const currentWave = state.endlessWave || 0;
    const title = getEndlessTitle(bestWave);
    const nextMilestone = getNextMilestone(currentWave);

    const handleStartEndless = () => {
        gameManager.setState(prev => {
            const newState = { ...prev };
            startEndlessRun(newState);
            return newState;
        });
        gameManager.emit('floatingText', { text: 'Endless Mode Started!', type: 'levelup', target: 'player' });
    };

    const handleEndEndless = () => {
        gameManager.setState(prev => {
            const newState = { ...prev };
            endEndlessRun(newState);
            return newState;
        });
        gameManager.emit('floatingText', { text: `Run Ended - Wave ${currentWave}`, type: 'death', target: 'player' });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>♾️</span> Endless Mode
            </h3>

            {/* Best Wave / Title */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-500/50">
                <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase">Personal Best</div>
                    <div className="text-4xl font-bold text-white my-1">Wave {bestWave}</div>
                    <div className="text-lg font-bold text-purple-400">{title}</div>
                </div>
            </div>

            {/* Active Run or Start Button */}
            {isActive ? (
                <div className="bg-slate-800/60 rounded-lg p-4 border border-orange-500/50">
                    <div className="text-center mb-4">
                        <div className="text-xs text-orange-400 uppercase">Current Run</div>
                        <div className="text-3xl font-bold text-white">Wave {currentWave}</div>
                        <div className="text-sm text-slate-400">{state.endlessEnemyName}</div>
                    </div>

                    {/* Enemy HP */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Enemy HP</span>
                            <span>{state.endlessEnemyHp?.toLocaleString()} / {state.endlessEnemyMaxHp?.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 transition-all"
                                style={{ width: `${(state.endlessEnemyHp / state.endlessEnemyMaxHp) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Run Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                        <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-slate-400">Kills</div>
                            <div className="text-white font-bold">{state.endlessKillsThisRun}</div>
                        </div>
                        <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-slate-400">Silver</div>
                            <div className="text-yellow-400 font-bold">{state.endlessGoldThisRun?.toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-slate-400">XP</div>
                            <div className="text-purple-400 font-bold">{state.endlessXpThisRun?.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Next Milestone */}
                    {nextMilestone && (
                        <div className="text-center text-xs text-slate-400 mb-4">
                            Next milestone: <span className="text-yellow-400">Wave {nextMilestone.wave}</span> - {nextMilestone.title}
                        </div>
                    )}

                    <button
                        onClick={handleEndEndless}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors"
                    >
                        END RUN (Return to Zones)
                    </button>
                </div>
            ) : (
                <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                    <p className="text-sm text-slate-300 mb-4">
                        Challenge yourself in an infinite dungeon with scaling enemies.
                        Earn rewards and compete for the highest wave!
                    </p>

                    {/* Milestones Preview */}
                    <div className="mb-4">
                        <div className="text-xs text-slate-400 uppercase mb-2">Milestone Rewards</div>
                        <div className="space-y-1">
                            {ENDLESS_CONFIG.milestones.slice(0, 4).map(m => (
                                <div key={m.wave} className={`flex justify-between text-xs p-1.5 rounded ${
                                    bestWave >= m.wave ? 'bg-green-600/20 text-green-400' : 'bg-slate-700/30 text-slate-400'
                                }`}>
                                    <span>Wave {m.wave} - {m.title}</span>
                                    <span>{bestWave >= m.wave ? '✓' : Object.entries(m.reward).map(([k,v]) => `${v} ${k}`).join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleStartEndless}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all"
                    >
                        START ENDLESS RUN
                    </button>
                </div>
            )}

            {/* Run History */}
            {state.endlessRunHistory?.length > 0 && (
                <div className="bg-slate-800/40 rounded-lg p-3">
                    <div className="text-xs text-slate-400 uppercase mb-2">Recent Runs</div>
                    <div className="space-y-1">
                        {state.endlessRunHistory.slice(0, 5).map((run, i) => (
                            <div key={i} className="flex justify-between text-xs p-2 bg-slate-700/30 rounded">
                                <span className="text-white font-bold">Wave {run.wave}</span>
                                <span className="text-slate-400">
                                    {run.kills} kills · {run.gold.toLocaleString()}s · {new Date(run.date).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
