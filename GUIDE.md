# Gear Grinder - Game Guide

## Combat System

Combat is automatic - your character attacks enemies based on their attack speed, and enemies attack back at their own speed (which increases as you progress through zones).

### Attack Speed
- **Player Attack Speed**: Based on 4 attacks per second at base, modified by AGI and equipment bonuses
- **Enemy Attack Speed**: Starts at 1 attack/second and increases with zone difficulty (up to 3 attacks/second max)

---

## Stats

### Primary Stats
These stats scale weapon damage and provide basic bonuses:

| Stat | Effect |
|------|--------|
| **STR** | +1 flat damage per point, +3% damage for STR weapons (Sword, Scythe, Greataxe) |
| **INT** | +1 flat damage per point, +3% damage for INT weapons (Staff) |
| **VIT** | +10 HP per point, +2% damage for VIT weapons (Mace) |
| **AGI** | +1% attack speed per point, +2% damage for AGI weapons (Dagger, Katana) |

### Secondary Stats
These are specialized combat stats gained from gear effects:

| Stat | Effect | Cap |
|------|--------|-----|
| **Crit Chance** | % chance to deal critical damage | None |
| **Crit Damage** | Damage multiplier on critical hits (base 150%) | None |
| **Dodge** | % chance to avoid enemy attacks | 80% |
| **Armor** | Reduces damage taken (Armor / (Armor + 250) = reduction %) | None |
| **HP Regen** | % of max HP regenerated per second | 25% |
| **Damage Reduction** | Flat % reduction after armor calculation | 75% |
| **Lifesteal** | % of damage dealt healed | Soft cap at 15% (reduced effectiveness above) |

---

## Combat Effects / Buffs

These effects come from boss set gear and appear in the buff display during combat.

### Stacking Effects

| Effect | What it Does |
|--------|--------------|
| **Rage** | Each attack adds +1 stack (max 10, or unlimited with Behemoth 8pc). Each stack increases damage by your Rage stat %. Example: 5% Rage with 10 stacks = +50% damage |

### Defensive Effects

| Effect | What it Does |
|--------|--------------|
| **Damage Shield** | Absorbs X damage before affecting HP. Refreshes to full on enemy kill |
| **Overheal** | X% of healing beyond max HP becomes a temporary shield |
| **Second Wind** | When HP drops below 20%, automatically heals X% of max HP (once per fight) |
| **Frostbite** | Reduces all enemy damage by X% |
| **Last Stand** | When below 30% HP: gain +X% damage AND +X% lifesteal (conditional - activates only when low) |

### Offensive Effects

| Effect | What it Does |
|--------|--------------|
| **Vampiric** | Enhanced lifesteal - heal for X% of all damage dealt |
| **Retaliate** | X% chance to counter-attack when hit |
| **Multi-Strike** | X% chance to hit additional times per attack |
| **Execute** | X% chance to instantly kill enemies below 30% HP |
| **Armor Penetration** | Ignores X% of enemy armor (max 75%) |

### DOT (Damage Over Time) Effects

| Effect | What it Does | Duration |
|--------|--------------|----------|
| **Bleed** | Deals X% of weapon damage over time | 3 seconds |
| **Burn** | Deals X% of weapon damage over time | 3 seconds |
| **Poison** | Deals X% of weapon damage over time | 4 seconds |

---

## Buff Display Icons

During combat, active effects are shown with icons:
- **Colored border**: Effect is active
- **Grayed out**: Effect is inactive or used
- **Stack count badge**: Shows current stacks (e.g., Rage)
- **Timer**: Shows remaining duration for DOTs
- **"READY"**: Conditional effect waiting to trigger (e.g., Last Stand when HP > 30%)
- **"ACTIVE!"**: Conditional effect currently triggered (e.g., Last Stand when HP < 30%)
- **"USED"**: One-time effect already triggered (e.g., Second Wind)

---

## Boss Sets

Each boss drops a unique gear set with powerful effects. Collect more pieces for stronger set bonuses:
- **2pc**: Minor bonus
- **4pc**: Moderate bonus
- **6pc**: Major bonus
- **8pc**: Build-defining ultimate bonus

---

## Tips

1. **Build synergy matters**: Combine effects that work together (e.g., Rage + Last Stand for damage, or Frostbite + Damage Shield for defense)
2. **Watch your buffs**: The buff display shows what's active and helping you
3. **DOTs stack damage**: Bleed, Burn, and Poison add significant extra damage over time
4. **Last Stand is powerful**: Consider staying at low HP intentionally if you have good lifesteal to benefit from the bonus
5. **Rage builds up**: Keep attacking to maintain Rage stacks - they don't reset between enemies!
