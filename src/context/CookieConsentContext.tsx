import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import CookieConsenter from "../components/CookieConsenter";
import { FloatingCookieButton } from "../components/FloatingCookieButton";
import type {
  CookieCategories,
  CookieConsenterProps,
  DetailedCookieConsent,
  TranslationObject,
  TranslationFunction,
} from "../types/types";
import { ManageConsent } from "../components/ManageConsent";
import { getBlockedHosts, getBlockedKeywords } from "../utils/tracker-utils";
import { createTFunction } from "../utils/translations";
import { timezoneToCountryCodeMap } from "../utils/timeZoneMap";

// Cookie utility functions
const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Store original functions
let originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
let originalFetch: typeof window.fetch | null = null;

const blockTrackingRequests = (blockedHosts: string[]) => {
  // Store original functions if not already stored
  if (!originalXhrOpen) {
    originalXhrOpen = XMLHttpRequest.prototype.open;
  }
  if (!originalFetch) {
    originalFetch = window.fetch;
  }

  // Override XMLHttpRequest to block requests to tracking domains
  XMLHttpRequest.prototype.open = function (method: string, url: string | URL) {
    const urlString = url.toString();
    if (blockedHosts.some((host) => urlString.includes(host))) {
      console.debug(`[CookieKit] Blocked XMLHttpRequest to: ${urlString}`);
      throw new Error(`Request to ${urlString} blocked by consent settings`);
    }
    return originalXhrOpen!.apply(this, arguments as any);
  };

  // Override fetch API to block tracking requests
  window.fetch = function (url: RequestInfo | URL, options?: RequestInit) {
    const urlString = url.toString();
    if (
      typeof urlString === "string" &&
      blockedHosts.some((host) => urlString.includes(host))
    ) {
      console.debug(`[CookieKit] Blocked fetch request to: ${urlString}`);
      return Promise.resolve(
        new Response(null, {
          status: 403,
          statusText: "Blocked by consent settings",
        })
      );
    }
    return originalFetch!.apply(this, arguments as any);
  };
};

const blockTrackingScripts = (trackingKeywords: string[]) => {
  // Remove all script tags that match tracking domains
  document.querySelectorAll("script").forEach((script) => {
    if (
      script.src &&
      trackingKeywords.some((keyword) => script.src.includes(keyword))
    ) {
      console.debug(`[CookieKit] Removing script: ${script.src}`);
      script.remove();
    }
  });

  // Also block iframes from tracking domains (especially for YouTube embeds)
  document.querySelectorAll("iframe").forEach((iframe) => {
    if (
      iframe.src &&
      trackingKeywords.some((keyword) => iframe.src.includes(keyword))
    ) {
      console.debug(`[CookieKit] Blocking iframe: ${iframe.src}`);

      // Create a unique ID for the placeholder
      const placeholderId = `cookie-blocked-content-${Math.random()
        .toString(36)
        .substring(2, 11)}`;

      // Get iframe dimensions and position
      const rect = iframe.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(iframe);

      // Get the iframe's parent element
      const parentElement = iframe.parentElement;
      if (!parentElement) return;

      // Make the iframe invisible but keep it in place
      iframe.style.opacity = "0";
      iframe.style.pointerEvents = "none";
      iframe.setAttribute("data-cookie-blocked", "true");

      // Set a blank src to prevent loading
      const originalSrc = iframe.src;
      iframe.setAttribute("data-original-src", originalSrc);
      iframe.src = "about:blank";

      // Create a wrapper div with position relative
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.width = computedStyle.width;
      wrapper.style.height = computedStyle.height;
      wrapper.style.display = "inline-block";
      wrapper.style.backgroundColor = "rgba(31, 41, 55, 0.95)";
      wrapper.style.borderRadius = "8px";
      wrapper.style.border = "2px solid #4b5563";
      wrapper.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
      wrapper.style.overflow = "hidden";
      wrapper.style.backdropFilter = "blur(4px)";

      // Create the placeholder
      const placeholder = document.createElement("div");
      placeholder.id = placeholderId;
      placeholder.className = "cookie-consent-blocked-iframe";
      placeholder.setAttribute("data-cookie-consent-placeholder", "true");
      placeholder.setAttribute("data-blocked-src", originalSrc);

      // Position the placeholder absolutely to cover the iframe exactly
      placeholder.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      `;

      // Create content with more information
      const contentDiv = document.createElement("div");
      contentDiv.className = "cookie-consent-blocked-content";
      contentDiv.style.cssText = `
        text-align: center;
        padding: 24px;
        color: #f3f4f6;
        font-size: 15px;
        line-height: 1.6;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        max-width: 90%;
      `;

      // Add an icon or visual indicator
      const iconDiv = document.createElement("div");
      iconDiv.style.cssText = `
        margin-bottom: 16px;
        font-size: 32px;
      `;
      iconDiv.innerHTML = "🔒"; // Lock emoji as a simple visual indicator

      // Add message with more context
      const messageDiv = document.createElement("div");
      messageDiv.innerHTML = `
        <h3 style="font-size: 18px; margin-bottom: 10px; font-weight: bold; color: white;">Content Blocked</h3>
        <p style="margin-bottom: 12px;">This content requires cookies that are currently blocked by your privacy settings.</p>
        <p style="margin-bottom: 12px;">This embedded content from an external provider may track your activity or store cookies on your device.</p>
        <p style="margin-bottom: 12px;">To view this content, please update your cookie preferences using the button below.</p>
      `;

      // Add a button to manage cookies
      const buttonDiv = document.createElement("div");
      buttonDiv.style.cssText = `
        margin-top: 16px;
      `;
      const settingsButton = document.createElement("button");
      settingsButton.textContent = "Manage Cookie Settings";
      settingsButton.style.cssText = `
        background-color: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      `;
      settingsButton.addEventListener("mouseover", () => {
        settingsButton.style.backgroundColor = "#2563eb";
      });
      settingsButton.addEventListener("mouseout", () => {
        settingsButton.style.backgroundColor = "#3b82f6";
      });
      settingsButton.addEventListener("click", () => {
        // Try to show cookie settings
        window.dispatchEvent(new CustomEvent("show-cookie-consent"));
      });
      buttonDiv.appendChild(settingsButton);

      // Assemble the placeholder
      contentDiv.appendChild(iconDiv);
      contentDiv.appendChild(messageDiv);
      contentDiv.appendChild(buttonDiv);
      placeholder.appendChild(contentDiv);

      // Insert the wrapper right before the iframe
      parentElement.insertBefore(wrapper, iframe);

      // Move the iframe inside the wrapper
      wrapper.appendChild(iframe);

      // Add the placeholder to the wrapper
      wrapper.appendChild(placeholder);

      console.debug(
        `[CookieKit] Added overlay placeholder ID: ${placeholderId}`
      );
    }
  });

  // Prevent new tracking scripts and iframes from being injected
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        // Handle script tags
        if (node instanceof HTMLElement && node.tagName === "SCRIPT") {
          const src = node.getAttribute("src");
          if (
            src &&
            trackingKeywords.some((keyword) => src.includes(keyword))
          ) {
            console.debug(`[CookieKit] Blocking injected script: ${src}`);
            node.remove();
          }
        }

        // Handle iframe tags (especially YouTube)
        if (node instanceof HTMLElement && node.tagName === "IFRAME") {
          const src = node.getAttribute("src");
          if (
            src &&
            trackingKeywords.some((keyword) => src.includes(keyword))
          ) {
            console.debug(`[CookieKit] Blocking injected iframe: ${src}`);

            // Create a unique ID for the placeholder
            const placeholderId = `cookie-blocked-content-${Math.random()
              .toString(36)
              .substring(2, 11)}`;

            // Get the iframe's parent element
            const parentElement = node.parentElement;
            if (!parentElement) return;

            // Cast node to HTMLIFrameElement to access iframe-specific properties
            const iframeElement = node as HTMLIFrameElement;

            // Make the iframe invisible but keep it in place
            iframeElement.style.opacity = "0";
            iframeElement.style.pointerEvents = "none";
            iframeElement.setAttribute("data-cookie-blocked", "true");

            // Set a blank src to prevent loading
            const originalSrc = src;
            iframeElement.setAttribute("data-original-src", originalSrc);
            iframeElement.src = "about:blank";

            // Create a wrapper div with position relative
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.style.width = iframeElement.style.width || "100%";
            wrapper.style.height = iframeElement.style.height || "315px";
            wrapper.style.display = "inline-block";
            wrapper.style.backgroundColor = "rgba(31, 41, 55, 0.95)";
            wrapper.style.borderRadius = "8px";
            wrapper.style.border = "2px solid #4b5563";
            wrapper.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
            wrapper.style.overflow = "hidden";
            wrapper.style.backdropFilter = "blur(4px)";

            // Create the placeholder
            const placeholder = document.createElement("div");
            placeholder.id = placeholderId;
            placeholder.className = "cookie-consent-blocked-iframe";
            placeholder.setAttribute("data-cookie-consent-placeholder", "true");
            placeholder.setAttribute("data-blocked-src", originalSrc);

            // Position the placeholder absolutely to cover the iframe exactly
            placeholder.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              min-height: 200px;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 100;
            `;

            // Create content with more information
            const contentDiv = document.createElement("div");
            contentDiv.className = "cookie-consent-blocked-content";
            contentDiv.style.cssText = `
              text-align: center;
              padding: 24px;
              color: #f3f4f6;
              font-size: 15px;
              line-height: 1.6;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              max-width: 90%;
            `;

            // Add an icon or visual indicator
            const iconDiv = document.createElement("div");
            iconDiv.style.cssText = `
              margin-bottom: 16px;
              font-size: 32px;
            `;
            iconDiv.innerHTML = "🔒"; // Lock emoji as a simple visual indicator

            // Add message with more context
            const messageDiv = document.createElement("div");
            messageDiv.innerHTML = `
              <h3 style="font-size: 18px; margin-bottom: 10px; font-weight: bold; color: white;">Content Blocked</h3>
              <p style="margin-bottom: 12px;">This content requires cookies that are currently blocked by your privacy settings.</p>
              <p style="margin-bottom: 12px;">This embedded content from an external provider may track your activity or store cookies on your device.</p>
              <p style="margin-bottom: 12px;">To view this content, please update your cookie preferences using the button below.</p>
            `;

            // Add a button to manage cookies
            const buttonDiv = document.createElement("div");
            buttonDiv.style.cssText = `
              margin-top: 16px;
            `;
            const settingsButton = document.createElement("button");
            settingsButton.textContent = "Manage Cookie Settings";
            settingsButton.style.cssText = `
              background-color: #3b82f6;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              font-weight: 500;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s ease;
            `;
            settingsButton.addEventListener("mouseover", () => {
              settingsButton.style.backgroundColor = "#2563eb";
            });
            settingsButton.addEventListener("mouseout", () => {
              settingsButton.style.backgroundColor = "#3b82f6";
            });
            settingsButton.addEventListener("click", () => {
              // Try to show cookie settings
              window.dispatchEvent(new CustomEvent("show-cookie-consent"));
            });
            buttonDiv.appendChild(settingsButton);

            // Assemble the placeholder
            contentDiv.appendChild(iconDiv);
            contentDiv.appendChild(messageDiv);
            contentDiv.appendChild(buttonDiv);
            placeholder.appendChild(contentDiv);

            // Insert the wrapper right before the iframe
            parentElement.insertBefore(wrapper, node);

            // Move the iframe inside the wrapper
            wrapper.appendChild(node);

            // Add the placeholder to the wrapper
            wrapper.appendChild(placeholder);

            console.debug(
              `[CookieKit] Added overlay placeholder ID: ${placeholderId}`
            );
          }
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  return observer;
};

const restoreOriginalRequests = () => {
  if (originalXhrOpen) {
    XMLHttpRequest.prototype.open = originalXhrOpen;
  }
  if (originalFetch) {
    window.fetch = originalFetch;
  }
};

// Session ID generation utilities
const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const generateUniqueId = async (): Promise<string> => {
  // Get high-precision timestamp
  const timestamp = performance.now().toString();

  // Generate random values using crypto API if available
  let randomValues = "";
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    randomValues = Array.from(array)
      .map((n) => n.toString(36))
      .join("");
  } else {
    randomValues = Math.random().toString(36).substring(2);
  }

  // Get some browser-specific info without being too invasive
  const browserInfo = [
    window.screen.width,
    window.screen.height,
    navigator.language,
    // Use hash of user agent to add entropy without storing the full string
    await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(navigator.userAgent))
      .then((buf) =>
        Array.from(new Uint8Array(buf))
          .slice(0, 4)
          .map((b) => b.toString(16))
          .join("")
      ),
  ].join("_");

  // Combine all sources of entropy
  const combinedString = `${timestamp}_${randomValues}_${browserInfo}`;

  // Hash the combined string for privacy
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(combinedString)
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex.slice(0, 16); // Return first 16 characters of hash
};

const generateSessionId = async (kitId: string): Promise<string> => {
  const timestamp = new Date().getTime();
  const uniqueId = await generateUniqueId();
  const randomPart = generateRandomString(8);
  return `${kitId}_${timestamp}_${uniqueId}_${randomPart}`;
};

const resolveCountryFromTimezone = (timeZone: string): string => {
  const entry = timezoneToCountryCodeMap[timeZone]?.a
    ? timezoneToCountryCodeMap[timezoneToCountryCodeMap[timeZone].a]
    : timezoneToCountryCodeMap[timeZone];

  return entry?.c?.[0] ?? "Unknown";
};

const postSessionToAnalytics = async (
  kitId: string,
  sessionId: string,
  action?: string,
  preferences?: CookieCategories,
  userId?: string
) => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = resolveCountryFromTimezone(timeZone);
    const domain = window.location.hostname;

    const response = await fetch("https://cookiekit.io/api/consents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        website_id: kitId,
        session_id: sessionId,
        user_id: userId,
        analytics: preferences?.Analytics ?? false,
        social: preferences?.Social ?? false,
        advertising: preferences?.Advertising ?? false,
        consent_method: action || "init",
        consent_version: "1.0",
        user_agent: navigator.userAgent,
        location: country,
        anonymised_ip: "0.0.0.0",
        domain: domain,
      }),
    });

    if (!response.ok) {
      console.warn("Failed to post consent to analytics:", response.statusText);
    }
  } catch (error) {
    console.warn("Error posting consent to analytics:", error);
  }
};

interface CookieConsentContextValue {
  hasConsent: boolean | null;
  isDeclined: boolean;
  detailedConsent: DetailedCookieConsent | null;
  showConsentBanner: () => void;
  acceptCookies: () => void;
  declineCookies: () => void;
  updateDetailedConsent: (preferences: CookieCategories) => void;
}

const CookieManagerContext = createContext<CookieConsentContextValue | null>(
  null
);

export interface CookieManagerProps
  extends Omit<CookieConsenterProps, "onAccept" | "onDecline" | "forceShow"> {
  children: React.ReactNode;
  cookieKey?: string;
  cookieKitId?: string;
  userId?: string;
  onManage?: (preferences?: CookieCategories) => void;
  disableAutomaticBlocking?: boolean;
  blockedDomains?: string[];
  expirationDays?: number;
  /**
   * Translations that will be used in the consent UI. It can be one of:
   * 1. **TranslationObject**: An object with keys for each TranslationKey, e.g.:
   *    ```
   *    {
   *      title: 'My own consent title',
   *      message: 'My own consent message',
   *      // other keys if needed
   *    }
   *    ```
   * 2. **TranslationFunction**: A function that takes a key with params and returns a string. Useful for i18n libraries where TFunction can be passed like follows:
   *    ```ts
   *    const { t } = useTranslation();
   *    return <CookieConsenter translations={t} />
   *    ```
   *
   * By default it uses English translations specified in TranslationKey defaults.
   */
  translations?: TranslationObject | TranslationFunction<any, any>;
  /**
   * Prefix for translation keys when using i18next, e.g.
   * ```ts
   * // typescript file
   * const { t } = useTranslation();
   * <CookieConsenter translations={t} translationI18NextPrefix="cookieConsent" />
   * ```
   * ```json
   * // {lng}.json
   * {
   *  "cookieConsent": {
   *    "title": "My own consent title",
   *    "message": "My own consent message"
   *  }
   * }
   * ```
   */
  translationI18NextPrefix?: string;
  enableFloatingButton?: boolean;
  theme?: "light" | "dark";
}

const createConsentStatus = (consented: boolean) => ({
  consented,
  timestamp: new Date().toISOString(),
});

const createDetailedConsent = (consented: boolean): DetailedCookieConsent => ({
  Analytics: createConsentStatus(consented),
  Social: createConsentStatus(consented),
  Advertising: createConsentStatus(consented),
});

export const CookieManager: React.FC<CookieManagerProps> = ({
  children,
  cookieKey = "cookie-consent",
  cookieKitId,
  userId,
  translations,
  translationI18NextPrefix,
  onManage,
  disableAutomaticBlocking = false,
  blockedDomains = [],
  expirationDays = 365,
  enableFloatingButton = false,
  theme = "light",
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showManageConsent, setShowManageConsent] = useState(false);
  const [isFloatingButtonVisible, setIsFloatingButtonVisible] = useState(false);
  const hasPostedSession = useRef(false);
  const isGeneratingSession = useRef(false);
  const tFunction = useMemo(
    () => createTFunction(translations, translationI18NextPrefix),
    [translations, translationI18NextPrefix]
  );

  const [detailedConsent, setDetailedConsent] =
    useState<DetailedCookieConsent | null>(() => {
      const storedConsent = getCookie(cookieKey);
      if (storedConsent) {
        try {
          const parsedConsent = JSON.parse(
            storedConsent
          ) as DetailedCookieConsent;

          // Check if consent has expired
          const oldestTimestamp = Math.min(
            ...Object.values(parsedConsent).map((status) =>
              new Date(status.timestamp).getTime()
            )
          );

          const expirationTime =
            oldestTimestamp + expirationDays * 24 * 60 * 60 * 1000;

          if (Date.now() > expirationTime) {
            deleteCookie(cookieKey);
            return null;
          }

          return parsedConsent;
        } catch (e) {
          return null;
        }
      }
      return null;
    });

  const hasConsent = detailedConsent
    ? Object.values(detailedConsent).some((status) => status.consented)
    : null;

  const observerRef = useRef<MutationObserver | null>(null);

  // Initialize session ID if cookieKitId is provided
  useEffect(() => {
    let isMounted = true;
    let isInitializing = false;

    const initializeSessionId = async () => {
      if (!cookieKitId || isInitializing) return;

      isInitializing = true;
      const sessionKey = `${cookieKey}-session`;
      let sessionId = getCookie(sessionKey);

      if (!sessionId) {
        try {
          sessionId = await generateSessionId(cookieKitId);
          if (!isMounted) return;
          setCookie(sessionKey, sessionId, 1);
          const savedSessionId = getCookie(sessionKey);
          if (savedSessionId && isMounted) {
            await postSessionToAnalytics(
              cookieKitId,
              sessionId,
              undefined,
              undefined,
              userId
            );
          }
        } catch (error) {
          console.error("Error in session initialization:", error);
        }
      } else {
      }
    };

    initializeSessionId();

    return () => {
      isMounted = false;
      isInitializing = false;
    };
  }, [cookieKitId, cookieKey, userId]);

  useEffect(() => {
    // Show banner if no consent decision has been made AND manage consent is not shown
    if (detailedConsent === null && !showManageConsent) {
      setIsVisible(true);
    }

    // Handle tracking blocking
    if (!disableAutomaticBlocking) {
      // Get current preferences
      const currentPreferences = detailedConsent
        ? {
            Analytics: detailedConsent.Analytics.consented,
            Social: detailedConsent.Social.consented,
            Advertising: detailedConsent.Advertising.consented,
          }
        : null;

      // Get blocked hosts and keywords based on preferences
      const blockedHosts = [
        ...getBlockedHosts(currentPreferences),
        ...blockedDomains,
      ];

      const blockedKeywords = [
        ...getBlockedKeywords(currentPreferences),
        ...blockedDomains,
      ];

      if (blockedHosts.length > 0) {
        console.debug(
          "[CookieKit] Blocking tracking requests for domains:",
          blockedHosts
        );
        blockTrackingRequests(blockedHosts);

        // Only create a new observer if one doesn't exist already
        // This ensures placeholders remain when consent changes
        if (!observerRef.current) {
          console.debug(
            "[CookieKit] Creating new MutationObserver for tracking scripts"
          );
          observerRef.current = blockTrackingScripts(blockedKeywords);

          // Add a periodic check to ensure placeholders remain visible
          const ensurePlaceholdersVisible = () => {
            const placeholders = document.querySelectorAll(
              '[data-cookie-consent-placeholder="true"]'
            );
            if (placeholders.length > 0) {
              console.debug(
                `[CookieKit] Ensuring ${placeholders.length} placeholders remain visible`
              );
              placeholders.forEach((placeholder) => {
                // Make sure the placeholder is visible
                if (placeholder instanceof HTMLElement) {
                  placeholder.style.display = "flex";
                  placeholder.style.visibility = "visible";
                  placeholder.style.opacity = "1";
                  placeholder.style.zIndex = "100";

                  // Find the parent wrapper
                  const wrapper = placeholder.parentElement;
                  if (wrapper) {
                    // Make sure the wrapper is properly positioned
                    wrapper.style.position = "relative";
                    wrapper.style.display = "inline-block";
                    wrapper.style.backgroundColor = "rgba(31, 41, 55, 0.95)";
                    wrapper.style.borderRadius = "8px";
                    wrapper.style.border = "2px solid #4b5563";
                    wrapper.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
                    wrapper.style.overflow = "hidden";
                    wrapper.style.backdropFilter = "blur(4px)";

                    // Find the iframe inside the wrapper
                    const iframe = wrapper.querySelector("iframe");
                    if (iframe) {
                      // Make sure the iframe is invisible
                      iframe.style.opacity = "0";
                      iframe.style.pointerEvents = "none";

                      // Make sure it's still using about:blank
                      if (
                        iframe.src !== "about:blank" &&
                        iframe.hasAttribute("data-original-src")
                      ) {
                        iframe.src = "about:blank";
                      }
                    }
                  }

                  // If the placeholder is not in the DOM, try to restore it
                  if (!document.body.contains(placeholder)) {
                    console.debug(
                      "[CookieKit] Placeholder was removed, attempting to restore it"
                    );

                    // Try to find the original iframe by the blocked src
                    const blockedSrc =
                      placeholder.getAttribute("data-blocked-src");
                    if (blockedSrc) {
                      // Look for iframes that might need blocking
                      document.querySelectorAll("iframe").forEach((iframe) => {
                        if (
                          iframe.src === blockedSrc ||
                          iframe.getAttribute("data-original-src") ===
                            blockedSrc
                        ) {
                          console.debug(
                            `[CookieKit] Found iframe to re-block: ${blockedSrc}`
                          );

                          // Get the iframe's parent
                          const parentElement = iframe.parentElement;
                          if (parentElement) {
                            // Create a new wrapper
                            const wrapper = document.createElement("div");
                            wrapper.style.position = "relative";
                            wrapper.style.width = iframe.style.width || "100%";
                            wrapper.style.height =
                              iframe.style.height || "315px";
                            wrapper.style.display = "inline-block";

                            // Insert the wrapper and move the iframe
                            parentElement.insertBefore(wrapper, iframe);
                            wrapper.appendChild(iframe);

                            // Make the iframe invisible
                            iframe.style.opacity = "0";
                            iframe.style.pointerEvents = "none";
                            iframe.setAttribute("data-cookie-blocked", "true");
                            iframe.setAttribute(
                              "data-original-src",
                              blockedSrc
                            );
                            iframe.src = "about:blank";

                            // Add the placeholder back
                            wrapper.appendChild(placeholder);
                          }
                        }
                      });
                    }
                  }
                }
              });
            }
          };

          // Run the check immediately and then every 2 seconds
          ensurePlaceholdersVisible();
          const intervalId = setInterval(ensurePlaceholdersVisible, 2000);

          // Store the interval ID for cleanup
          return () => {
            clearInterval(intervalId);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          };
        } else {
          // If we already have an observer, just run the initial blocking again
          // without disconnecting the existing observer
          console.debug(
            "[CookieKit] Re-running initial iframe/script blocking"
          );
          document.querySelectorAll("script").forEach((script) => {
            if (
              script.src &&
              blockedKeywords.some((keyword) => script.src.includes(keyword))
            ) {
              console.debug(`[CookieKit] Removing script: ${script.src}`);
              script.remove();
            }
          });

          document.querySelectorAll("iframe").forEach((iframe) => {
            if (
              iframe.src &&
              blockedKeywords.some((keyword) => iframe.src.includes(keyword))
            ) {
              console.debug(`[CookieKit] Blocking iframe: ${iframe.src}`);

              // Create a unique ID for the placeholder
              const placeholderId = `cookie-blocked-content-${Math.random()
                .toString(36)
                .substring(2, 11)}`;

              // Get iframe dimensions and position
              const rect = iframe.getBoundingClientRect();
              const computedStyle = window.getComputedStyle(iframe);

              // Get the iframe's parent element
              const parentElement = iframe.parentElement;
              if (!parentElement) return;

              // Make the iframe invisible but keep it in place
              iframe.style.opacity = "0";
              iframe.style.pointerEvents = "none";
              iframe.setAttribute("data-cookie-blocked", "true");

              // Set a blank src to prevent loading
              const originalSrc = iframe.src;
              iframe.setAttribute("data-original-src", originalSrc);
              iframe.src = "about:blank";

              // Create a wrapper div with position relative
              const wrapper = document.createElement("div");
              wrapper.style.position = "relative";
              wrapper.style.width = computedStyle.width;
              wrapper.style.height = computedStyle.height;
              wrapper.style.display = "inline-block";
              wrapper.style.backgroundColor = "rgba(31, 41, 55, 0.95)";
              wrapper.style.borderRadius = "8px";
              wrapper.style.border = "2px solid #4b5563";
              wrapper.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
              wrapper.style.overflow = "hidden";
              wrapper.style.backdropFilter = "blur(4px)";

              // Create the placeholder
              const placeholder = document.createElement("div");
              placeholder.id = placeholderId;
              placeholder.className = "cookie-consent-blocked-iframe";
              placeholder.setAttribute(
                "data-cookie-consent-placeholder",
                "true"
              );
              placeholder.setAttribute("data-blocked-src", originalSrc);

              // Position the placeholder absolutely to cover the iframe exactly
              placeholder.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                min-height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
              `;

              // Create content with more information
              const contentDiv = document.createElement("div");
              contentDiv.className = "cookie-consent-blocked-content";
              contentDiv.style.cssText = `
                text-align: center;
                padding: 24px;
                color: #f3f4f6;
                font-size: 15px;
                line-height: 1.6;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                max-width: 90%;
              `;

              // Add an icon or visual indicator
              const iconDiv = document.createElement("div");
              iconDiv.style.cssText = `
                margin-bottom: 16px;
                font-size: 32px;
              `;
              iconDiv.innerHTML = "🔒"; // Lock emoji as a simple visual indicator

              // Add message with more context
              const messageDiv = document.createElement("div");
              messageDiv.innerHTML = `
                <h3 style="font-size: 18px; margin-bottom: 10px; font-weight: bold; color: white;">Content Blocked</h3>
                <p style="margin-bottom: 12px;">This content requires cookies that are currently blocked by your privacy settings.</p>
                <p style="margin-bottom: 12px;">This embedded content from an external provider may track your activity or store cookies on your device.</p>
                <p style="margin-bottom: 12px;">To view this content, please update your cookie preferences using the button below.</p>
              `;

              // Add a button to manage cookies
              const buttonDiv = document.createElement("div");
              buttonDiv.style.cssText = `
                margin-top: 16px;
              `;
              const settingsButton = document.createElement("button");
              settingsButton.textContent = "Manage Cookie Settings";
              settingsButton.style.cssText = `
                background-color: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
              `;
              settingsButton.addEventListener("mouseover", () => {
                settingsButton.style.backgroundColor = "#2563eb";
              });
              settingsButton.addEventListener("mouseout", () => {
                settingsButton.style.backgroundColor = "#3b82f6";
              });
              settingsButton.addEventListener("click", () => {
                // Try to show cookie settings
                window.dispatchEvent(new CustomEvent("show-cookie-consent"));
              });
              buttonDiv.appendChild(settingsButton);

              // Assemble the placeholder
              contentDiv.appendChild(iconDiv);
              contentDiv.appendChild(messageDiv);
              contentDiv.appendChild(buttonDiv);
              placeholder.appendChild(contentDiv);

              // Insert the wrapper right before the iframe
              parentElement.insertBefore(wrapper, iframe);

              // Move the iframe inside the wrapper
              wrapper.appendChild(iframe);

              // Add the placeholder to the wrapper
              wrapper.appendChild(placeholder);

              console.debug(
                `[CookieKit] Added overlay placeholder ID: ${placeholderId}`
              );
            }
          });
        }
      } else {
        // If no hosts are blocked, restore original functions
        restoreOriginalRequests();
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      }
    } else {
      // If blocking is disabled, restore original functions
      restoreOriginalRequests();
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [detailedConsent, disableAutomaticBlocking, blockedDomains]);

  const showConsentBanner = () => {
    if (!showManageConsent) {
      // Only show banner if manage consent is not shown
      setIsVisible(true);
    }
  };

  const acceptCookies = async () => {
    const newConsent = createDetailedConsent(true);
    setCookie(cookieKey, JSON.stringify(newConsent), expirationDays);
    setDetailedConsent(newConsent);
    setIsVisible(false);
    if (enableFloatingButton) {
      setIsFloatingButtonVisible(true);
    }

    if (cookieKitId) {
      const sessionKey = `${cookieKey}-session`;
      const sessionId = getCookie(sessionKey);
      if (sessionId) {
        await postSessionToAnalytics(
          cookieKitId,
          sessionId,
          "accept",
          {
            Analytics: true,
            Social: true,
            Advertising: true,
          },
          userId
        );
      }
    }
  };

  const declineCookies = async () => {
    const newConsent = createDetailedConsent(false);
    setCookie(cookieKey, JSON.stringify(newConsent), expirationDays);
    setDetailedConsent(newConsent);
    setIsVisible(false);
    if (enableFloatingButton) {
      setIsFloatingButtonVisible(true);
    }

    if (cookieKitId) {
      const sessionKey = `${cookieKey}-session`;
      const sessionId = getCookie(sessionKey);
      if (sessionId) {
        await postSessionToAnalytics(
          cookieKitId,
          sessionId,
          "decline",
          {
            Analytics: false,
            Social: false,
            Advertising: false,
          },
          userId
        );
      }
    }
  };

  const updateDetailedConsent = async (preferences: CookieCategories) => {
    const timestamp = new Date().toISOString();
    const newConsent: DetailedCookieConsent = {
      Analytics: { consented: preferences.Analytics, timestamp },
      Social: { consented: preferences.Social, timestamp },
      Advertising: { consented: preferences.Advertising, timestamp },
    };
    setCookie(cookieKey, JSON.stringify(newConsent), expirationDays);
    setDetailedConsent(newConsent);
    setShowManageConsent(false);
    if (enableFloatingButton) {
      setIsFloatingButtonVisible(true);
    }

    if (cookieKitId) {
      const sessionKey = `${cookieKey}-session`;
      const sessionId = getCookie(sessionKey);
      if (sessionId) {
        await postSessionToAnalytics(
          cookieKitId,
          sessionId,
          "save_preferences",
          preferences,
          userId
        );
      }
    }

    if (onManage) {
      onManage(preferences);
    }
  };

  const handleManage = () => {
    setIsVisible(false);
    setShowManageConsent(true);
    setIsFloatingButtonVisible(false);
  };

  const handleCancelManage = () => {
    setShowManageConsent(false);
    if (enableFloatingButton && detailedConsent) {
      setIsFloatingButtonVisible(true);
    } else {
      setIsVisible(true);
    }
  };

  // Add effect to show floating button on mount if consent exists
  useEffect(() => {
    if (enableFloatingButton && detailedConsent) {
      setIsFloatingButtonVisible(true);
    }

    // Add event listener for custom event to show cookie settings
    const handleShowCookieConsent = () => {
      console.debug(
        "[CookieKit] Custom event triggered to show cookie settings"
      );
      if (detailedConsent) {
        setShowManageConsent(true);
        setIsFloatingButtonVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("show-cookie-consent", handleShowCookieConsent);

    return () => {
      window.removeEventListener(
        "show-cookie-consent",
        handleShowCookieConsent
      );
    };
  }, [enableFloatingButton, detailedConsent]);

  // Add debug logging
  useEffect(() => {
    console.log("Debug floating button state:", {
      enableFloatingButton,
      isFloatingButtonVisible,
      isVisible,
      showManageConsent,
      hasDetailedConsent: detailedConsent !== null,
    });
  }, [
    enableFloatingButton,
    isFloatingButtonVisible,
    isVisible,
    showManageConsent,
    detailedConsent,
  ]);

  const value: CookieConsentContextValue = {
    hasConsent,
    isDeclined: hasConsent === false,
    detailedConsent,
    showConsentBanner,
    acceptCookies,
    declineCookies,
    updateDetailedConsent,
  };

  return (
    <CookieManagerContext.Provider value={value}>
      {children}
      {isVisible && (
        <CookieConsenter
          {...props}
          theme={theme}
          tFunction={tFunction}
          cookieKey={cookieKey}
          onAccept={acceptCookies}
          onDecline={declineCookies}
          onManage={handleManage}
          detailedConsent={detailedConsent}
          initialPreferences={
            detailedConsent
              ? {
                  Analytics: detailedConsent.Analytics.consented,
                  Social: detailedConsent.Social.consented,
                  Advertising: detailedConsent.Advertising.consented,
                }
              : undefined
          }
        />
      )}
      {showManageConsent &&
        createPortal(
          <div className="cookie-manager">
            <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div
                className={`w-full max-w-lg rounded-xl p-6 ${
                  theme === "light"
                    ? "bg-white/95 ring-1 ring-black/10"
                    : "bg-black/95 ring-1 ring-white/10"
                }`}
              >
                <ManageConsent
                  tFunction={tFunction}
                  theme={theme}
                  onSave={updateDetailedConsent}
                  onCancel={handleCancelManage}
                  initialPreferences={
                    detailedConsent
                      ? {
                          Analytics: detailedConsent.Analytics.consented,
                          Social: detailedConsent.Social.consented,
                          Advertising: detailedConsent.Advertising.consented,
                        }
                      : undefined
                  }
                  detailedConsent={detailedConsent}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
      {isFloatingButtonVisible &&
        !isVisible &&
        !showManageConsent &&
        createPortal(
          <div className="cookie-manager">
            <FloatingCookieButton
              theme={theme}
              onClick={() => {
                setShowManageConsent(true);
                setIsFloatingButtonVisible(false);
              }}
              onClose={() => {
                setIsFloatingButtonVisible(false);
              }}
            />
          </div>,
          document.body
        )}
    </CookieManagerContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieManagerContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieManager");
  }
  return context;
};
