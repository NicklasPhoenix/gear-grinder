/**
 * AudioManager - Handles all game audio (music and sound effects)
 * Uses Web Audio API for procedural SFX and HTML5 Audio for music
 */

class AudioManager {
    constructor() {
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.masterVolume = 1.0;
        this.musicMuted = false;
        this.sfxMuted = false;

        this.currentMusic = null;
        this.currentMusicTrack = null;
        this.audioContext = null;

        // Music tracks configuration - organized by game progression
        this.musicTracks = {
            // Zone music by progression tier
            zoneEarly: [  // Zones 0-9: Upbeat adventure
                '/assets/audio/quest_begins.mp3',
                '/assets/audio/hero_journey.mp3',
                '/assets/audio/secret_level.mp3',
            ],
            zoneMid: [  // Zones 10-19: Exploration
                '/assets/audio/dungeon_crawl.mp3',
                '/assets/audio/hidden_treasure.mp3',
                '/assets/audio/secret_level.mp3',
            ],
            zoneLate: [  // Zones 20-29: Building tension
                '/assets/audio/dark_descent.mp3',
                '/assets/audio/hidden_treasure.mp3',
                '/assets/audio/dungeon_crawl.mp3',
            ],
            zoneEnd: [  // Zones 30-39: Epic/dramatic
                '/assets/audio/dark_descent.mp3',
                '/assets/audio/ultimate_showdown.mp3',
            ],
            zonePrestige: [  // Zones 40+: Horror/prestige themes
                '/assets/audio/horror_watches.mp3',
                '/assets/audio/thing_below.mp3',
                '/assets/audio/eyes_dark.mp3',
                '/assets/audio/neon_nightmare.mp3',
                '/assets/audio/creeping_dread.mp3',
                '/assets/audio/blood_moon.mp3',
            ],
            // Boss music - escalating intensity
            boss: [
                '/assets/audio/boss_first.mp3',
                '/assets/audio/first_encounter.mp3',
                '/assets/audio/boss_incoming.mp3',
                '/assets/audio/phase_two.mp3',
                '/assets/audio/final_form.mp3',
                '/assets/audio/true_power.mp3',
                '/assets/audio/climax_battle.mp3',
            ],
            // Prestige boss music - horror themed
            prestigeBoss: [
                '/assets/audio/blood_moon.mp3',
                '/assets/audio/neon_nightmare.mp3',
                '/assets/audio/eyes_dark.mp3',
            ],
            // Victory jingle
            victory: '/assets/audio/victory.mp3',
        };

        this.loadSettings();
    }

    /**
     * Initialize the Web Audio API context (must be called after user interaction)
     */
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext.state === 'running';
    }

    /**
     * Resume audio context if suspended (browsers require user interaction)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('gear-grinder-audio');
            if (saved) {
                const settings = JSON.parse(saved);
                this.musicVolume = settings.musicVolume ?? 0.5;
                this.sfxVolume = settings.sfxVolume ?? 0.7;
                this.masterVolume = settings.masterVolume ?? 1.0;
                this.musicMuted = settings.musicMuted ?? false;
                this.sfxMuted = settings.sfxMuted ?? false;
            }
        } catch (e) {
            console.warn('Failed to load audio settings:', e);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('gear-grinder-audio', JSON.stringify({
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
                masterVolume: this.masterVolume,
                musicMuted: this.musicMuted,
                sfxMuted: this.sfxMuted,
            }));
        } catch (e) {
            console.warn('Failed to save audio settings:', e);
        }
    }

    /**
     * Set music volume (0-1)
     */
    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        if (this.currentMusic) {
            this.currentMusic.volume = this.getEffectiveMusicVolume();
        }
        this.saveSettings();
    }

    /**
     * Set SFX volume (0-1)
     */
    setSfxVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        this.saveSettings();
    }

    /**
     * Set master volume (0-1)
     */
    setMasterVolume(vol) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        if (this.currentMusic) {
            this.currentMusic.volume = this.getEffectiveMusicVolume();
        }
        this.saveSettings();
    }

    /**
     * Toggle music mute
     */
    toggleMusicMute() {
        this.musicMuted = !this.musicMuted;
        if (this.currentMusic) {
            this.currentMusic.volume = this.getEffectiveMusicVolume();
        }
        this.saveSettings();
        return this.musicMuted;
    }

    /**
     * Toggle SFX mute
     */
    toggleSfxMute() {
        this.sfxMuted = !this.sfxMuted;
        this.saveSettings();
        return this.sfxMuted;
    }

    /**
     * Get effective music volume (considering mute and master)
     */
    getEffectiveMusicVolume() {
        return this.musicMuted ? 0 : this.musicVolume * this.masterVolume;
    }

    /**
     * Get effective SFX volume (considering mute and master)
     */
    getEffectiveSfxVolume() {
        return this.sfxMuted ? 0 : this.sfxVolume * this.masterVolume;
    }

    /**
     * Get the appropriate music category for a zone
     * @param {number} zoneId - Zone ID
     * @param {boolean} isBoss - Whether this is a boss zone
     * @returns {string} Music category key
     */
    getMusicCategory(zoneId, isBoss = false) {
        if (isBoss) {
            return zoneId >= 40 ? 'prestigeBoss' : 'boss';
        }
        if (zoneId >= 40) return 'zonePrestige';
        if (zoneId >= 30) return 'zoneEnd';
        if (zoneId >= 20) return 'zoneLate';
        if (zoneId >= 10) return 'zoneMid';
        return 'zoneEarly';
    }

    /**
     * Play background music for a zone
     * @param {string} type - 'zone', 'boss', 'prestigeBoss', or specific category
     * @param {number} zoneId - Zone ID to vary the track
     */
    playMusic(type = 'zone', zoneId = 0) {
        // Auto-select category based on zone if type is 'zone'
        let category = type;
        if (type === 'zone') {
            category = this.getMusicCategory(zoneId, false);
        } else if (type === 'boss') {
            category = this.getMusicCategory(zoneId, true);
        }

        const tracks = this.musicTracks[category];
        if (!tracks) return;

        const trackList = Array.isArray(tracks) ? tracks : [tracks];
        const trackIndex = zoneId % trackList.length;
        const trackUrl = trackList[trackIndex];

        // Don't restart if same track is already playing
        if (this.currentMusicTrack === trackUrl && this.currentMusic && !this.currentMusic.paused) {
            return;
        }

        this.stopMusic();

        this.currentMusic = new Audio(trackUrl);
        this.currentMusic.loop = true;
        this.currentMusic.volume = this.getEffectiveMusicVolume();
        this.currentMusicTrack = trackUrl;

        this.currentMusic.play().catch(_e => {
            // Autoplay blocked - will play on next user interaction
            console.log('Music autoplay blocked, will play on interaction');
        });
    }

    /**
     * Stop current music with optional fade
     */
    stopMusic(fade = false) {
        if (this.currentMusic) {
            if (fade) {
                const audio = this.currentMusic;
                const fadeOut = setInterval(() => {
                    if (audio.volume > 0.1) {
                        audio.volume = Math.max(0, audio.volume - 0.1);
                    } else {
                        clearInterval(fadeOut);
                        audio.pause();
                        audio.currentTime = 0;
                    }
                }, 50);
            } else {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            }
            this.currentMusic = null;
            this.currentMusicTrack = null;
        }
    }

    /**
     * Play a one-shot music track (like victory)
     */
    playOneShot(type) {
        const track = this.musicTracks[type];
        if (!track) return;

        const audio = new Audio(Array.isArray(track) ? track[0] : track);
        audio.volume = this.getEffectiveMusicVolume();
        audio.play().catch(() => {});
    }

    // ========== PROCEDURAL SOUND EFFECTS ==========

    /**
     * Play a hit/damage sound
     */
    playSfxHit() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.3, ctx.currentTime);
        gainNode.gain.exponentialDecayTo = 0.01;
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        // White noise burst for impact
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.connect(gainNode);
        noise.start();
    }

    /**
     * Play a critical hit sound
     */
    playSfxCrit() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        // Higher pitched impact with oscillator
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    /**
     * Play a coin/gold pickup sound
     */
    playSfxCoin() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }

    /**
     * Play a level up sound
     */
    playSfxLevelUp() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        // Ascending arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
            osc.connect(gainNode);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.15);
        });
    }

    /**
     * Play enhancement success sound
     */
    playSfxEnhanceSuccess() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    }

    /**
     * Play enhancement fail sound
     */
    playSfxEnhanceFail() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }

    /**
     * Play enemy death sound
     */
    playSfxEnemyDeath() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        // Descending whoosh
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }

    /**
     * Play boss death sound (more dramatic)
     */
    playSfxBossDeath() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;

        // Layer 1: Deep rumble
        const gain1 = ctx.createGain();
        gain1.connect(ctx.destination);
        gain1.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.4, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(100, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.7);
        osc1.connect(gain1);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.8);

        // Layer 2: Impact
        const gain2 = ctx.createGain();
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.connect(gain2);
        noise.start();
    }

    /**
     * Play UI click sound
     */
    playSfxClick() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    /**
     * Play heal sound
     */
    playSfxHeal() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.35);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    }

    /**
     * Play dodge sound
     */
    playSfxDodge() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        // Whoosh sound
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.5;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter for whoosh
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
        filter.Q.value = 1;

        noise.connect(filter);
        filter.connect(gainNode);
        noise.start();
    }

    /**
     * Play awakening/milestone sound
     */
    playSfxAwakening() {
        if (!this.init() || this.sfxMuted) return;
        this.resume();

        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(this.getEffectiveSfxVolume() * 0.35, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);

        // Magical ascending shimmer
        const notes = [392, 523, 659, 784, 1047, 1319]; // G4, C5, E5, G5, C6, E6
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

            const noteGain = ctx.createGain();
            noteGain.gain.setValueAtTime(0.5, ctx.currentTime + i * 0.08);
            noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);

            osc.connect(noteGain);
            noteGain.connect(gainNode);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.3);
        });
    }
}

// Export singleton instance
export const audioManager = new AudioManager();
export default audioManager;
