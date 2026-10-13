# Interactive Birthday Wishing Experience 🎂✨

A modern, cinematic, single-page interactive birthday wishing web experience crafted with **HTML5, CSS3, Vanilla JavaScript, HTMX, Canvas API, and GSAP**.

Designed around an elegant **obsidian black and soft emerald theme** (`#020503`, `#10b981`, `#6ee7b7`), featuring continuous floating poppable 3D balloons in 100% green shades, physics-based fireworks, celebratory confetti salvos, interactive candle extinguishing with automatic transition, and hidden voice & easter egg milestones.

---

## 🌟 Key Features & Updates

1. **Screen 1 — Opening Screen**:
   - Atmospheric midnight obsidian glow and twinkling cosmic stars.
   - Central magnetic glowing `OPEN ✦` button.
   - Starts background music smoothly upon user tap.
   - Triggers celebratory confetti burst and soft screen flash.

2. **Screen 2 — Birthday Greeting Reveal**:
   - Cinematic typography with GSAP reveal: `HAPPY BIRTHDAY`, followed by an illuminated glow reveal of the recipient's name (from `constants.js`).
   - Confetti bursts from left, right, and top edges.
   - Tap `LET'S CELEBRATE ✦` to transition to the cake stage.

3. **Screen 3 — Birthday Cake & Candle Blowing**:
   - Uses `assets/images/cake.png` with its attached candle.
   - Realistic organic Canvas flame anchored directly atop the candle wick.
   - Tap/click the cake:
     1. Extinguishes flame and spawns rising realistic smoke particles.
     2. Plays candle-blowing audio.
     3. Fires celebratory confetti and enhanced fireworks salvo.
     4. Displays *"Your wish is on its way to the stars! 🌟"*.
     5. **Automatically transitions to the Memories Carousel after 2.5 seconds** (no button needed!).

4. **Screen 4 — Birthday Memories Image Carousel**:
   - High-end glassmorphism Polaroid photo frame.
   - **Automatically loops through memories every 2.5 seconds** without manual arrow buttons.
   - Smooth photo transitions and dot indicators.

5. **Easter Egg #1 — Timed Surprise Popup**:
   - Triggers precisely **12 seconds** after entering the Memories Screen.
   - Displays a special glassmorphism card with a personalized message.
   - Triggered at most once per visit; automatically cancelled if the user navigates away before 12 seconds.

6. **Balloon Pop Voice & Easter Egg Milestones (100% Green Balloons)**:
   - Floating 3D glossy balloons in emerald, neon green, soft mint, dark forest, lime, and jade continuously float upward.
   - **18th Balloon Pop**: Automatically plays `assets/audio/eightteen.mp3` with ducked background music.
   - **19th Balloon Pop**: Automatically plays `assets/audio/nineteen.mp3` with ducked background music.
   - **22nd Balloon Pop**: Triggers **Easter Egg #2** with a celebratory popup containing both the surprise image (`assets/images/surprise.jpg`) and a personalized message.

7. **Clean Minimalist Viewport**:
   - Floating balloon pop counter and music toggle button have been removed for an uncluttered, immersive experience.
   - Music begins automatically upon tapping `OPEN ✦`.

---

## 🎨 How to Personalize (`js/constants.js`)

All customization is centralized in [js/constants.js](file:///d:/GemProjs/princehbd/js/constants.js). You can easily change:

```javascript
const BirthdayConstants = {
    // 1. Recipient Details & Greetings
    NAME: "PRINCE",
    GREETING: "HAPPY BIRTHDAY",
    SUBTITLE: "Today is all about celebrating the wonderful person you are.",

    // 2. Screen 1
    OPEN_PROMPT: "A little surprise awaits you...",
    OPEN_BUTTON_TEXT: "OPEN ✦",
    OPEN_SUBTEXT: "Tap to begin the celebration",

    // 3. Screen 3 Cake
    CAKE_INSTRUCTION: "Make a wish and tap the cake to blow out the candle.",
    CAKE_WISH_MESSAGE: "Your wish is on its way to the stars! 🌟",
    CAKE_IMAGE: "assets/images/cake.png",
    CAKE_AUTO_TRANSITION_DELAY: 2600, // ms to auto-advance to memories

    // 4. Screen 4 Memories Carousel
    MEMORIES_TITLE: "LITTLE MOMENTS, BIG MEMORIES",
    MEMORIES_SUBTITLE: "Every memory with you is a treasure to keep.",
    CAROUSEL_INTERVAL: 2500, // 2.5s auto loop
    MEMORIES: [
        {
            src: "assets/images/memory-1.jpg",
            title: "Pure Joy & Celebrations",
            caption: "Unforgettable laughter, adventures, and bright smiles 💫"
        },
        {
            src: "assets/images/memory-2.jpg",
            title: "Golden Moments",
            caption: "Here is to chasing every dream and making magic happen 🌟"
        }
    ],

    // 5. Easter Egg #1 (Timed 12s on Carousel)
    EASTER_EGG_1_TITLE: "A SPECIAL THOUGHT FOR YOU 💚",
    EASTER_EGG_1_MESSAGE: "Some people make ordinary moments extraordinary. You're one of them. 💚",

    // 6. Easter Egg #2 (22nd Balloon Pop Milestone)
    BALLOON_EASTER_EGG_COUNT: 22,
    EASTER_EGG_2_TITLE: "MILESTONE UNLOCKED: 22 BALLOONS! 🎈",
    EASTER_EGG_2_MESSAGE: "Here's a little reminder of how special you are. Never stop being the wonderful person you are. 💚",
    EASTER_EGG_2_IMAGE: "assets/images/surprise.jpg",

    // 7. Voice Audio Milestones
    BALLOON_EIGHTTEEN_COUNT: 18, // plays eightteen.mp3
    BALLOON_NINETEEN_COUNT: 19   // plays nineteen.mp3
};
```

---

## 🚀 How to Run the Website

Run a lightweight local HTTP server:

```powershell
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your web browser.
