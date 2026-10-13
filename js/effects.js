/**
 * ============================================================================
 * EFFECTS ENGINE - CANVAS, PARTICLES, FIREWORKS, BALLOONS, AUDIO & CONFETTI
 * ============================================================================
 * Self-contained, performant particle engines and audio manager.
 * Uses requestAnimationFrame, object pooling, and responsive canvas sizing.
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
   1. Audio Engine (Dual Mode: MP3 + Web Audio API Synth Fallback)
   ---------------------------------------------------------------------------- */
class AudioEngine {
    constructor(config) {
        this.config = (config && config.audio) ? config.audio : (config && config.AUDIO ? config.AUDIO : {});
        this.bgAudio = document.getElementById("bg-audio");
        this.isMuted = false;
        this.isPlaying = false;
        this.audioCtx = null;
        this.synthPlaying = false;
        this.synthInterval = null;

        // Sound Effects Audio Pools (for zero-latency playback)
        this.sfxPool = {
            "balloon-pop": [],
            "candle-blow": [],
            "eightteen": [],
            "nineteen": [],
            "surprise": []
        };

        this.initSfxPool();
    }

    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    initSfxPool() {
        const sfxSources = {
            "balloon-pop": this.config.balloonPop || "assets/audio/balloon-pop.mp3",
            "candle-blow": this.config.candleBlow || "assets/audio/candle-blow.mp3",
            "eightteen": this.config.eightteen || "assets/audio/eightteen.mp3",
            "nineteen": this.config.nineteen || "assets/audio/nineteen.mp3",
            "surprise": this.config.surprise || "assets/audio/surprise.mp3"
        };

        for (const [key, path] of Object.entries(sfxSources)) {
            if (!path) continue;
            const count = (key === "eightteen" || key === "nineteen") ? 1 : 3;
            for (let i = 0; i < count; i++) {
                const audio = new Audio(path);
                audio.preload = "auto";
                audio.volume = 0.85;
                this.sfxPool[key].push(audio);
            }
        }
    }

    startBgMusic() {
        this.getAudioContext();
        if (this.isMuted) return;

        if (this.bgAudio) {
            this.bgAudio.volume = 0;
            const playPromise = this.bgAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                    this.fadeVolume(this.bgAudio, 0, 0.65, 2000);
                }).catch(() => {
                    // Audio file failed to play or was blocked; fall back to Synth Music Box!
                    this.startSynthMusicBox();
                });
            }
        } else {
            this.startSynthMusicBox();
        }
    }

    fadeVolume(audioElement, fromVol, toVol, durationMs) {
        if (!audioElement) return;
        const steps = 25;
        const stepTime = durationMs / steps;
        const volStep = (toVol - fromVol) / steps;
        let currentVol = fromVol;
        audioElement.volume = currentVol;

        const interval = setInterval(() => {
            currentVol += volStep;
            if ((volStep > 0 && currentVol >= toVol) || (volStep < 0 && currentVol <= toVol)) {
                audioElement.volume = Math.max(0, Math.min(1, toVol));
                clearInterval(interval);
            } else {
                audioElement.volume = Math.max(0, Math.min(1, currentVol));
            }
        }, stepTime);
    }

    playSfx(type, customVol = 0.8) {
        if (this.isMuted) return;

        // Try playing from HTML5 Audio Pool first
        const pool = this.sfxPool[type];
        if (pool && pool.length > 0) {
            const audio = pool.find(a => a.paused || a.ended) || pool[0];
            try {
                audio.currentTime = 0;
                audio.volume = customVol;

                // If voice track (eightteen or nineteen), duck background music volume so voice is crystal clear!
                if ((type === "eightteen" || type === "nineteen") && this.bgAudio && !this.bgAudio.paused) {
                    const originalVol = this.bgAudio.volume;
                    this.bgAudio.volume = 0.12;

                    const restoreVol = () => {
                        if (this.bgAudio) {
                            this.fadeVolume(this.bgAudio, this.bgAudio.volume, originalVol, 500);
                        }
                        audio.removeEventListener("ended", restoreVol);
                    };

                    audio.addEventListener("ended", restoreVol);
                    const timeoutMs = (type === "eightteen") ? 2200 : 1200;
                    setTimeout(restoreVol, timeoutMs);
                }

                const p = audio.play();
                if (p !== undefined) {
                    p.catch(() => {
                        this.playSynthSfx(type);
                    });
                    return;
                }
            } catch (e) {
                this.playSynthSfx(type);
                return;
            }
        }

        // Web Audio fallback
        this.playSynthSfx(type);
    }

    // Web Audio Synthesizer Fallbacks (Zero-dependencies, guaranteed sound)
    playSynthSfx(type) {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        if (type === "balloon-pop") {
            // Rapid resonant drop from 680Hz to 110Hz
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(680, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);

            gain.gain.setValueAtTime(0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === "candle-blow") {
            // Filtered breath noise puff
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(600, now);
            filter.Q.setValueAtTime(2.0, now);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.45, now + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 0.52);
        } else if (type === "surprise") {
            // Celestial Chime Arpeggio: C5, E5, G5, C6, E6
            const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            freqs.forEach((freq, idx) => {
                const noteTime = now + idx * 0.12;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.28, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.7);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(noteTime);
                osc.stop(noteTime + 0.75);
            });
        }
    }

    startSynthMusicBox() {
        const ctx = this.getAudioContext();
        if (!ctx || this.synthPlaying || this.isMuted) return;

        this.synthPlaying = true;
        this.isPlaying = true;

        const notes = [
            { f: 392.00, d: 0.35 }, { f: 392.00, d: 0.25 }, { f: 440.00, d: 0.6 },
            { f: 392.00, d: 0.6 }, { f: 523.25, d: 0.6 }, { f: 493.88, d: 1.2 },
            { f: 392.00, d: 0.35 }, { f: 392.00, d: 0.25 }, { f: 440.00, d: 0.6 },
            { f: 392.00, d: 0.6 }, { f: 587.33, d: 0.6 }, { f: 523.25, d: 1.2 },
            { f: 392.00, d: 0.35 }, { f: 392.00, d: 0.25 }, { f: 783.99, d: 0.6 },
            { f: 659.25, d: 0.6 }, { f: 523.25, d: 0.6 }, { f: 493.88, d: 0.6 }, { f: 440.00, d: 0.9 },
            { f: 698.46, d: 0.35 }, { f: 698.46, d: 0.25 }, { f: 659.25, d: 0.6 },
            { f: 523.25, d: 0.6 }, { f: 587.33, d: 0.6 }, { f: 523.25, d: 1.5 }
        ];

        let noteIndex = 0;
        const playNext = () => {
            if (!this.synthPlaying || this.isMuted) return;
            const currentNote = notes[noteIndex];
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(currentNote.f, now);
            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(currentNote.f * 2, now);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + currentNote.d + 0.3);

            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc2.start(now);
            osc.stop(now + currentNote.d + 0.35);
            osc2.stop(now + currentNote.d + 0.35);

            noteIndex = (noteIndex + 1) % notes.length;
            this.synthTimeout = setTimeout(playNext, (currentNote.d + 0.1) * 1000);
        };

        playNext();
    }

    stopSynthMusicBox() {
        this.synthPlaying = false;
        if (this.synthTimeout) {
            clearTimeout(this.synthTimeout);
            this.synthTimeout = null;
        }
    }
}

/* ----------------------------------------------------------------------------
   2. Starfield & Cosmic Dust Engine (Canvas)
   ---------------------------------------------------------------------------- */
class StarfieldEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.stars = [];
        this.dust = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.resize();
        this.initElements();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initElements() {
        const starCount = Math.min(85, Math.floor((this.width * this.height) / 10000));
        this.stars = [];
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.3 + 0.3,
                baseAlpha: Math.random() * 0.5 + 0.15,
                twinkleSpeed: Math.random() * 0.025 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                color: Math.random() > 0.4 ? "#a7f3d0" : "#ffffff"
            });
        }

        // Subtle floating ambient emerald dust particles
        this.dust = [];
        for (let i = 0; i < 18; i++) {
            this.dust.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: -Math.random() * 0.35 - 0.08,
                radius: Math.random() * 1.8 + 0.8,
                alpha: Math.random() * 0.35 + 0.08,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Stars
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];
            s.twinklePhase += s.twinkleSpeed;
            const alpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.2;

            this.ctx.fillStyle = s.color;
            this.ctx.globalAlpha = Math.max(0.08, Math.min(0.9, alpha));
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 2. Cosmic Dust
        for (let i = 0; i < this.dust.length; i++) {
            const d = this.dust[i];
            d.x += d.vx;
            d.y += d.vy;
            d.phase += 0.018;

            if (d.y < -10) d.y = this.height + 10;
            if (d.x < -10) d.x = this.width + 10;
            if (d.x > this.width + 10) d.x = -10;

            const alpha = d.alpha * (0.6 + Math.sin(d.phase) * 0.4);
            this.ctx.fillStyle = "#34d399";
            this.ctx.globalAlpha = Math.max(0, Math.min(0.5, alpha));
            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
    }
}

/* ----------------------------------------------------------------------------
   3. Fireworks Engine (Canvas)
   ---------------------------------------------------------------------------- */
class FireworksEngine {
    constructor(canvasId, audioEngine) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.audio = audioEngine;
        this.rockets = [];
        this.particles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Elegant green & celebratory palettes (softer, toned down)
        this.palettes = [
            ["#10b981", "#6ee7b7", "#ffffff", "#059669"],      // Emerald & Mint
            ["#34d399", "#a7f3d0", "#ffffff", "#047857"],      // Soft Luminous Jade
            ["#39FF14", "#9AFF80", "#ffffff", "#059669"],      // Electric Green & White
            ["#d1fae5", "#6ee7b7", "#ffffff", "#10b981"]       // Delicate Mint & Diamond
        ];

        this.nextFireworkTime = Date.now() + 1600;
        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    launchRocket(startX, targetX, targetY) {
        const x = startX !== undefined ? startX : Math.random() * (this.width * 0.7) + this.width * 0.15;
        const ty = targetY !== undefined ? targetY : Math.random() * (this.height * 0.45) + this.height * 0.12;
        const tx = targetX !== undefined ? targetX : x + (Math.random() - 0.5) * 80;

        const distanceY = ty - this.height;
        const speed = Math.sqrt(2 * 0.22 * Math.abs(distanceY));
        const duration = speed / 0.22;
        const vx = (tx - x) / duration;

        this.rockets.push({
            x: x,
            y: this.height,
            vx: vx,
            vy: -speed,
            gravity: 0.22,
            targetY: ty,
            trail: []
        });
    }

    explode(x, y) {
        const shapes = ["SPHERE", "RING", "STARBURST", "CASCADE", "DOUBLE"];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const particleCount = Math.floor(Math.random() * 40 + 65);
        const palette = this.palettes[Math.floor(Math.random() * this.palettes.length)];

        for (let i = 0; i < particleCount; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 6.0 + 1.8;
            let gravity = 0.08;
            let drag = 0.96;
            let decay = Math.random() * 0.018 + 0.012;

            if (shape === "RING") {
                speed = 4.2 + Math.random() * 0.5;
            } else if (shape === "CASCADE") {
                gravity = 0.13;
                drag = 0.975;
                decay = 0.009;
            } else if (shape === "STARBURST") {
                const arms = 6;
                const armAngle = (Math.floor(Math.random() * arms) * (Math.PI * 2)) / arms;
                angle = armAngle + (Math.random() - 0.5) * 0.25;
            }

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: gravity,
                drag: drag,
                color: palette[Math.floor(Math.random() * palette.length)],
                alpha: 1,
                life: 1,
                decay: decay,
                size: Math.random() * 2.4 + 1.2
            });
        }
    }

    launchCelebrationSalvo(count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = Math.random() * (this.width * 0.8) + this.width * 0.1;
                const y = Math.random() * (this.height * 0.45) + this.height * 0.1;
                this.launchRocket(x, x + (Math.random() - 0.5) * 100, y);
            }, i * 220);
        }
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Ambient scheduler
        if (Date.now() > this.nextFireworkTime) {
            this.launchRocket();
            const delay = Math.random() * 2000 + 1500;
            this.nextFireworkTime = Date.now() + delay;
        }

        // Rockets
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            r.trail.push({ x: r.x, y: r.y });
            if (r.trail.length > 5) r.trail.shift();

            r.x += r.vx;
            r.y += r.vy;
            r.vy += r.gravity;

            // Subtle rocket trail
            this.ctx.strokeStyle = "rgba(52, 211, 153, 0.5)";
            this.ctx.lineWidth = 1.6;
            this.ctx.beginPath();
            for (let t = 0; t < r.trail.length; t++) {
                if (t === 0) this.ctx.moveTo(r.trail[t].x, r.trail[t].y);
                else this.ctx.lineTo(r.trail[t].x, r.trail[t].y);
            }
            this.ctx.stroke();

            // Rocket head
            this.ctx.fillStyle = "#ffffff";
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
            this.ctx.fill();

            if (r.vy >= 0 || r.y <= r.targetY) {
                this.explode(r.x, r.y);
                this.rockets.splice(i, 1);
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.alpha = Math.max(0, p.life);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
}

/* ----------------------------------------------------------------------------
   4. 3D Glossy Interactive Balloons Engine (ONLY GREEN SHADES!)
   ---------------------------------------------------------------------------- */
class BalloonEngine {
    constructor(canvasId, audioEngine, onPopCallback) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.audio = audioEngine;
        this.onPop = onPopCallback;
        this.balloons = [];
        this.popParticles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.targetCount = 14;
        this.isPoppingPaused = false; // Pause popping during voice clip milestones
        this.isActive = false; // Starts inactive so no balloons on screen 1

        // ONLY GREEN SHADES (Rich emerald, vivid neon, soft mint, dark forest, lime, jade)
        this.palettes = [
            { primary: "#10b981", highlight: "#a7f3d0", dark: "#064e3b", name: "Emerald" },
            { primary: "#39FF14", highlight: "#dcfce7", dark: "#065f1e", name: "Neon Green" },
            { primary: "#6ee7b7", highlight: "#ecfdf5", dark: "#047857", name: "Soft Mint" },
            { primary: "#059669", highlight: "#86efac", dark: "#022c15", name: "Dark Forest Green" },
            { primary: "#84cc16", highlight: "#ecfccb", dark: "#365314", name: "Lime Green" },
            { primary: "#047857", highlight: "#6ee7b7", dark: "#022c22", name: "Jade Green" },
            { primary: "#064e1e", highlight: "#39FF14", dark: "#021206", name: "Deep Shadow Emerald" }
        ];

        this.resize();
        this.initEvents();
        window.addEventListener("resize", () => this.resize());
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        // Spawn balloons from below the screen so they float up smoothly
        for (let i = 0; i < this.targetCount; i++) {
            const y = this.height + 40 + Math.random() * (this.height * 0.9);
            this.balloons.push(this.createBalloon(y));
        }
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createBalloon(yPos) {
        const radius = Math.random() * 12 + 25; // 25 - 37px
        const palette = this.palettes[Math.floor(Math.random() * this.palettes.length)];
        const x = Math.random() * (this.width - radius * 4) + radius * 2;
        const y = yPos !== undefined ? yPos : this.height + radius * 3 + Math.random() * 180;

        return {
            id: Math.random().toString(36).substring(2, 9),
            x: x,
            baseX: x,
            y: y,
            radiusX: radius * 0.86,
            radiusY: radius * 1.16,
            vy: -(Math.random() * 0.85 + 0.85),
            swayAmplitude: Math.random() * 24 + 14,
            swaySpeed: Math.random() * 0.02 + 0.015,
            swayPhase: Math.random() * Math.PI * 2,
            palette: palette,
            stringLength: radius * 1.8,
            popping: false
        };
    }

    seedBalloons(count) {
        for (let i = 0; i < count; i++) {
            const y = Math.random() * this.height;
            this.balloons.push(this.createBalloon(y));
        }
    }

    initEvents() {
        const handleInteraction = (e) => {
            if (this.isPoppingPaused) return;

            // Check if user clicked an interactive UI element first
            const target = document.elementFromPoint(e.clientX, e.clientY);
            if (target && target.closest("button, a, input, textarea, .glass-card, #modal-timed-surprise, #modal-milestone-surprise, #cake-wrapper")) {
                return;
            }

            this.hitTest(e.clientX, e.clientY);
        };

        window.addEventListener("click", handleInteraction, { passive: true });
        window.addEventListener("touchstart", (e) => {
            if (this.isPoppingPaused) return;
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && target.closest("button, a, input, textarea, .glass-card, #modal-timed-surprise, #modal-milestone-surprise, #cake-wrapper")) {
                    return;
                }
                this.hitTest(touch.clientX, touch.clientY);
            }
        }, { passive: true });
    }

    hitTest(px, py) {
        if (!this.isActive || this.isPoppingPaused) return false;

        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];
            if (b.popping) continue;

            const dx = (px - b.x) / b.radiusX;
            const dy = (py - b.y) / b.radiusY;
            if (dx * dx + dy * dy <= 1.35) {
                this.pop(b, i);
                return true;
            }
        }
        return false;
    }

    pop(balloon, index) {
        balloon.popping = true;
        this.audio.playSfx("balloon-pop", 0.75);

        // Spawn pop particles (skin shards + glowing sparks)
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5.5 + 2;
            this.popParticles.push({
                x: balloon.x,
                y: balloon.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.12,
                color: Math.random() > 0.4 ? balloon.palette.primary : balloon.palette.highlight,
                size: Math.random() * 3 + 1.5,
                alpha: 1,
                decay: Math.random() * 0.035 + 0.025
            });
        }

        // Notify callback (increments counter & checks milestone)
        if (typeof this.onPop === "function") {
            this.onPop();
        }

        this.balloons.splice(index, 1);
        setTimeout(() => {
            if (this.isActive && this.balloons.length < this.targetCount) {
                this.balloons.push(this.createBalloon());
            }
        }, Math.random() * 700 + 350);
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Do not render balloons until started (screen 2 onwards)
        if (!this.isActive) return;

        // Render Balloons
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];

            b.swayPhase += b.swaySpeed;
            b.x = b.baseX + Math.sin(b.swayPhase) * b.swayAmplitude;
            b.y += b.vy;

            // Recycle balloon when it floats off screen top
            if (b.y < -b.radiusY * 3) {
                this.balloons[i] = this.createBalloon();
                continue;
            }

            const tilt = Math.cos(b.swayPhase) * 0.12;

            this.ctx.save();
            this.ctx.translate(b.x, b.y);
            this.ctx.rotate(tilt);

            // 1. Balloon String (curved wavy line)
            this.ctx.beginPath();
            this.ctx.moveTo(0, b.radiusY);
            const stringWiggle = Math.sin(b.swayPhase * 1.5) * 7;
            this.ctx.quadraticCurveTo(stringWiggle, b.radiusY + b.stringLength * 0.5, 0, b.radiusY + b.stringLength);
            this.ctx.strokeStyle = "rgba(167, 243, 208, 0.55)";
            this.ctx.lineWidth = 1.2;
            this.ctx.stroke();

            // 2. Balloon Knot (Triangle)
            this.ctx.beginPath();
            this.ctx.moveTo(-4, b.radiusY + 4);
            this.ctx.lineTo(4, b.radiusY + 4);
            this.ctx.lineTo(0, b.radiusY - 1);
            this.ctx.closePath();
            this.ctx.fillStyle = b.palette.dark;
            this.ctx.fill();

            // 3. 3D Glossy Balloon Body (Radial Gradient)
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, b.radiusX, b.radiusY, 0, 0, Math.PI * 2);

            const grad = this.ctx.createRadialGradient(
                -b.radiusX * 0.3, -b.radiusY * 0.35, b.radiusX * 0.1,
                0, 0, b.radiusY
            );
            grad.addColorStop(0, b.palette.highlight);
            grad.addColorStop(0.35, b.palette.primary);
            grad.addColorStop(0.85, b.palette.dark);
            grad.addColorStop(1, "#020703");

            this.ctx.fillStyle = grad;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // 4. Specular Highlight Gleam
            this.ctx.beginPath();
            this.ctx.ellipse(-b.radiusX * 0.38, -b.radiusY * 0.4, b.radiusX * 0.28, b.radiusY * 0.18, -0.3, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
            this.ctx.fill();

            this.ctx.restore();
        }

        // Render Pop Particles
        for (let i = this.popParticles.length - 1; i >= 0; i--) {
            const p = this.popParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.popParticles.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
    }
}

/* ----------------------------------------------------------------------------
   5. Organic Candle Flame & Smoke Engine (Canvas)
   ---------------------------------------------------------------------------- */
class CandleFlameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.isLit = true;
        this.smokeParticles = [];
        this.flickerPhase = 0;

        this.canvas.width = 120;
        this.canvas.height = 150;
    }

    extinguish() {
        if (!this.isLit) return;
        this.isLit = false;

        // Spawn realistic rising smoke particles
        for (let i = 0; i < 28; i++) {
            this.smokeParticles.push({
                x: 60 + (Math.random() - 0.5) * 6,
                y: 128,
                vx: (Math.random() - 0.5) * 1.4,
                vy: -(Math.random() * 1.6 + 1.1),
                radius: Math.random() * 3 + 2,
                maxRadius: Math.random() * 18 + 12,
                alpha: 0.72,
                decay: Math.random() * 0.012 + 0.008,
                swaySpeed: Math.random() * 0.05 + 0.02,
                swayPhase: Math.random() * Math.PI * 2
            });
        }
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isLit) {
            this.flickerPhase += 0.14;
            const wobbleX = Math.sin(this.flickerPhase) * 2.2;
            const wobbleY = Math.cos(this.flickerPhase * 1.3) * 2.4;
            const flameHeight = 36 + wobbleY;
            const flameWidth = 14 + Math.sin(this.flickerPhase * 1.8) * 1.3;

            const centerX = 60;
            const baseY = 130;

            // 1. Soft Radiant Outer Halo
            this.ctx.save();
            const haloGrad = this.ctx.createRadialGradient(centerX, baseY - 20, 4, centerX, baseY - 20, 48);
            haloGrad.addColorStop(0, "rgba(57, 255, 20, 0.4)");
            haloGrad.addColorStop(0.5, "rgba(16, 185, 129, 0.15)");
            haloGrad.addColorStop(1, "rgba(5, 8, 5, 0)");
            this.ctx.fillStyle = haloGrad;
            this.ctx.beginPath();
            this.ctx.arc(centerX, baseY - 20, 48, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // 2. Outer Neon Flame Body
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - flameWidth * 0.5, baseY);
            this.ctx.quadraticCurveTo(
                centerX - flameWidth * 0.85, baseY - flameHeight * 0.5,
                centerX + wobbleX, baseY - flameHeight
            );
            this.ctx.quadraticCurveTo(
                centerX + flameWidth * 0.85, baseY - flameHeight * 0.5,
                centerX + flameWidth * 0.5, baseY
            );
            this.ctx.closePath();

            const outerGrad = this.ctx.createLinearGradient(centerX, baseY, centerX, baseY - flameHeight);
            outerGrad.addColorStop(0, "#065f1e");
            outerGrad.addColorStop(0.3, "#10b981");
            outerGrad.addColorStop(0.7, "#39FF14");
            outerGrad.addColorStop(1, "#ffffff");

            this.ctx.fillStyle = outerGrad;
            this.ctx.shadowBlur = 18;
            this.ctx.shadowColor = "#39FF14";
            this.ctx.fill();

            // 3. Inner White-Hot Core
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - flameWidth * 0.25, baseY);
            this.ctx.quadraticCurveTo(
                centerX - flameWidth * 0.35, baseY - flameHeight * 0.4,
                centerX + wobbleX * 0.5, baseY - flameHeight * 0.75
            );
            this.ctx.quadraticCurveTo(
                centerX + flameWidth * 0.35, baseY - flameHeight * 0.4,
                centerX + flameWidth * 0.25, baseY
            );
            this.ctx.closePath();
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fill();
            this.ctx.restore();
        }

        // Render Smoke Particles
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const s = this.smokeParticles[i];
            s.swayPhase += s.swaySpeed;
            s.x += s.vx + Math.sin(s.swayPhase) * 0.45;
            s.y += s.vy;
            s.radius = Math.min(s.maxRadius, s.radius + 0.18);
            s.alpha -= s.decay;

            if (s.alpha <= 0 || s.y < 0) {
                this.smokeParticles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(160, 210, 180, ${s.alpha * 0.45})`;
            this.ctx.fill();
            this.ctx.restore();
        }
    }
}

/* ----------------------------------------------------------------------------
   6. 3D Tumbling Confetti Engine (Canvas)
   ---------------------------------------------------------------------------- */
class ConfettiEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.colors = [
            "#39FF14", "#9AFF80", "#10b981", "#34d399",
            "#ffffff", "#dcfce7", "#6ee7b7", "#a7f3d0"
        ];

        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    burst(originX, originY, count = 90, angleDirection = "random") {
        const posX = originX !== undefined ? originX : this.width * 0.5;
        const posY = originY !== undefined ? originY : this.height * 0.3;

        for (let i = 0; i < count; i++) {
            let vx, vy;
            if (angleDirection === "left") {
                vx = Math.random() * 12 + 4;
                vy = -(Math.random() * 11 + 4);
            } else if (angleDirection === "right") {
                vx = -(Math.random() * 12 + 4);
                vy = -(Math.random() * 11 + 4);
            } else if (angleDirection === "top") {
                vx = (Math.random() - 0.5) * 12;
                vy = Math.random() * 6 + 3;
            } else {
                vx = (Math.random() - 0.5) * 16;
                vy = -(Math.random() * 12 + 4);
            }

            const shapes = ["rect", "strip", "circle"];
            this.particles.push({
                x: posX,
                y: posY,
                vx: vx,
                vy: vy,
                gravity: 0.14,
                drag: 0.96,
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                size: Math.random() * 8 + 6,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotationX: Math.random() * Math.PI * 2,
                rotationY: Math.random() * Math.PI * 2,
                rotSpeedX: (Math.random() - 0.5) * 0.1,
                rotSpeedY: (Math.random() - 0.5) * 0.1,
                alpha: 1,
                decay: Math.random() * 0.007 + 0.005
            });
        }
    }

    burstTriple() {
        this.burst(this.width * 0.05, this.height * 0.5, 55, "left");
        this.burst(this.width * 0.95, this.height * 0.5, 55, "right");
        this.burst(this.width * 0.5, 0, 70, "top");

        if (typeof window.confetti === "function") {
            try {
                window.confetti({
                    particleCount: 45,
                    angle: 60,
                    spread: 60,
                    origin: { x: 0, y: 0.6 },
                    colors: ["#39FF14", "#10b981", "#ffffff", "#6ee7b7"]
                });
                window.confetti({
                    particleCount: 45,
                    angle: 120,
                    spread: 60,
                    origin: { x: 1, y: 0.6 },
                    colors: ["#39FF14", "#10b981", "#ffffff", "#6ee7b7"]
                });
                window.confetti({
                    particleCount: 45,
                    angle: 90,
                    spread: 80,
                    origin: { x: 0.5, y: 0 },
                    colors: ["#39FF14", "#34d399", "#ffffff", "#dcfce7"]
                });
            } catch (e) {
                // Ignore external confetti error and rely on our canvas engine
            }
        }
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;

            p.rotationX += p.rotSpeedX;
            p.rotationY += p.rotSpeedY;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y > this.height + 30) {
                this.particles.splice(i, 1);
                continue;
            }

            const scaleX = Math.cos(p.rotationX);
            const scaleY = Math.sin(p.rotationY);

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.scale(scaleX, scaleY);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

            if (p.shape === "rect") {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.75);
            } else if (p.shape === "strip") {
                this.ctx.fillRect(-p.size / 2, -p.size * 0.2, p.size * 1.4, p.size * 0.35);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        this.ctx.globalAlpha = 1;
    }
}

/* ----------------------------------------------------------------------------
   7. Reusable Screen Flash Effect
   ---------------------------------------------------------------------------- */
function triggerScreenFlash() {
    const flashEl = document.getElementById("flash-overlay");
    if (!flashEl) return;

    flashEl.classList.remove("active");
    void flashEl.offsetWidth;
    flashEl.classList.add("active");

    setTimeout(() => {
        flashEl.classList.remove("active");
    }, 420);
}
