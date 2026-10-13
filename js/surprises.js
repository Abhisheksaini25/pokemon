/**
 * ============================================================================
 * SURPRISES & EASTER EGGS MODULE
 * ============================================================================
 * Manages the two hidden celebratory easter eggs:
 * 1. Timed Surprise: Triggers precisely 12 seconds after entering Memories Screen.
 * 2. Balloon Milestone: Triggers precisely on the 22nd balloon pop.
 * ============================================================================
 */

class SurprisesManager {
    constructor(config, effects) {
        this.config = config || {};
        this.effects = effects; // Audio, Confetti, Fireworks, Screen Flash

        this.egg1Timer = null;
        this.egg1Triggered = false;
        this.egg2Triggered = false;

        // Target milestone count (22 balloons)
        this.milestoneTarget = this.config.BALLOON_EASTER_EGG_COUNT || this.config.balloonMilestoneCount || 22;

        // Modal Elements
        this.modalTimed = document.getElementById("modal-timed-surprise");
        this.modalMilestone = document.getElementById("modal-milestone-surprise");

        this.initModals();
    }

    initModals() {
        // Populate modal contents from configuration
        const timedTitle = document.getElementById("timed-modal-title");
        const timedMessage = document.getElementById("timed-modal-message");
        const timedCloseBtn = document.getElementById("timed-modal-close-btn");

        const tTitle = this.config.EASTER_EGG_1_TITLE || this.config.firstSurpriseTitle || "A SPECIAL THOUGHT FOR YOU 💚";
        const tMsg = this.config.EASTER_EGG_1_MESSAGE || this.config.firstSurpriseMessage || "Some people make ordinary moments extraordinary. You're one of them. 💚";
        const tBtn = this.config.EASTER_EGG_1_BUTTON || this.config.firstSurpriseButtonText || "Keep Celebrating ✨";

        if (timedTitle) timedTitle.textContent = tTitle;
        if (timedMessage) timedMessage.textContent = tMsg;
        if (timedCloseBtn) {
            timedCloseBtn.textContent = tBtn;
            timedCloseBtn.addEventListener("click", () => this.closeTimedModal());
        }

        const milestoneTitle = document.getElementById("milestone-modal-title");
        const milestoneMessage = document.getElementById("milestone-modal-message");
        const milestoneImg = document.getElementById("milestone-modal-img");
        const milestoneCloseBtn = document.getElementById("milestone-modal-close-btn");

        const mTitle = this.config.EASTER_EGG_2_TITLE || this.config.secondSurpriseTitle || "22 BALLOONS MILESTONE! 🎉";
        const mMsg = this.config.EASTER_EGG_2_MESSAGE || this.config.secondSurpriseMessage || "Never stop being the wonderful person you are. 💚";
        const mImg = this.config.EASTER_EGG_2_IMAGE || this.config.surpriseImage || "assets/images/surprise.jpg";
        const mBtn = this.config.EASTER_EGG_2_BUTTON || this.config.secondSurpriseButtonText || "Thank You! ✨";

        if (milestoneTitle) milestoneTitle.textContent = mTitle;
        if (milestoneMessage) milestoneMessage.textContent = mMsg;
        if (milestoneImg) {
            milestoneImg.src = mImg;
            milestoneImg.alt = "Personal Surprise Memory";
            milestoneImg.onerror = () => {
                milestoneImg.onerror = null;
                milestoneImg.src = "assets/images/surprise.jpg";
            };
        }
        if (milestoneCloseBtn) {
            milestoneCloseBtn.textContent = mBtn;
            milestoneCloseBtn.addEventListener("click", () => this.closeMilestoneModal());
        }

        // Close when clicking modal backdrop
        [this.modalTimed, this.modalMilestone].forEach(modal => {
            if (!modal) return;
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Accessible Keyboard Escape to close modals
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeAllModals();
            }
        });
    }

    // --------------------------------------------------------------------------
    // Easter Egg #1: Timed Surprise (12s after entering Memories Screen)
    // --------------------------------------------------------------------------
    startTimedSurpriseTimer() {
        if (this.egg1Triggered) return;

        this.cancelTimedSurpriseTimer();
        const delay = this.config.EASTER_EGG_1_DELAY || 12000;
        this.egg1Timer = setTimeout(() => {
            this.triggerTimedSurprise();
        }, delay);
    }

    cancelTimedSurpriseTimer() {
        if (this.egg1Timer) {
            clearTimeout(this.egg1Timer);
            this.egg1Timer = null;
        }
    }

    triggerTimedSurprise() {
        if (this.egg1Triggered) return;
        this.egg1Triggered = true;
        this.cancelTimedSurpriseTimer();

        // Celebration Burst
        if (this.effects.confetti) this.effects.confetti.burstTriple();
        if (this.effects.fireworks) this.effects.fireworks.launchCelebrationSalvo(4);
        if (this.effects.audio) this.effects.audio.playSfx("surprise", 0.85);
        triggerScreenFlash();

        // Reveal Modal with smooth scale & fade
        if (this.modalTimed) {
            this.modalTimed.classList.remove("hidden");
            this.modalTimed.setAttribute("aria-hidden", "false");
            const card = this.modalTimed.querySelector(".modal-card");
            if (card) {
                card.classList.remove("modal-enter");
                void card.offsetWidth;
                card.classList.add("modal-enter");
            }
        }
    }

    closeTimedModal() {
        if (this.modalTimed) {
            this.closeModal(this.modalTimed);
        }
    }

    // --------------------------------------------------------------------------
    // Easter Egg #2: Balloon Milestone (Triggered on 22nd Balloon Pop)
    // --------------------------------------------------------------------------
    checkBalloonMilestone(popCount) {
        if (popCount === this.milestoneTarget && !this.egg2Triggered) {
            this.triggerBalloonMilestone();
        }
    }

    triggerBalloonMilestone() {
        if (this.egg2Triggered) return;
        this.egg2Triggered = true;

        // Big Celebratory Salvo
        if (this.effects.confetti) this.effects.confetti.burstTriple();
        if (this.effects.fireworks) this.effects.fireworks.launchCelebrationSalvo(6);
        if (this.effects.audio) this.effects.audio.playSfx("surprise", 0.9);
        triggerScreenFlash();

        // Reveal Modal with both image and message
        if (this.modalMilestone) {
            this.modalMilestone.classList.remove("hidden");
            this.modalMilestone.setAttribute("aria-hidden", "false");
            const card = this.modalMilestone.querySelector(".modal-card");
            if (card) {
                card.classList.remove("modal-enter");
                void card.offsetWidth;
                card.classList.add("modal-enter");
            }
        }
    }

    closeMilestoneModal() {
        if (this.modalMilestone) {
            this.closeModal(this.modalMilestone);
        }
    }

    closeModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.add("modal-exit");
        setTimeout(() => {
            modalEl.classList.add("hidden");
            modalEl.classList.remove("modal-exit");
            modalEl.setAttribute("aria-hidden", "true");
        }, 280);
    }

    closeAllModals() {
        this.closeTimedModal();
        this.closeMilestoneModal();
    }
}
