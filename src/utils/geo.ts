import { resolveCountryFromTimezone } from "./session-utils";

export type JurisdictionCode =
  | "NONE"
  | "GDPR"
  | "CH"
  | "BR"
  | "PIPEDA"
  | "AU"
  | "APPI"
  | "PIPA"
  | "US-CA";

export interface GeoDetectionResult {
  countryCode: string | null;
  regionCode: string | null;
}

export interface GeoOptions {
  disableGeo?: boolean;
  endpointUrl?: string; // Custom geo endpoint returning JSON
  timeoutMs?: number; // Network timeout for remote detection
  cacheTtlMs?: number; // Local cache TTL
  countryOverride?: string | null; // Force country code
  regionOverride?: string | null; // Force region/state code
  regulatedCountries?: string[]; // Additional ISO country codes to treat as regulated
  regulatedRegions?: string[]; // Region codes like US-CA to treat as regulated
  defaultBehavior?: "show" | "hide"; // Fallback when detection fails
}

const DEFAULT_ENDPOINT = "https://ipapi.co/json/";
const DEFAULT_TIMEOUT_MS = 2000;
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const GEO_CACHE_KEY = "rcm_geo_cache_v1";

const EU = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);
const EEA = new Set(["IS", "NO", "LI"]);
const UK = new Set(["GB"]);
const CH = new Set(["CH"]);
const BR = new Set(["BR"]);
const CA = new Set(["CA"]);
const AU = new Set(["AU"]);
const JP = new Set(["JP"]);
const KR = new Set(["KR"]);

export function determineJurisdiction(
  countryCode: string | null,
  regionCode?: string | null,
  extraCountries?: string[] | undefined,
  extraRegions?: string[] | undefined
): { showConsentBanner: boolean; jurisdiction: JurisdictionCode } {
  if (!countryCode) {
    return { showConsentBanner: true, jurisdiction: "NONE" };
  }

  const cc = countryCode.toUpperCase();
  const rc = regionCode ? regionCode.toUpperCase() : null;

  // Honor explicit region rules first (e.g., California)
  if (rc && (extraRegions?.includes(rc) || rc === "US-CA")) {
    return { showConsentBanner: true, jurisdiction: "US-CA" };
  }

  const jurisdictionMap: Array<{ sets: Set<string>[]; code: JurisdictionCode }>
    = [
    { sets: [EU, EEA, UK], code: "GDPR" },
    { sets: [CH], code: "CH" },
    { sets: [BR], code: "BR" },
    { sets: [CA], code: "PIPEDA" },
    { sets: [AU], code: "AU" },
    { sets: [JP], code: "APPI" },
    { sets: [KR], code: "PIPA" },
  ];

  for (const { sets, code } of jurisdictionMap) {
    if (sets.some((set) => set.has(cc))) {
      return { showConsentBanner: true, jurisdiction: code };
    }
  }

  if (extraCountries?.some((c) => c.toUpperCase() === cc)) {
    return { showConsentBanner: true, jurisdiction: "NONE" };
  }

  return { showConsentBanner: false, jurisdiction: "NONE" };
}

function readCache(): GeoDetectionResult | null {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      expiresAt: number;
      value: GeoDetectionResult;
    };
    if (Date.now() > parsed.expiresAt) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function writeCache(result: GeoDetectionResult, ttlMs: number) {
  try {
    const payload = {
      expiresAt: Date.now() + ttlMs,
      value: result,
    };
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<any> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error("Geo endpoint error: " + res.status);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function detectGeo(options?: GeoOptions): Promise<GeoDetectionResult> {
  const {
    disableGeo,
    endpointUrl,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    countryOverride,
    regionOverride,
  } = options || {};

  if (disableGeo) {
    return { countryCode: null, regionCode: null };
  }

  if (countryOverride || regionOverride) {
    return {
      countryCode: countryOverride ?? null,
      regionCode: regionOverride ?? null,
    };
  }

  if (typeof window === "undefined") {
    // SSR environment without overrides: no detection is possible here
    return { countryCode: null, regionCode: null };
  }

  const cached = readCache();
  if (cached) return cached;

  // Attempt remote endpoint
  try {
    const data = await fetchWithTimeout(
      endpointUrl || DEFAULT_ENDPOINT,
      timeoutMs
    );
    // Try common field names across providers
    const country =
      data?.country || data?.countryCode || data?.country_code || null;
    // Prefer ISO2 for region/state; some providers return region_code or region
    const region =
      data?.region_code || data?.regionCode || data?.region || null;

    const result = {
      countryCode: country ? String(country).toUpperCase() : null,
      regionCode: region
        ? String(region).toUpperCase().startsWith("US-")
          ? String(region).toUpperCase()
          : // Normalize US state to US-XX when country is US and region is just code
            country && String(country).toUpperCase() === "US" &&
            /^[A-Z]{2}$/.test(String(region).toUpperCase())
          ? `US-${String(region).toUpperCase()}`
          : String(region).toUpperCase()
        : null,
    } as GeoDetectionResult;

    writeCache(result, cacheTtlMs);
    return result;
  } catch {
    // Fallback to timezone-based approximation
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const cc = tz ? resolveCountryFromTimezone(tz) : null;
      const approx: GeoDetectionResult = {
        countryCode: cc && cc !== "Unknown" ? cc : null,
        regionCode: null,
      };
      writeCache(approx, cacheTtlMs);
      return approx;
    } catch {
      return { countryCode: null, regionCode: null };
    }
  }
}

export async function shouldShowConsentByGeo(
  options?: GeoOptions
): Promise<{
  show: boolean;
  countryCode: string | null;
  regionCode: string | null;
  jurisdiction: JurisdictionCode;
}> {
  const {
    defaultBehavior = "hide",
    regulatedCountries,
    regulatedRegions,
  } = options || {};

  const { countryCode, regionCode } = await detectGeo(options);

  if (!countryCode && defaultBehavior === "show") {
    return { show: true, countryCode, regionCode, jurisdiction: "NONE" };
  }

  if (!countryCode && defaultBehavior === "hide") {
    return { show: false, countryCode, regionCode, jurisdiction: "NONE" };
  }

  const { showConsentBanner, jurisdiction } = determineJurisdiction(
    countryCode,
    regionCode,
    regulatedCountries,
    regulatedRegions
  );

  return {
    show: showConsentBanner,
    countryCode,
    regionCode,
    jurisdiction,
  };
}


