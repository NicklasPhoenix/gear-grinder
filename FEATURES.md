# Mobile Portrait Redesign - Implementation Plan

## Overview

**Goal:** Transform the game into a fully playable mobile portrait experience while keeping desktop intact.

**Target Layout (Portrait Mobile):**
```
┌─────────────────────────┐
│  Zone: Goblin Stronghold│  ← Zone header (compact)
├─────────────────────────┤
│                         │
│   [HERO]     [ENEMY]    │  ← Combat view (~200px)
│   ██████     ██████     │     Health bars
│   HP: 850    HP: 5.5K   │
│                         │
│      -150!    -48!      │  ← Damage numbers
│                         │
│  [Rest]     Silver: 3K  │  ← Controls + currency
├─────────────────────────┤
│ INV│STS│ENH│SKL│MAP│PRE │  ← Tab bar (scrollable)
├─────────────────────────┤
│                         │
│                         │
│     Tab Content         │  ← Main content (~50%)
│     (scrollable)        │
│                         │
│                         │
├─────────────────────────┤
│ Lv.41  ████████░░  XP   │  ← Bottom bar
│        1.7M / 1.8M      │
└─────────────────────────┘
```

---

## Phase 1: Setup & Detection
**Status:** NOT STARTED

### 1.1 Create Mobile Detection Hook
**File:** `game/hooks/useIsMobile.js`

```javascript
// Detect mobile viewport and orientation
// Returns { isMobile, isPortrait, isLandscape }
// Updates on resize/orientation change
```

**Acceptance Criteria:**
- [ ] Hook detects screen width < 768px as mobile
- [ ] Hook detects portrait vs landscape
- [ ] Hook updates on window resize
- [ ] Hook updates on orientation change

### 1.2 Create Mobile Layout Shell
**File:** `game/ui/MobileGameLayout.jsx`

```javascript
// New layout component for mobile portrait
// Will contain: MobileCombatView, MobileTabBar, TabContent, MobileBottomBar
```

**Acceptance Criteria:**
- [ ] Shell component renders without errors
- [ ] Proper flex column layout
- [ ] Takes full viewport height (100dvh for mobile)

### 1.3 Update App to Route Layouts
**File:** `game/ui/GameLayout.jsx` or `App.jsx`

**Acceptance Criteria:**
- [ ] Desktop users see current layout (unchanged)
- [ ] Mobile portrait users see MobileGameLayout
- [ ] Smooth transition if orientation changes

---

## Phase 2: Mobile Combat View
**Status:** NOT STARTED

### 2.1 Create MobileCombatView Component
**File:** `game/ui/MobileCombatView.jsx`

A compact, horizontal battle scene optimized for mobile.

**Layout:**
```
┌─────────────────────────────────┐
│ Goblin Stronghold          3.2K│  ← Zone name + silver
├─────────────────────────────────┤
│                                 │
│  [HERO]              [ENEMY]   │  ← Sprites (64x64 or 96x96)
│  ▓▓▓▓▓▓░░            ▓▓▓▓░░░░  │  ← Health bars below
│  850/1000            2.8K/5.5K │  ← HP text
│                                 │
│     -150              -48      │  ← Floating damage
│                                 │
├─────────────────────────────────┤
│ [II Rest]       [1x] [2x] [5x] │  ← Controls row
└─────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Shows hero sprite on left side
- [ ] Shows enemy sprite on right side
- [ ] Health bars visible below each character
- [ ] HP numbers shown (formatted)
- [ ] Damage numbers float up and fade
- [ ] Zone name displayed
- [ ] Currency display (silver)
- [ ] Rest/Fight toggle button
- [ ] Speed controls (1x, 2x, 5x)
- [ ] Boss enemies have visual distinction (glow/size)
- [ ] Smooth animations (breathing, hit flash)
- [ ] Works without PIXI (pure React/CSS for simplicity) OR uses small PIXI canvas

### 2.2 Connect Combat View to Game State
**Acceptance Criteria:**
- [ ] Real-time HP updates from game state
- [ ] Damage events trigger floating numbers
- [ ] Enemy changes when zone changes
- [ ] Death/spawn animations work

---

## Phase 3: Mobile Tab Navigation
**Status:** NOT STARTED

### 3.1 Create MobileTabBar Component
**File:** `game/ui/MobileTabBar.jsx`

Horizontal, scrollable tab bar with touch-friendly targets.

**Tabs (6 total, simplified from 8):**
1. INV - Inventory (bag icon)
2. STATS - Stats (chart icon)
3. ENHANCE - Enhancement (lightning icon)
4. SKILLS - Skills (star icon)
5. MAP - Zone/Map (map icon)
6. MORE - Settings/Prestige/Achievements (menu icon → opens submenu)

**Acceptance Criteria:**
- [ ] Horizontal layout
- [ ] Each tab minimum 44px touch target
- [ ] Active tab visually highlighted
- [ ] Icons + short labels
- [ ] Scrollable if needed (overflow-x-auto)
- [ ] "MORE" tab opens modal/dropdown for secondary tabs

### 3.2 Mobile Tab State Management
**Acceptance Criteria:**
- [ ] Tab state persists correctly
- [ ] Switching tabs is instant (no lag)
- [ ] Swipe gestures between tabs (stretch goal)

---

## Phase 4: Mobile Tab Content
**Status:** NOT STARTED

Each existing tab view needs mobile optimization.

### 4.1 Mobile Inventory View
**File:** Update `game/ui/InventoryView.jsx`

**Changes needed:**
- [ ] Grid: 5 columns on mobile (from 8-10)
- [ ] Larger item slots (48px minimum)
- [ ] Equipment section: 2x4 grid or horizontal scroll
- [ ] Touch-hold for tooltip (instead of hover)
- [ ] Tap to select, tap again to equip
- [ ] Presets button accessible

### 4.2 Mobile Stats View
**File:** Update `game/ui/StatsView.jsx`

**Changes needed:**
- [ ] Stack sections vertically
- [ ] Larger stat buttons (+/- for allocation)
- [ ] Collapsible sections for detailed stats
- [ ] Scrollable content

### 4.3 Mobile Enhancement View
**File:** Update `game/ui/EnhancementView.jsx`

**Changes needed:**
- [ ] Larger item selection grid
- [ ] Big "ENHANCE" button (easy to tap)
- [ ] Clear success/fail feedback
- [ ] Auto-enhance controls touch-friendly

### 4.4 Mobile Skills View
**File:** Update `game/ui/SkillsView.jsx`

**Changes needed:**
- [ ] Vertical skill list (not grid)
- [ ] Clear unlock requirements
- [ ] Touch-friendly activation

### 4.5 Mobile Zone/Map View
**File:** Update `game/ui/ZoneView.jsx`

**Changes needed:**
- [ ] Vertical zone list
- [ ] Larger zone cards
- [ ] Clear "GO" buttons
- [ ] Progress bars visible

### 4.6 Mobile "More" Menu
**File:** `game/ui/MobileMoreMenu.jsx` (new)

**Contains:**
- [ ] Settings button
- [ ] Prestige button
- [ ] Achievements button
- [ ] Daily Rewards button
- [ ] Maybe: Volume controls

---

## Phase 5: Mobile Bottom Bar
**Status:** NOT STARTED

### 5.1 Create MobileBottomBar Component
**File:** `game/ui/MobileBottomBar.jsx`

Persistent footer with XP and level.

**Layout:**
```
┌─────────────────────────────────┐
│ Lv.41    ████████████░░░░  XP  │
│          1,719,808 / 1,805,943 │
└─────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Shows current level prominently
- [ ] XP progress bar
- [ ] XP numbers (current / needed)
- [ ] Level up animation/flash
- [ ] Safe area padding for home indicator

---

## Phase 6: Polish & Platform
**Status:** NOT STARTED

### 6.1 Safe Area Handling
**Acceptance Criteria:**
- [ ] Padding for iPhone notch (env(safe-area-inset-top))
- [ ] Padding for home indicator (env(safe-area-inset-bottom))
- [ ] Works on iPhone X+ and Android with notches

### 6.2 Touch Feedback
**Acceptance Criteria:**
- [ ] Buttons have active/pressed states
- [ ] Haptic feedback where appropriate (stretch)
- [ ] No 300ms tap delay

### 6.3 Performance Optimization
**Acceptance Criteria:**
- [ ] 60fps scrolling
- [ ] No jank on tab switches
- [ ] Memory usage reasonable
- [ ] Battery efficient (requestAnimationFrame when visible only)

### 6.4 Cross-Browser Testing
**Acceptance Criteria:**
- [ ] Works on iOS Safari
- [ ] Works on Chrome Android
- [ ] Works on Samsung Internet
- [ ] Works on Firefox Mobile

---

## Phase 7: Capacitor Integration (After UI Complete)
**Status:** NOT STARTED

### 7.1 Add Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Gear Grinder" "com.gearginder.app"
npx cap add ios
npx cap add android
```

### 7.2 Configure App
- [ ] App icons (all sizes)
- [ ] Splash screens
- [ ] Status bar configuration
- [ ] Orientation lock (portrait)

### 7.3 Build & Test
- [ ] iOS Simulator testing
- [ ] Android Emulator testing
- [ ] Real device testing

---

## File Structure (New Files)

```
game/
├── hooks/
│   └── useIsMobile.js          ← NEW: Mobile detection
├── ui/
│   ├── MobileGameLayout.jsx    ← NEW: Mobile layout shell
│   ├── MobileCombatView.jsx    ← NEW: Compact combat
│   ├── MobileTabBar.jsx        ← NEW: Tab navigation
│   ├── MobileBottomBar.jsx     ← NEW: XP bar footer
│   └── MobileMoreMenu.jsx      ← NEW: Secondary tabs menu
```

---

## Implementation Order

1. **Phase 1.1** - useIsMobile hook
2. **Phase 1.2** - MobileGameLayout shell
3. **Phase 1.3** - Layout routing
4. **Phase 2.1** - MobileCombatView (core)
5. **Phase 2.2** - Combat state connection
6. **Phase 3.1** - MobileTabBar
7. **Phase 5.1** - MobileBottomBar
8. **Phase 4.1-4.6** - Mobile tab content (iterate)
9. **Phase 6** - Polish
10. **Phase 7** - Capacitor (separate milestone)

---

## Success Metrics

- [ ] Game is fully playable on iPhone SE (smallest common phone)
- [ ] All features accessible on mobile
- [ ] No horizontal scrolling required
- [ ] Touch targets minimum 44x44px
- [ ] Load time under 3 seconds on 4G
- [ ] No layout shifts after load
