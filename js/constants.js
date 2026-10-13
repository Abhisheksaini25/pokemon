/**
 * ============================================================================
 * BIRTHDAY CELEBRATION CONSTANTS & PERSONALIZATION
 * ============================================================================
 * Easily edit this file to customize all texts, greetings, easter egg messages,
 * timing, image paths, and audio files across the entire website.
 * ============================================================================
 */

const BirthdayConstants = {
    // --------------------------------------------------------------------------
    // 1. Recipient Details & Main Greetings
    // --------------------------------------------------------------------------
    NAME: "PRINCE",
    GREETING: "HAPPY BIRTHDAY",
    SUBTITLE: "ss",

    // --------------------------------------------------------------------------
    // 2. Screen 1 — Opening Screen
    // --------------------------------------------------------------------------
    OPEN_PROMPT: "-_-",
    OPEN_BUTTON_TEXT: "OPEN ✦",
    OPEN_SUBTEXT: "Tap to open app",

    // --------------------------------------------------------------------------
    // 3. Screen 2 — Greeting Reveal Screen
    // --------------------------------------------------------------------------
    CELEBRATE_BUTTON_TEXT: "CONTINUE ✦",

    // --------------------------------------------------------------------------
    // 4. Screen 3 — Cake & Candle Screen
    // --------------------------------------------------------------------------
    CAKE_INSTRUCTION: "Tap the cake to blow out the candle.",
    CAKE_WISH_MESSAGE: "OHH no Candle is blown out 🌟",
    CAKE_IMAGE: "assets/images/cake.png",
    CAKE_AUTO_TRANSITION_DELAY: 2600, // 2.6 seconds (2-3s) after blow to auto-transition to memories

    // --------------------------------------------------------------------------
    // 5. Screen 4 — Memories Image Carousel
    // --------------------------------------------------------------------------
    MEMORIES_TITLE: "Some Random Photos",
    MEMORIES_SUBTITLE: "",
    CAROUSEL_INTERVAL: 4000, // Automatically changes every 2.5 seconds (2-3s loop)
    MEMORIES: [
        {
            src: "assets/images/memory-1.jpg",
            title: "Insta ki DP",
            caption: ""
        },
        {
            src: "assets/images/memory-2.jpg",
            title: "LinkedIn ki Dp",
            caption: ""
        }
    ],

    // --------------------------------------------------------------------------
    // 6. Easter Egg #1: Timed Surprise (12s on Carousel Screen)
    // --------------------------------------------------------------------------
    EASTER_EGG_1_DELAY: 12000, // 12 seconds after entering memories carousel
    EASTER_EGG_1_TITLE: "Happy Birthday Once more!",
    EASTER_EGG_1_MESSAGE: "Waiting can be considered a gift in itself - some wuwa character, 2025",
    EASTER_EGG_1_BUTTON: "Continue ✨",

    // --------------------------------------------------------------------------
    // 7. Easter Egg #2: Balloon Milestone Popup (Triggered on 22nd Balloon Pop)
    // --------------------------------------------------------------------------
    BALLOON_EASTER_EGG_COUNT: 22, // Triggers at exactly 22 balloon pops
    EASTER_EGG_2_TITLE: "MILESTONE UNLOCKED: 22 BALLOONS! 🎈",
    EASTER_EGG_2_MESSAGE: "the only random photo, jo mere pas thi aur sorry yr me bhul gya tha tera birthday, siliye mene 7 ko wish kiya tha, so i can know the actual date",
    EASTER_EGG_2_IMAGE: "assets/images/surprise.jpg",
    EASTER_EGG_2_BUTTON: "Close",

    // --------------------------------------------------------------------------
    // 8. Voice Audio Milestones (18th and 19th Balloon Pops)
    // --------------------------------------------------------------------------
    BALLOON_EIGHTTEEN_COUNT: 18, // Plays eightteen.mp3
    BALLOON_NINETEEN_COUNT: 19,  // Plays nineteen.mp3

    // --------------------------------------------------------------------------
    // 9. Media Audio Paths
    // --------------------------------------------------------------------------
    AUDIO: {
        bgMusic: "assets/audio/birthday-music.mp3",
        balloonPop: "assets/audio/balloon-pop.mp3",
        candleBlow: "assets/audio/candle-blow.mp3",
        eightteen: "assets/audio/eightteen.mp3",
        nineteen: "assets/audio/nineteen.mp3",
        surprise: "assets/audio/surprise.mp3"
    }
};

// Backwards compatibility alias
const birthdayConfig = {
    name: BirthdayConstants.NAME,
    greeting: BirthdayConstants.GREETING,
    subtitle: BirthdayConstants.SUBTITLE,
    openPrompt: BirthdayConstants.OPEN_PROMPT,
    openButtonText: BirthdayConstants.OPEN_BUTTON_TEXT,
    openSubtext: BirthdayConstants.OPEN_SUBTEXT,
    celebrateButtonText: BirthdayConstants.CELEBRATE_BUTTON_TEXT,
    cakeInstruction: BirthdayConstants.CAKE_INSTRUCTION,
    cakeWishMessage: BirthdayConstants.CAKE_WISH_MESSAGE,
    cakeImage: BirthdayConstants.CAKE_IMAGE,
    cakeAutoTransitionDelay: BirthdayConstants.CAKE_AUTO_TRANSITION_DELAY,
    memoriesHeader: BirthdayConstants.MEMORIES_TITLE,
    memoriesSubtitle: BirthdayConstants.MEMORIES_SUBTITLE,
    carouselInterval: BirthdayConstants.CAROUSEL_INTERVAL,
    memories: BirthdayConstants.MEMORIES,
    firstSurpriseTitle: BirthdayConstants.EASTER_EGG_1_TITLE,
    firstSurpriseMessage: BirthdayConstants.EASTER_EGG_1_MESSAGE,
    firstSurpriseButtonText: BirthdayConstants.EASTER_EGG_1_BUTTON,
    balloonMilestoneCount: BirthdayConstants.BALLOON_EASTER_EGG_COUNT,
    secondSurpriseTitle: BirthdayConstants.EASTER_EGG_2_TITLE,
    secondSurpriseMessage: BirthdayConstants.EASTER_EGG_2_MESSAGE,
    surpriseImage: BirthdayConstants.EASTER_EGG_2_IMAGE,
    secondSurpriseButtonText: BirthdayConstants.EASTER_EGG_2_BUTTON,
    audio: BirthdayConstants.AUDIO
};

if (typeof Object.freeze === "function") {
    Object.freeze(BirthdayConstants);
    Object.freeze(birthdayConfig);
}
