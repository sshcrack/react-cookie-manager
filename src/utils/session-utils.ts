import { timezoneToCountryCodeMap } from "./timeZoneMap";
import type { CookieCategories } from "../types/types";

/**
 * Generates a random string of specified length
 * @param length The length of the random string
 * @returns A random string
 */
export const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Generates a unique ID based on various entropy sources
 * @returns A promise that resolves to a unique ID string
 */
export const generateUniqueId = async (): Promise<string> => {
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

/**
 * Generates a session ID for analytics
 * @param kitId The cookie kit ID
 * @returns A promise that resolves to a session ID string
 */
export const generateSessionId = async (kitId: string): Promise<string> => {
  const timestamp = new Date().getTime();
  const uniqueId = await generateUniqueId();
  const randomPart = generateRandomString(8);
  return `${kitId}_${timestamp}_${uniqueId}_${randomPart}`;
};

/**
 * Resolves a country code from a timezone
 * @param timeZone The timezone to resolve
 * @returns The country code or "Unknown" if not found
 */
export const resolveCountryFromTimezone = (timeZone: string): string => {
  const entry = timezoneToCountryCodeMap[timeZone]?.a
    ? timezoneToCountryCodeMap[timezoneToCountryCodeMap[timeZone].a]
    : timezoneToCountryCodeMap[timeZone];

  return entry?.c?.[0] ?? "Unknown";
};

/**
 * Posts session data to analytics
 * @param kitId The cookie kit ID
 * @param sessionId The session ID
 * @param action The action performed (e.g., "accept", "decline")
 * @param preferences The cookie preferences
 * @param userId Optional user ID
 */
export const postSessionToAnalytics = async (
  kitId: string,
  sessionId: string,
  action?: string,
  preferences?: CookieCategories,
  userId?: string
): Promise<void> => {
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
