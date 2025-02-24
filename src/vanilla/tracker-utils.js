import { trackers } from "./trackers.js";

export const getBlockedHosts = (preferences) => {
  if (!preferences) {
    // If no preferences set, block everything
    return Object.values(trackers.categories).flat();
  }

  const blockedHosts = [];

  // Add hosts based on declined categories
  if (!preferences.analytics) {
    blockedHosts.push(...trackers.categories.Analytics);
  }
  if (!preferences.marketing) {
    blockedHosts.push(
      ...trackers.categories.Advertising,
      ...trackers.categories.Social
    );
  }

  return [...new Set(blockedHosts)]; // Remove duplicates
};

export const getBlockedKeywords = (preferences) => {
  if (!preferences) {
    // If no preferences set, block everything
    return Object.values(trackers.categories)
      .flat()
      .map((host) => host.replace(/\.[^.]+$/, ""));
  }

  const blockedHosts = getBlockedHosts(preferences);
  // Convert hosts to keywords by removing the TLD
  return [...new Set(blockedHosts.map((host) => host.replace(/\.[^.]+$/, "")))];
};
