import { CookieCategories } from "../types/types";
import { trackers } from "./trackers";

export const getBlockedHosts = (
  preferences: CookieCategories | null
): string[] => {
  if (!preferences) {
    // If no preferences set, block everything
    return Object.values(trackers.categories).flat();
  }

  const blockedHosts: string[] = [];

  // Add hosts based on declined categories
  if (!preferences.Analytics) {
    blockedHosts.push(...trackers.categories.Analytics);
  }
  if (!preferences.Social) {
    blockedHosts.push(...trackers.categories.Social);
  }
  if (!preferences.Advertising) {
    blockedHosts.push(...trackers.categories.Advertising);

    // Ensure YouTube domains are blocked when Advertising is declined
    // This is a safeguard in case YouTube domains are miscategorized
    // const youtubeHosts: string[] = [
    //   // "youtube.com",
    //   // "youtube-nocookie.com",
    //   // "youtu.be",
    //   // "ytimg.com",
    //   // "googlevideo.com",
    // ];

    // youtubeHosts.forEach((host) => {
    //   if (!blockedHosts.includes(host)) {
    //     blockedHosts.push(host);
    //   }
    // });
  }

  return [...new Set(blockedHosts)]; // Remove duplicates
};

export const getBlockedKeywords = (
  preferences: CookieCategories | null
): string[] => {
  if (!preferences) {
    // If no preferences set, block everything
    return Object.values(trackers.categories)
      .flat()
      .map((host) => host.replace(/\.[^.]+$/, ""));
  }

  const blockedHosts = getBlockedHosts(preferences);
  // Convert hosts to keywords by removing the TLD
  const keywords = [
    ...new Set(blockedHosts.map((host) => host.replace(/\.[^.]+$/, ""))),
  ];

  // Ensure YouTube keywords are included when Advertising is declined
  // if (!preferences.Advertising) {
  //   const youtubeKeywords = ["youtube", "ytimg", "googlevideo", "youtu"];

  //   youtubeKeywords.forEach((keyword) => {
  //     if (!keywords.includes(keyword)) {
  //       keywords.push(keyword);
  //     }
  //   });
  // }

  return keywords;
};
