/**
 * CookieKit Frontend JavaScript
 * This file handles the cookie consent UI and functionality
 */
(function () {
  "use strict";

  // Wait for DOM to be ready
  document.addEventListener("DOMContentLoaded", function () {
    // Get settings from the localized data
    const settings = window.cookiekitData || {};

    // Initialize the cookie consent UI
    initCookieConsent(settings);
  });

  /**
   * Initialize the cookie consent functionality
   * @param {object} settings - The settings from WordPress
   */
  function initCookieConsent(settings) {
    // Check if we already have consent stored
    const existingConsent = getCookie(
      settings.cookieName || "cookiekit_consent"
    );

    if (!existingConsent) {
      // No consent yet, display the UI
      createConsentUI(settings);
    } else {
      // We have a consent, apply it
      applyConsent(JSON.parse(existingConsent));
    }
  }

  /**
   * Create the consent UI based on settings
   * @param {object} settings - The settings from WordPress
   */
  function createConsentUI(settings) {
    // Implementation would go here
    console.log("CookieKit: Creating consent UI", settings);
  }

  /**
   * Apply the cookie consent selections
   * @param {object} consent - The consent object
   */
  function applyConsent(consent) {
    // Implementation would go here
    console.log("CookieKit: Applying consent", consent);
  }

  /**
   * Get a cookie by name
   * @param {string} name - The cookie name
   * @return {string|null} - The cookie value or null
   */
  function getCookie(name) {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
  }

  /**
   * Set a cookie
   * @param {string} name - The cookie name
   * @param {string} value - The cookie value
   * @param {number} days - Days until expiration
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
  }
})();
