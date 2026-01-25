import React, { useState, useEffect } from 'react';
import { TIERS, SPECIAL_EFFECTS, EFFECT_TIER_CAPS } from '../data/items';
import { MaterialIcon } from './MaterialIcons';

const GUIDE_SECTIONS = [
    { id: 'basics', label: 'Basics' },
    { id: 'gear', label: 'Gear & Effects' },
    { id: 'enhancement', label: 'Enhancement' },
    { id: 'resources', label: 'Resources' },
    { id: 'prestige', label: 'Prestige' },
    { id: 'bosses', label: 'Bosses' },
    { id: 'stats', label: 'Stats' },
];

export default function GuideModal({ onClose }) {
    const [activeSection, setActiveSection] = useState('basics');

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 rounded-xl border-2 border-slate-700 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">📖</span>
                        Game Guide
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-2"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-40 border-r border-slate-700 p-2 flex flex-col gap-1">
                        {GUIDE_SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`px-3 py-2 rounded text-left text-sm font-semibold transition-all ${activeSection === section.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeSection === 'basics' && <BasicsSection />}
                        {activeSection === 'gear' && <GearSection />}
                        {activeSection === 'enhancement' && <EnhancementSection />}
                        {activeSection === 'resources' && <ResourcesSection />}
                        {activeSection === 'prestige' && <PrestigeSection />}
                        {activeSection === 'bosses' && <BossesSection />}
                        {activeSection === 'stats' && <StatsSection />}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-700 text-center text-slate-500 text-xs">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono">Esc</kbd> to close
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ children }) {
    return <h3 className="text-xl font-bold text-white mb-4">{children}</h3>;
}

function SubSection({ title, children }) {
    return (
        <div className="mb-6">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">{title}</h4>
            <div className="text-slate-300 text-sm space-y-2">{children}</div>
        </div>
    );
}

function BasicsSection() {
    return (
        <div>
            <SectionTitle>Game Basics</SectionTitle>

            <SubSection title="How to Play">
                <p>Your character automatically fights enemies in the current zone. Defeat enemies to earn XP, Silver, and gear drops.</p>
                <p>Equip better gear to increase your stats and progress to harder zones with better rewards.</p>
            </SubSection>

            <SubSection title="Leveling Up">
                <p>Gain XP from defeating enemies. Each level grants <span className="text-purple-400 font-bold">+3 Stat Points</span> to allocate in the Stats tab.</p>
            </SubSection>

            <SubSection title="Combat">
                <p>Combat is automatic. Your damage, armor, and special effects determine how quickly you defeat enemies.</p>
                <p>Use the <span className="text-green-400">Fight/Rest</span> button to pause combat when needed.</p>
            </SubSection>

            <SubSection title="Progression">
                <p>1. Farm zones for gear upgrades</p>
                <p>2. Enhance your best gear with materials</p>
                <p>3. Allocate stat points for your build</p>
                <p>4. Unlock skills for permanent bonuses</p>
                <p>5. Challenge bosses for unique gear</p>
                <p>6. Prestige for permanent multipliers</p>
            </SubSection>
        </div>
    );
}

function GearSection() {
    return (
        <div>
            <SectionTitle>Gear & Effects</SectionTitle>

            <SubSection title="Gear Tiers">
                <div className="grid grid-cols-2 gap-2">
                    {TIERS.map((tier, idx) => (
                        <div key={tier.id} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                            <span className="font-bold" style={{ color: tier.color }}>{tier.name}</span>
                            <span className="text-slate-500 text-xs">Tier {idx}</span>
                        </div>
                    ))}
                </div>
            </SubSection>

            <SubSection title="Weapon Types">
                <div className="space-y-1 mb-3">
                    <div className="flex justify-between p-2 bg-slate-800/30 rounded text-xs">
                        <span className="text-red-400">Sword</span>
                        <span className="text-slate-400">STR scaling, +5% crit</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-800/30 rounded text-xs">
                        <span className="text-purple-400">Staff</span>
                        <span className="text-slate-400">INT scaling, +15 HP</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-800/30 rounded text-xs">
                        <span className="text-blue-400">Dagger</span>
                        <span className="text-slate-400">AGI scaling, +25% speed, +10% crit</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-800/30 rounded text-xs">
                        <span className="text-green-400">Mace</span>
                        <span className="text-slate-400">VIT scaling, -10% speed, +30 HP</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500">Prestige weapons: Scythe (STR), Katana (AGI), Greataxe (STR)</p>
            </SubSection>

            <SubSection title="Special Effects">
                <p className="mb-2">Gear can roll special effects. Chance increases with tier:</p>
                <div className="bg-slate-800/50 rounded p-3 mb-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-slate-400">1st Effect:</span> 15-60%</div>
                        <div><span className="text-slate-400">2nd Effect:</span> 5-32%</div>
                        <div><span className="text-slate-400">3rd Effect:</span> 5-14%*</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">*Divine+ tier only (3 effects max)</p>
                </div>
                <div className="space-y-1">
                    {SPECIAL_EFFECTS.map((effect) => (
                        <div key={effect.id} className="flex justify-between p-2 bg-slate-800/30 rounded text-xs">
                            <span style={{ color: effect.color }}>{effect.name}</span>
                            <span className="text-slate-400">
                                {effect.minVal} - {effect.maxVal}{effect.maxVal <= 10 ? '%' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </SubSection>

            <SubSection title="Effect Tier Caps">
                <p className="mb-2">Lower tier items can't roll maximum effect values:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(EFFECT_TIER_CAPS).slice(0, 7).map(([tierIdx, cap]) => (
                        <div key={tierIdx} className="flex justify-between p-1.5 bg-slate-800/30 rounded">
                            <span style={{ color: TIERS[tierIdx]?.color }}>{TIERS[tierIdx]?.name}</span>
                            <span className="text-slate-400">{Math.round(cap * 100)}% of max</span>
                        </div>
                    ))}
                </div>
            </SubSection>

            <SubSection title="Gear Slots">
                <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-red-400">Weapon</span> <span className="text-slate-500">(STR)</span></div>
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-slate-300">Helmet</span> <span className="text-slate-500">(VIT)</span></div>
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-slate-300">Armor</span> <span className="text-slate-500">(VIT)</span></div>
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-slate-300">Legs</span> <span className="text-slate-500">(VIT)</span></div>
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-slate-300">Boots</span> <span className="text-slate-500">(AGI)</span></div>
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-slate-300">Belt</span> <span className="text-slate-500">(INT)</span></div>
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-slate-300">Shield</span> <span className="text-slate-500">(VIT)</span></div>
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-slate-300">Gloves</span> <span className="text-slate-500">(STR)</span></div>
                    <div className="p-1.5 bg-slate-800/30 rounded"><span className="text-slate-300">Amulet</span> <span className="text-slate-500">(INT)</span></div>
                </div>
                <p className="text-slate-400 text-xs">Gear scales with matching stat (shown in parentheses). +2% bonus per stat point.</p>
            </SubSection>
        </div>
    );
}

function EnhancementSection() {
    return (
        <div>
            <SectionTitle>Enhancement</SectionTitle>

            <SubSection title="How Enhancement Works">
                <p>Enhance gear to increase its stats. Each <span className="text-blue-400">+1</span> level adds bonus damage, HP, and armor.</p>
                <p>Higher levels = lower success rate but bigger bonuses. At +15/+20 you get damage multipliers!</p>
            </SubSection>

            <SubSection title="Enhancement Materials">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <MaterialIcon type="enhanceStone" size={20} />
                        <span className="text-blue-400 font-bold">Enhancement Stones</span>
                        <span className="text-slate-400 text-xs ml-auto">+1 to +10</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <MaterialIcon type="blessedOrb" size={20} />
                        <span className="text-purple-400 font-bold">Blessed Orbs</span>
                        <span className="text-slate-400 text-xs ml-auto">+10 to +15</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <MaterialIcon type="celestialShard" size={20} />
                        <span className="text-yellow-300 font-bold">Celestial Shards</span>
                        <span className="text-slate-400 text-xs ml-auto">+15 to +20</span>
                    </div>
                </div>
            </SubSection>

            <SubSection title="Boss Gear Enhancement">
                <p>Boss set items require <span className="text-orange-400">Boss Stones</span> in addition to regular materials past +10.</p>
                <p className="text-xs text-slate-400 mt-1">Each boss drops their own stone type (e.g., Crow Stone for Crow Demon set)</p>
            </SubSection>

            <SubSection title="Success & Pity">
                <p>Success rate: ~90% at +1, decreasing to ~30% at +20</p>
                <p>Each failure increases <span className="text-green-400">pity bonus</span> (+5% per fail)</p>
                <p className="text-xs text-slate-400 mt-1">Pity resets on success. Keep trying - you'll get it!</p>
            </SubSection>

            <SubSection title="Salvaging">
                <p>Salvage unwanted gear for Enhancement Stones + Silver.</p>
                <p className="text-xs text-slate-400">Higher tier & enhanced gear = more returns</p>
            </SubSection>
        </div>
    );
}

function ResourcesSection() {
    return (
        <div>
            <SectionTitle>Resources</SectionTitle>

            <SubSection title="Currency Types">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                        <MaterialIcon type="gold" size={24} />
                        <div>
                            <span className="text-slate-200 font-bold">Silver</span>
                            <p className="text-xs text-slate-400">Main currency. Dropped by all enemies.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                        <MaterialIcon type="enhanceStone" size={24} />
                        <div>
                            <span className="text-blue-400 font-bold">Enhancement Stones</span>
                            <p className="text-xs text-slate-400">Used for enhancing gear +1 to +10. Dropped by enemies, salvaged from gear.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                        <MaterialIcon type="blessedOrb" size={24} />
                        <div>
                            <span className="text-purple-400 font-bold">Blessed Orbs</span>
                            <p className="text-xs text-slate-400">Used for enhancing +10 to +15. Dropped in higher zones.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                        <MaterialIcon type="celestialShard" size={24} />
                        <div>
                            <span className="text-yellow-300 font-bold">Celestial Shards</span>
                            <p className="text-xs text-slate-400">Used for enhancing +15 to +20. Rare drops from bosses and high zones.</p>
                        </div>
                    </div>
                </div>
            </SubSection>

            <SubSection title="Resource Exchange (Shop)">
                <p>Convert surplus resources in the Shop tab. Exchange rates are intentionally inefficient - farming is always better!</p>
                <div className="mt-2 space-y-1 text-xs">
                    <p>• 1,000 Silver → 10 Enhancement Stones</p>
                    <p>• 100 Enhancement Stones → 5 Blessed Orbs</p>
                    <p>• 50 Blessed Orbs → 3 Celestial Shards</p>
                </div>
            </SubSection>
        </div>
    );
}

function PrestigeSection() {
    return (
        <div>
            <SectionTitle>Prestige</SectionTitle>

            <SubSection title="What is Prestige?">
                <p>Prestige resets most progress but grants <span className="text-pink-400 font-bold">Prestige Stones</span> to buy permanent upgrades.</p>
                <p>Requires defeating the <span className="text-yellow-400">Dark Wolf King</span> in Zone 39.</p>
            </SubSection>

            <SubSection title="Prestige Stones">
                <p>Earned on prestige: <span className="text-pink-400">10 + (Level ÷ 2)</span> stones</p>
                <p>Spend on Prestige Skills for permanent bonuses like:</p>
                <p className="text-xs text-slate-400 mt-1">• +Damage%, +HP%, +Speed%, +Crit, +XP, +Silver</p>
                <p className="text-xs text-slate-400">• Starting silver bonus for faster restarts</p>
            </SubSection>

            <SubSection title="What Resets">
                <p className="text-red-400">• Level, XP, and stat point allocation</p>
                <p className="text-red-400">• All gear and inventory</p>
                <p className="text-red-400">• Silver, Enhancement Stones, Orbs, Shards</p>
                <p className="text-red-400">• Zone progress (back to Zone 0)</p>
                <p className="text-red-400">• Unlocked skills (must re-buy)</p>
            </SubSection>

            <SubSection title="What's Kept">
                <p className="text-green-400">• Prestige level (unlocks new zones/tiers)</p>
                <p className="text-green-400">• Prestige Stones (currency)</p>
                <p className="text-green-400">• Prestige Skills (permanent bonuses)</p>
                <p className="text-green-400">• Achievement stat points (permanent)</p>
                <p className="text-green-400">• Boss Stones (for boss gear enhancement)</p>
            </SubSection>

            <SubSection title="Prestige Tiers & Zones">
                <p className="mb-2">Higher prestige unlocks new gear tiers and zones:</p>
                <div className="space-y-1">
                    {TIERS.slice(7).map((tier, idx) => (
                        <div key={tier.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded text-xs">
                            <span className="font-bold" style={{ color: tier.color }}>{tier.name}</span>
                            <span className="text-slate-400">Prestige {idx + 1}+ required</span>
                        </div>
                    ))}
                </div>
            </SubSection>
        </div>
    );
}

function BossesSection() {
    return (
        <div>
            <SectionTitle>Bosses</SectionTitle>

            <SubSection title="Boss Zones">
                <p>Special zones with powerful boss enemies. Bosses have more HP and deal more damage than regular enemies.</p>
                <p>Boss zones are marked with a <span className="text-red-400">fire icon</span> on the map.</p>
            </SubSection>

            <SubSection title="Boss Drops">
                <p>Bosses drop <span className="text-yellow-400 font-bold">unique set gear</span> with guaranteed special effects.</p>
                <p>Boss gear always has:</p>
                <p>• One fixed effect unique to that boss set</p>
                <p>• One random bonus effect</p>
            </SubSection>

            <SubSection title="Unique Boss Effects">
                <p className="mb-2">Boss sets grant powerful <span className="text-yellow-400">unique effects</span> not found on regular gear:</p>
                <div className="space-y-1 text-sm">
                    <p><span className="text-red-500">Bleed</span> - Attacks cause bleeding damage over 3 seconds</p>
                    <p><span className="text-orange-500">Burn</span> - Attacks ignite enemies for fire damage over 3 seconds</p>
                    <p><span className="text-green-500">Poison</span> - Attacks poison enemies for damage over 4 seconds</p>
                    <p><span className="text-purple-500">Multi-Strike</span> - Chance to strike twice per attack</p>
                    <p><span className="text-red-400">Execute</span> - Chance to instantly kill low HP enemies</p>
                    <p><span className="text-cyan-400">Frostbite</span> - Slows enemy attack damage</p>
                    <p><span className="text-blue-400">Damage Shield</span> - Absorbs damage before HP</p>
                    <p><span className="text-yellow-400">Retaliate</span> - Chance to counter-attack when hit</p>
                    <p><span className="text-red-600">Last Stand</span> - Bonus damage and lifesteal when low HP</p>
                    <p><span className="text-red-800">Rage</span> - Each hit increases damage (stacks)</p>
                    <p><span className="text-red-900">Vampiric</span> - Enhanced lifesteal</p>
                </div>
            </SubSection>

            <SubSection title="Set Bonuses">
                <p>Wearing multiple pieces from the same boss set unlocks <span className="text-purple-400">set bonuses</span>:</p>
                <p>• <span className="text-green-400">2-piece</span>: Minor passive bonus</p>
                <p>• <span className="text-blue-400">4-piece</span>: Stronger combat bonus</p>
                <p>• <span className="text-purple-400">6-piece</span>: Powerful special ability</p>
                <p>• <span className="text-yellow-400">8-piece (Full Set)</span>: Ultimate set mastery effect</p>
            </SubSection>

            <SubSection title="Boss Stones">
                <p>Defeating bosses also drops <span className="text-orange-400 font-bold">Boss Stones</span> specific to that boss.</p>
                <p>Boss Stones are used for enhancing Boss Equipment past +10.</p>
            </SubSection>

            <SubSection title="Boss Strategy">
                <p>• Ensure you have enough armor/HP to survive</p>
                <p>• Lifesteal effect helps sustain through long fights</p>
                <p>• Farm the zone before the boss to gear up first</p>
                <p>• Build around set bonuses for maximum power</p>
            </SubSection>
        </div>
    );
}

function StatsSection() {
    return (
        <div>
            <SectionTitle>Character Stats</SectionTitle>

            <SubSection title="Stat System Overview">
                <p className="mb-2">Stats are divided into <span className="text-red-400">Primary</span> and <span className="text-yellow-400">Secondary</span> categories:</p>
                <p className="text-xs text-slate-400">• Primary stats provide weapon scaling + one basic bonus</p>
                <p className="text-xs text-slate-400">• Secondary stats provide specialized combat bonuses</p>
                <p className="text-xs text-slate-400">• Both use the same stat point pool (3 points per level)</p>
            </SubSection>

            <SubSection title="Primary Stats">
                <p className="text-xs text-slate-500 mb-2">Weapon damage scaling + one basic bonus per point</p>
                <div className="space-y-2">
                    <div className="p-2 bg-slate-800/50 rounded">
                        <span className="text-red-400 font-bold">STR (Strength)</span>
                        <p className="text-xs text-slate-400">+1 base damage, +3% damage with STR weapons</p>
                        <p className="text-xs text-slate-500">Weapons: Sword, Scythe, Greataxe</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                        <span className="text-purple-400 font-bold">INT (Intelligence)</span>
                        <p className="text-xs text-slate-400">+1 base damage, +3% damage with INT weapons</p>
                        <p className="text-xs text-slate-500">Weapons: Staff</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                        <span className="text-green-400 font-bold">VIT (Vitality)</span>
                        <p className="text-xs text-slate-400">+10 max HP, +2% damage with VIT weapons</p>
                        <p className="text-xs text-slate-500">Weapons: Mace</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                        <span className="text-amber-400 font-bold">AGI (Agility)</span>
                        <p className="text-xs text-slate-400">+1% attack speed, +2% damage with AGI weapons</p>
                        <p className="text-xs text-slate-500">Weapons: Dagger, Katana</p>
                    </div>
                </div>
            </SubSection>

            <SubSection title="Secondary Stats">
                <p className="text-xs text-slate-500 mb-2">Specialized combat stats - must be skilled separately</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="p-1.5 bg-slate-800/30 rounded">
                        <span className="text-yellow-400">Crit Chance</span>
                        <span className="text-slate-500 ml-1">+1%/pt</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded">
                        <span className="text-orange-400">Crit Damage</span>
                        <span className="text-slate-500 ml-1">+5%/pt</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded">
                        <span className="text-green-400">Dodge</span>
                        <span className="text-slate-500 ml-1">+1%/pt</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded">
                        <span className="text-blue-400">Armor</span>
                        <span className="text-slate-500 ml-1">+3/pt</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded">
                        <span className="text-emerald-400">HP Regen</span>
                        <span className="text-slate-500 ml-1">+0.2%/s/pt</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded">
                        <span className="text-sky-400">Dmg Reduction</span>
                        <span className="text-slate-500 ml-1">+0.5%/pt</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded">
                        <span className="text-purple-400">XP Bonus</span>
                        <span className="text-slate-500 ml-1">+2%/pt</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded">
                        <span className="text-slate-400">Silver Find</span>
                        <span className="text-slate-500 ml-1">+1%/pt</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded col-span-2">
                        <span className="text-teal-400">Drop Rate</span>
                        <span className="text-slate-500 ml-1">+1%/pt</span>
                    </div>
                </div>
            </SubSection>

            <SubSection title="Overflow Effects">
                <p className="mb-2">When stats exceed their caps, overflow converts to <span className="text-yellow-400">powerful special effects</span>:</p>
                <div className="space-y-1.5 text-xs">
                    <div className="p-1.5 bg-slate-800/30 rounded flex justify-between">
                        <span><span className="text-cyan-400">Ascended</span> - Crit &gt;100%</span>
                        <span className="text-slate-500">Double crit dmg (max 100%)</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded flex justify-between">
                        <span><span className="text-orange-400">Annihilate</span> - Crit DMG &gt;300%</span>
                        <span className="text-slate-500">5x dmg crit (max 100%)</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded flex justify-between">
                        <span><span className="text-violet-400">Phantom</span> - Dodge &gt;80%</span>
                        <span className="text-slate-500">Counter on dodge (max 100%)</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded flex justify-between">
                        <span><span className="text-amber-400">Immunity</span> - DR &gt;75%</span>
                        <span className="text-slate-500">Full negation (max 100%)</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded flex justify-between">
                        <span><span className="text-emerald-400">Second Wind</span> - Regen &gt;25%/s</span>
                        <span className="text-slate-500">Emergency heal (max 50%)</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded flex justify-between">
                        <span><span className="text-purple-400">Frenzy</span> - Speed &gt;200%</span>
                        <span className="text-slate-500">Triple attack (max 100%)</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded flex justify-between">
                        <span><span className="text-cyan-400">Overheal</span> - Lifesteal &gt;100%</span>
                        <span className="text-slate-500">Shield gen (max 50%)</span>
                    </div>
                    <div className="p-1.5 bg-slate-800/30 rounded flex justify-between">
                        <span><span className="text-rose-400">Vengeance</span> - Thorns &gt;100%</span>
                        <span className="text-slate-500">Full counter (max 100%)</span>
                    </div>
                </div>
                <p className="text-xs text-amber-400 mt-2">Stats show (MAX) when their overflow effect is capped - further points are wasted!</p>
            </SubSection>

            <SubSection title="Stat Point Sources">
                <p>• <span className="text-purple-400">+3 per level up</span></p>
                <p>• <span className="text-yellow-400">Achievement rewards</span> (permanent, kept through prestige)</p>
                <p>• <span className="text-pink-400">Prestige skill bonuses</span></p>
            </SubSection>
        </div>
    );
}
