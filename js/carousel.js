/**
 * ============================================================================
 * BIRTHDAY MEMORIES IMAGE CAROUSEL
 * ============================================================================
 * Manages the memory showcase gallery:
 * - Continuous smooth auto-rotation loop (every 2-3s)
 * - Automatic looping through all memory photos
 * - Clean presentation without manual arrow buttons
 * - Subtle dot indicators & touch swipe gesture support
 * ============================================================================
 */

class MemoriesCarousel {
    constructor(config) {
        // Resolve memories from constants or config
        const memoryList = (config && config.MEMORIES)
            ? config.MEMORIES
            : ((config && config.memories) ? config.memories : null);

        this.memories = (memoryList && memoryList.length > 0)
            ? memoryList
            : [
                { src: "assets/images/memory-1.jpg", title: "Joyful Moments", caption: "Smiles that light up the room 💫" },
                { src: "assets/images/memory-2.jpg", title: "Golden Memories", caption: "Every memory with you is golden 🌟" }
            ];

        this.currentIndex = 0;
        this.intervalMs = (config && config.CAROUSEL_INTERVAL) ? config.CAROUSEL_INTERVAL : 2500; // 2.5 seconds (2-3s)
        this.autoPlayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        // DOM elements
        this.container = document.getElementById("carousel-wrapper");
        this.imgCurrent = document.getElementById("carousel-img-current");
        this.captionTitle = document.getElementById("carousel-caption-title");
        this.captionText = document.getElementById("carousel-caption-text");
        this.dotsContainer = document.getElementById("carousel-dots");

        this.init();
    }

    init() {
        if (!this.container || !this.imgCurrent) return;

        // Render dot indicators
        if (this.dotsContainer) {
            this.dotsContainer.innerHTML = "";
            this.memories.forEach((_, idx) => {
                const dot = document.createElement("button");
                dot.className = `carousel-dot ${idx === 0 ? "active" : ""}`;
                dot.setAttribute("aria-label", `Slide ${idx + 1}`);
                dot.addEventListener("click", () => {
                    this.goTo(idx);
                });
                this.dotsContainer.appendChild(dot);
            });
        }

        // Mobile touch swipe gestures
        this.container.addEventListener("touchstart", (e) => {
            if (e.touches.length > 0) {
                this.touchStartX = e.touches[0].clientX;
                this.touchEndX = e.touches[0].clientX;
            }
        }, { passive: true });

        this.container.addEventListener("touchmove", (e) => {
            if (e.touches.length > 0) {
                this.touchEndX = e.touches[0].clientX;
            }
        }, { passive: true });

        this.container.addEventListener("touchend", () => {
            const diff = this.touchStartX - this.touchEndX;
            const threshold = 40;
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.next(); // Swiped left -> next slide
                } else {
                    this.prev(); // Swiped right -> prev slide
                }
            }
        });

        // Initial render
        this.renderSlide(0);
    }

    renderSlide(index) {
        if (index < 0 || index >= this.memories.length) return;
        this.currentIndex = index;
        const memory = this.memories[this.currentIndex];

        // Animate slide change
        if (this.imgCurrent) {
            this.imgCurrent.classList.remove("fade-in");
            void this.imgCurrent.offsetWidth; // Force reflow
            this.imgCurrent.src = memory.src;
            this.imgCurrent.alt = memory.title || "Birthday Memory";
            this.imgCurrent.classList.add("fade-in");

            // Handle broken image gracefully
            this.imgCurrent.onerror = () => {
                this.imgCurrent.onerror = null;
                this.imgCurrent.src = "assets/images/memory-1.jpg";
            };
        }

        if (this.captionTitle) {
            this.captionTitle.textContent = memory.title || `Memory #${index + 1}`;
        }
        if (this.captionText) {
            this.captionText.textContent = memory.caption || "";
        }

        // Update indicator dots
        if (this.dotsContainer) {
            const dots = this.dotsContainer.querySelectorAll(".carousel-dot");
            dots.forEach((dot, idx) => {
                if (idx === this.currentIndex) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        }
    }

    next() {
        const nextIndex = (this.currentIndex + 1) % this.memories.length;
        this.renderSlide(nextIndex);
    }

    prev() {
        const prevIndex = (this.currentIndex - 1 + this.memories.length) % this.memories.length;
        this.renderSlide(prevIndex);
    }

    goTo(index) {
        this.renderSlide(index);
    }

    start() {
        this.stop();
        this.autoPlayTimer = setInterval(() => {
            this.next();
        }, this.intervalMs);
    }

    pause() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    resume() {
        if (!this.autoPlayTimer) {
            this.start();
        }
    }

    stop() {
        this.pause();
    }
}
