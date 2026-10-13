/**
 * ============================================================================
 * CONFIGURATION FORWARDER
 * ============================================================================
 * All configuration and personalization constants have been centralized in
 * js/constants.js for easy editing. This file ensures compatibility.
 * ============================================================================
 */

// If BirthdayConstants is already loaded, alias it; otherwise provide fallback
if (typeof BirthdayConstants === "undefined") {
    // Loaded independently
    console.info("Please load js/constants.js before or instead of js/config.js");
}
