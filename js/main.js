/**
 * ============================================================================
 * MAIN APPLICATION ORCHESTRATOR & STATE MACHINE
 * ============================================================================
 * Coordinates the 4-stage birthday experience:
 * Stage 1: Intro / Opening Screen
 * Stage 2: Greeting Reveal & Celebration
 * Stage 3: Cake & Candle Blowing Interaction (Auto-transitions after 2-3s)
 * Stage 4: Memories Image Carousel (Automatic continuous loop)
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // --------------------------------------------------------------------------
    // 1. Central Configuration & Application State
    // --------------------------------------------------------------------------
    const cfg = (typeof BirthdayConstants !== "undefined") ? BirthdayConstants : birthdayConfig;

    const state = {
        currentStage: "intro",
        isTransitioning: false,
        candleBlown: false,
        balloonPopCount: 0,
        greetingRevealed: false
    };

    // --------------------------------------------------------------------------
    // 2. Instantiate Audio, Effects, and Particle Engines
    // --------------------------------------------------------------------------
    const audio = new AudioEngine(cfg);
    const starfield = new StarfieldEngine("stars-canvas");
    const fireworks = new FireworksEngine("fireworks-canvas", audio);
    const confetti = new ConfettiEngine("confetti-canvas");
    const flame = new CandleFlameEngine("flame-canvas");

    // Initialize Balloon Engine with pop milestones (18th: eightteen.mp3, 19th: nineteen.mp3, 22nd: easter egg)
    const balloons = new BalloonEngine("balloons-canvas", audio, () => {
        state.balloonPopCount++;
        const currentPop = state.balloonPopCount;

        // 18th Balloon Pop: play eightteen.mp3 and pause popping for 2 seconds
        if (currentPop === (cfg.BALLOON_EIGHTTEEN_COUNT || 18)) {
            balloons.isPoppingPaused = true;
            audio.playSfx("eightteen", 0.95);
            setTimeout(() => {
                balloons.isPoppingPaused = false;
            }, 2000);
        }
        // 19th Balloon Pop: play nineteen.mp3 and pause popping for 1.4 seconds
        else if (currentPop === (cfg.BALLOON_NINETEEN_COUNT || 19)) {
            balloons.isPoppingPaused = true;
            audio.playSfx("nineteen", 0.95);
            setTimeout(() => {
                balloons.isPoppingPaused = false;
            }, 1400);
        }

        // 22nd Balloon Pop: trigger Easter Egg #2
        surprises.checkBalloonMilestone(currentPop);
    });

    const effectsBundle = {
        audio: audio,
        fireworks: fireworks,
        confetti: confetti
    };

    const carousel = new MemoriesCarousel(cfg);
    const surprises = new SurprisesManager(cfg, effectsBundle);

    // --------------------------------------------------------------------------
    // 3. Central Render Loop (60 FPS via requestAnimationFrame)
    // --------------------------------------------------------------------------
    let isTabVisible = true;

    function renderLoop() {
        if (isTabVisible) {
            starfield.render();
            fireworks.render();
            balloons.render();
            confetti.render();
            flame.render();
        }
        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);

    // Pause heavy rendering when browser tab is hidden
    document.addEventListener("visibilitychange", () => {
        isTabVisible = !document.hidden;
    });

    // --------------------------------------------------------------------------
    // 4. UI Elements & Configuration Injection
    // --------------------------------------------------------------------------
    const screenIntro = document.getElementById("screen-intro");
    const screenGreeting = document.getElementById("screen-greeting");
    const screenCake = document.getElementById("screen-cake");
    const screenMemories = document.getElementById("screen-memories");

    const btnOpen = document.getElementById("btn-open");
    const btnCelebrate = document.getElementById("btn-celebrate");
    const cakeWrapper = document.getElementById("cake-wrapper");
    const cakeInstruction = document.getElementById("cake-instruction");

    // Inject configuration texts from constants.js into DOM
    injectConfigText();

    function injectConfigText() {
        // Screen 1: Intro
        const introPrompt = document.getElementById("intro-prompt");
        const introSubtext = document.getElementById("intro-subtext");
        if (introPrompt) introPrompt.textContent = cfg.OPEN_PROMPT || "A little surprise awaits you...";
        if (btnOpen) btnOpen.textContent = cfg.OPEN_BUTTON_TEXT || "OPEN ✦";
        if (introSubtext) introSubtext.textContent = cfg.OPEN_SUBTEXT || "Tap to begin the celebration";

        // Screen 2: Greeting
        const greetingLead = document.getElementById("greeting-lead");
        const greetingName = document.getElementById("greeting-name");
        const greetingSubtitle = document.getElementById("greeting-subtitle");
        if (greetingLead) greetingLead.textContent = cfg.GREETING || "HAPPY BIRTHDAY";
        if (greetingName) greetingName.textContent = cfg.NAME || "PRINCE";
        if (greetingSubtitle) greetingSubtitle.textContent = cfg.SUBTITLE || "Today is all about you.";
        if (btnCelebrate) btnCelebrate.textContent = cfg.CELEBRATE_BUTTON_TEXT || "LET'S CELEBRATE ✦";

        // Screen 3: Cake
        if (cakeInstruction) cakeInstruction.textContent = cfg.CAKE_INSTRUCTION || "Make a wish and tap the cake to blow out the candle.";

        // Screen 4: Memories
        const memoriesTitle = document.getElementById("memories-header-title");
        const memoriesSub = document.getElementById("memories-header-subtitle");
        if (memoriesTitle) memoriesTitle.textContent = cfg.MEMORIES_TITLE || "LITTLE MOMENTS, BIG MEMORIES";
        if (memoriesSub) memoriesSub.textContent = cfg.MEMORIES_SUBTITLE || "Every memory with you is a treasure to keep.";
    }

    // --------------------------------------------------------------------------
    // 5. Screen Transitions & State Machine
    // --------------------------------------------------------------------------
    function transitionToScreen(targetStage) {
        if (state.isTransitioning || state.currentStage === targetStage) return;
        state.isTransitioning = true;

        const screens = {
            intro: screenIntro,
            greeting: screenGreeting,
            cake: screenCake,
            memories: screenMemories
        };

        const currentScreenEl = screens[state.currentStage];
        const targetScreenEl = screens[targetStage];

        // Clean up previous stage timers
        if (state.currentStage === "memories" && targetStage !== "memories") {
            carousel.stop();
            surprises.cancelTimedSurpriseTimer();
        }

        // Animate out current screen
        if (currentScreenEl) {
            currentScreenEl.classList.remove("active");
            currentScreenEl.classList.add("exiting");
        }

        setTimeout(() => {
            if (currentScreenEl) {
                currentScreenEl.classList.add("hidden");
                currentScreenEl.classList.remove("exiting");
                currentScreenEl.setAttribute("aria-hidden", "true");
            }

            // Animate in target screen
            if (targetScreenEl) {
                targetScreenEl.classList.remove("hidden");
                targetScreenEl.setAttribute("aria-hidden", "false");
                void targetScreenEl.offsetWidth; // Force reflow
                targetScreenEl.classList.add("active");
            }

            state.currentStage = targetStage;
            state.isTransitioning = false;

            // Trigger stage-specific entry logic
            onStageEntered(targetStage);
        }, 550);
    }

    function onStageEntered(stage) {
        if (stage === "greeting") {
            const appEl = document.getElementById("app");
            if (appEl) appEl.classList.remove("stage-intro");
            balloons.start();
            revealGreetingSequence();
        } else if (stage === "cake") {
            // Cake stage ready for tap
        } else if (stage === "memories") {
            carousel.start();
            surprises.startTimedSurpriseTimer();
        }
    }

    // --------------------------------------------------------------------------
    // 6. Stage 1: Opening Screen Interaction
    // --------------------------------------------------------------------------
    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            const appEl = document.getElementById("app");
            if (appEl) appEl.classList.remove("stage-intro");
            balloons.start();
            audio.startBgMusic();
            confetti.burstTriple();
            triggerScreenFlash();
            fireworks.launchCelebrationSalvo(3);
            transitionToScreen("greeting");
        });
    }

    // --------------------------------------------------------------------------
    // 7. Stage 2: Greeting Reveal Animation Sequence
    // --------------------------------------------------------------------------
    function revealGreetingSequence() {
        const leadEl = document.getElementById("greeting-lead");
        const nameEl = document.getElementById("greeting-name");
        const subEl = document.getElementById("greeting-subtitle");
        const btnEl = document.getElementById("btn-celebrate");

        // Use GSAP if available, otherwise pure CSS transitions
        if (typeof gsap !== "undefined") {
            const tl = gsap.timeline();

            tl.fromTo(leadEl,
                { opacity: 0, y: 35, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out" }
            );

            tl.fromTo(nameEl,
                { opacity: 0, scale: 0.7, filter: "blur(10px)" },
                {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 1.2,
                    ease: "back.out(1.6)",
                    onComplete: () => {
                        // Peak celebration moment on greeting name reveal!
                        confetti.burstTriple();
                        triggerScreenFlash();
                        fireworks.launchCelebrationSalvo(5);
                        audio.playSfx("surprise", 0.75);
                    }
                },
                "-=0.3"
            );

            tl.fromTo(subEl,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
                "+=0.2"
            );

            tl.fromTo(btnEl,
                { opacity: 0, scale: 0.85, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" },
                "+=0.3"
            );
        } else {
            // CSS Fallback
            leadEl.classList.add("reveal-active");
            setTimeout(() => {
                nameEl.classList.add("reveal-active");
                confetti.burstTriple();
                triggerScreenFlash();
                fireworks.launchCelebrationSalvo(5);
                audio.playSfx("surprise", 0.75);
            }, 800);
            setTimeout(() => subEl.classList.add("reveal-active"), 1600);
            setTimeout(() => btnEl.classList.add("reveal-active"), 2200);
        }
    }

    if (btnCelebrate) {
        btnCelebrate.addEventListener("click", () => {
            confetti.burstTriple();
            transitionToScreen("cake");
        });
    }

    // --------------------------------------------------------------------------
    // 8. Stage 3: Cake & Candle Interaction (Automatic transition after 2-3s!)
    // --------------------------------------------------------------------------
    if (cakeWrapper) {
        const handleCakeInteraction = () => {
            if (state.candleBlown) return; // Guard: only blown once
            state.candleBlown = true;

            // 1. Play candle extinguishing sound
            audio.playSfx("candle-blow", 0.85);

            // 2. Extinguish flame & spawn rising smoke particles
            flame.extinguish();

            // 3. Celebratory explosions
            confetti.burstTriple();
            triggerScreenFlash();
            fireworks.launchCelebrationSalvo(6);

            // 4. Update instruction to wish fulfilled message
            if (cakeInstruction) {
                cakeInstruction.innerHTML = `<span class="glow-text">✨ ${cfg.CAKE_WISH_MESSAGE || "Your wish is on its way!"} ✨</span>`;
                cakeInstruction.classList.add("wish-fulfilled");
            }

            // 5. Automatically transition to image carousel section after 2-3s (no button needed!)
            const transitionDelay = cfg.CAKE_AUTO_TRANSITION_DELAY || 2600;
            setTimeout(() => {
                confetti.burstTriple();
                transitionToScreen("memories");
            }, transitionDelay);
        };

        cakeWrapper.addEventListener("click", handleCakeInteraction);
        cakeWrapper.addEventListener("touchstart", (e) => {
            e.preventDefault();
            handleCakeInteraction();
        }, { passive: false });
    }
});
