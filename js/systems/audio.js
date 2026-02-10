export class AudioSystem {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicNodes = [];
        this.musicPlaying = false;
        this.bossMode = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.6;
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.7;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            // Web Audio not supported
        }
    }

    _ensureCtx() {
        if (!this.initialized) return false;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return true;
    }

    // --- Laser sounds ---
    playLaser(shipType) {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        if (shipType === 'speed') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.start(t); osc.stop(t + 0.05);
        } else if (shipType === 'heavy') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            // Sub layer
            const sub = this.ctx.createOscillator();
            const subG = this.ctx.createGain();
            sub.connect(subG); subG.connect(this.sfxGain);
            sub.type = 'sine';
            sub.frequency.setValueAtTime(80, t);
            subG.gain.setValueAtTime(0.1, t);
            subG.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            sub.start(t); sub.stop(t + 0.1);
            osc.start(t); osc.stop(t + 0.12);
        } else {
            // balanced
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.start(t); osc.stop(t + 0.08);
        }
    }
    // --- Explosion sounds ---
    _noiseBuffer(duration) {
        const sr = this.ctx.sampleRate;
        const len = sr * duration;
        const buf = this.ctx.createBuffer(1, len, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        return buf;
    }

    playExplosionSmall() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        const src = this.ctx.createBufferSource();
        src.buffer = this._noiseBuffer(0.15);
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 1;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        src.connect(bp); bp.connect(gain); gain.connect(this.sfxGain);
        src.start(t); src.stop(t + 0.15);
    }

    playExplosionMedium() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        // Noise layer
        const src = this.ctx.createBufferSource();
        src.buffer = this._noiseBuffer(0.3);
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 0.8;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        src.connect(bp); bp.connect(gain); gain.connect(this.sfxGain);
        src.start(t); src.stop(t + 0.3);
        // Low thump
        const osc = this.ctx.createOscillator();
        const og = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = 80;
        og.gain.setValueAtTime(0.3, t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(og); og.connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.2);
    }

    playExplosionLarge() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        // Double noise layers
        for (const freq of [300, 600]) {
            const src = this.ctx.createBufferSource();
            src.buffer = this._noiseBuffer(0.5);
            const bp = this.ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 0.6;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            src.connect(bp); bp.connect(gain); gain.connect(this.sfxGain);
            src.start(t); src.stop(t + 0.5);
        }
        // Deep thump
        const osc = this.ctx.createOscillator();
        const og = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = 60;
        og.gain.setValueAtTime(0.4, t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(og); og.connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.4);
    }
    // --- Pickup ---
    playPowerup() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        const notes = [400, 600, 800];
        for (let i = 0; i < notes.length; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            const start = t + i * 0.06;
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(start); osc.stop(start + 0.08);
        }
    }

    // --- Boss warning ---
    playBossWarning() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 100;
        lfo.type = 'square'; lfo.frequency.value = 4;
        lfoGain.gain.value = 0.2;
        lfo.connect(lfoGain); lfoGain.connect(gain.gain);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.setValueAtTime(0.2, t + 1.3);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc.connect(gain); gain.connect(this.sfxGain);
        osc.start(t); osc.stop(t + 1.5);
        lfo.start(t); lfo.stop(t + 1.5);
    }

    // --- Shield hit ---
    playShieldHit() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        const src = this.ctx.createBufferSource();
        src.buffer = this._noiseBuffer(0.12);
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 2000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        src.connect(hp); hp.connect(gain); gain.connect(this.sfxGain);
        src.start(t); src.stop(t + 0.12);
        // Sweep
        const osc = this.ctx.createOscillator();
        const og = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, t);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.1);
        og.gain.setValueAtTime(0.1, t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(og); og.connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.1);
    }

    // --- Player damage ---
    playPlayerDamage() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        const src = this.ctx.createBufferSource();
        src.buffer = this._noiseBuffer(0.15);
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 400;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        src.connect(lp); lp.connect(gain); gain.connect(this.sfxGain);
        src.start(t); src.stop(t + 0.15);
        const osc = this.ctx.createOscillator();
        const og = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
        og.gain.setValueAtTime(0.15, t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(og); og.connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.15);
    }
    // --- UI click ---
    playUIClick() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = 1000;
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(gain); gain.connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.03);
    }

    // --- Combo milestone ---
    playComboMilestone() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        // Major triad ascending
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        for (let i = 0; i < notes.length; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            const start = t + i * 0.06;
            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(start); osc.stop(start + 0.12);
        }
    }

    // --- Wave clear ---
    playWaveClear() {
        if (!this._ensureCtx()) return;
        const t = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        for (let i = 0; i < notes.length; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            const start = t + i * 0.08;
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(start); osc.stop(start + 0.2);
        }
    }

    // --- Background music ---
    startMusic() {
        if (!this._ensureCtx() || this.musicPlaying) return;
        this.musicPlaying = true;
        // Two slightly detuned low sines for beating effect
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sine'; osc1.frequency.value = 55;
        osc2.type = 'sine'; osc2.frequency.value = 55.5;
        const g1 = this.ctx.createGain(); g1.gain.value = 0.15;
        const g2 = this.ctx.createGain(); g2.gain.value = 0.15;
        osc1.connect(g1); g1.connect(this.musicGain);
        osc2.connect(g2); g2.connect(this.musicGain);
        osc1.start(); osc2.start();
        // LFO-modulated noise pad
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = this._noiseBuffer(10);
        noiseSrc.loop = true;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 200; bp.Q.value = 2;
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 0.1;
        const lfoG = this.ctx.createGain(); lfoG.gain.value = 100;
        lfo.connect(lfoG); lfoG.connect(bp.frequency);
        const noiseGain = this.ctx.createGain(); noiseGain.gain.value = 0.04;
        noiseSrc.connect(bp); bp.connect(noiseGain); noiseGain.connect(this.musicGain);
        noiseSrc.start(); lfo.start();
        this.musicNodes = [osc1, osc2, noiseSrc, lfo];
    }

    stopMusic() {
        this.musicPlaying = false;
        for (const node of this.musicNodes) {
            try { node.stop(); } catch (e) {}
        }
        this.musicNodes = [];
    }

    setBossMode(active) {
        if (!this._ensureCtx()) return;
        this.bossMode = active;
        // Shift music tone during boss
        if (this.musicNodes.length >= 2) {
            const freq = active ? 45 : 55;
            const freq2 = active ? 45.5 : 55.5;
            this.musicNodes[0].frequency.setValueAtTime(freq, this.ctx.currentTime);
            this.musicNodes[1].frequency.setValueAtTime(freq2, this.ctx.currentTime);
        }
    }
}
