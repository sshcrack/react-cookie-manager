import {
  blockTrackingRequests,
  restoreOriginalRequests,
} from "./request-blocker";
import {
  blockTrackingScripts,
  ensurePlaceholdersVisible,
  createContentPlaceholder,
} from "./content-blocker";

/**
 * Main cookie blocking manager that handles all aspects of cookie blocking
 */
export class CookieBlockingManager {
  private observerRef: MutationObserver | null = null;
  private intervalId: number | null = null;

  /**
   * Initializes cookie blocking based on user preferences
   * @param blockedHosts Array of hosts to block
   * @param blockedKeywords Array of keywords to block in scripts and iframes
   */
  public initialize(blockedHosts: string[], blockedKeywords: string[]): void {
    // Block network requests
    if (blockedHosts.length > 0) {
      blockTrackingRequests(blockedHosts);
    }

    // Block scripts and iframes
    if (blockedKeywords.length > 0) {
      this.observerRef = blockTrackingScripts(blockedKeywords);

      // Set up periodic check to ensure placeholders remain visible
      this.startPlaceholderVisibilityCheck();
    }
  }

  /**
   * Starts a periodic check to ensure placeholders remain visible
   */
  private startPlaceholderVisibilityCheck(): void {
    // Run the check immediately
    ensurePlaceholdersVisible();

    // Then set up an interval
    this.intervalId = window.setInterval(ensurePlaceholdersVisible, 2000);
  }

  /**
   * Cleans up all cookie blocking functionality
   */
  public cleanup(): void {
    // Restore original request functions
    restoreOriginalRequests();

    // Disconnect observer
    if (this.observerRef) {
      this.observerRef.disconnect();
      this.observerRef = null;
    }

    // Clear interval
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Export individual functions for direct use
export {
  blockTrackingRequests,
  restoreOriginalRequests,
  blockTrackingScripts,
  ensurePlaceholdersVisible,
  createContentPlaceholder,
};
