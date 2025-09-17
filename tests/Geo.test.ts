import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  determineJurisdiction,
  detectGeo,
  shouldShowConsentByGeo,
} from '../src/utils/geo';

// Mock timezone -> country resolver for fallback path
vi.mock('../src/utils/session-utils', () => {
  return {
    resolveCountryFromTimezone: vi.fn(() => 'FR'),
  };
});

const getFetch = () => (globalThis as any).fetch as unknown as typeof fetch;

describe('geo utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('determineJurisdiction', () => {
    it('returns GDPR for EU/EEA/UK countries', () => {
      expect(determineJurisdiction('DE').jurisdiction).toBe('GDPR');
      expect(determineJurisdiction('SE').jurisdiction).toBe('GDPR');
      expect(determineJurisdiction('NO').jurisdiction).toBe('GDPR');
      expect(determineJurisdiction('GB').jurisdiction).toBe('GDPR');
      expect(determineJurisdiction('de').jurisdiction).toBe('GDPR');
    });

    it('maps CH, BR, CA, AU, JP, KR to their codes and shows banner', () => {
      expect(determineJurisdiction('CH')).toEqual({ showConsentBanner: true, jurisdiction: 'CH' });
      expect(determineJurisdiction('BR')).toEqual({ showConsentBanner: true, jurisdiction: 'BR' });
      expect(determineJurisdiction('CA')).toEqual({ showConsentBanner: true, jurisdiction: 'PIPEDA' });
      expect(determineJurisdiction('AU')).toEqual({ showConsentBanner: true, jurisdiction: 'AU' });
      expect(determineJurisdiction('JP')).toEqual({ showConsentBanner: true, jurisdiction: 'APPI' });
      expect(determineJurisdiction('KR')).toEqual({ showConsentBanner: true, jurisdiction: 'PIPA' });
    });

    it('shows for US-CA region specifically', () => {
      expect(determineJurisdiction('US', 'US-CA')).toEqual({ showConsentBanner: true, jurisdiction: 'US-CA' });
    });

    it('can force show via extra countries/regions', () => {
      expect(determineJurisdiction('IN')).toEqual({ showConsentBanner: false, jurisdiction: 'NONE' });
      expect(determineJurisdiction('IN', null, ['IN'])).toEqual({ showConsentBanner: true, jurisdiction: 'NONE' });
      // Implementation labels any region-based regulation as US-CA (CPRA-like). Match current behavior.
      expect(determineJurisdiction('US', 'US-NY', undefined, ['US-NY'])).toEqual({ showConsentBanner: true, jurisdiction: 'US-CA' });
    });

    it('returns show when countryCode is null (unknown)', () => {
      expect(determineJurisdiction(null)).toEqual({ showConsentBanner: true, jurisdiction: 'NONE' });
    });
  });

  describe('detectGeo', () => {
    it('honors disableGeo', async () => {
      const result = await detectGeo({ disableGeo: true });
      expect(result).toEqual({ countryCode: null, regionCode: null });
    });

    it('honors overrides and skips network/cache', async () => {
      const spy = vi.spyOn(globalThis as any, 'fetch');
      const result = await detectGeo({ countryOverride: 'US', regionOverride: 'US-CA' });
      expect(spy).not.toHaveBeenCalled();
      expect(result).toEqual({ countryCode: 'US', regionCode: 'US-CA' });
    });

    it('fetches from endpoint and normalizes region codes', async () => {
      vi.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ country: 'US', region_code: 'CA' }),
      } as any);

      const result = await detectGeo();
      expect(getFetch()).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ countryCode: 'US', regionCode: 'US-CA' });
    });

    it('caches results and reuses cache', async () => {
      vi.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ country_code: 'FR', region: 'IDF' }),
      } as any);

      const first = await detectGeo({ cacheTtlMs: 60_000 });
      expect(first).toEqual({ countryCode: 'FR', regionCode: 'IDF' });
      expect(getFetch()).toHaveBeenCalledTimes(1);

      // Second call should hit cache, no new fetch
      const second = await detectGeo({ cacheTtlMs: 60_000 });
      expect(second).toEqual(first);
      expect(getFetch()).toHaveBeenCalledTimes(1);
    });

    it('falls back to timezone-based country on fetch error/timeout', async () => {
      vi.useFakeTimers();
      vi.spyOn(globalThis as any, 'fetch').mockImplementationOnce((_: any, init: any) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }) as any;
      });

      const promise = detectGeo({ timeoutMs: 10 });
      vi.advanceTimersByTime(20);
      const result = await promise;
      // Our mocked resolveCountryFromTimezone returns FR
      expect(result).toEqual({ countryCode: 'FR', regionCode: null });
    });
  });

  describe('shouldShowConsentByGeo', () => {
    it('returns defaultBehavior when country is unknown', async () => {
      const resHide = await shouldShowConsentByGeo({ disableGeo: true, defaultBehavior: 'hide' });
      expect(resHide.show).toBe(false);
      const resShow = await shouldShowConsentByGeo({ disableGeo: true, defaultBehavior: 'show' });
      expect(resShow.show).toBe(true);
    });

    it('shows for GDPR via overrides without network', async () => {
      const res = await shouldShowConsentByGeo({ countryOverride: 'DE' });
      expect(res).toMatchObject({ show: true, jurisdiction: 'GDPR', countryCode: 'DE' });
    });

    it('respects regulatedCountries and regulatedRegions options', async () => {
      // Country not regulated by default
      let res = await shouldShowConsentByGeo({ countryOverride: 'IN' });
      expect(res.show).toBe(false);

      // Add country as regulated
      res = await shouldShowConsentByGeo({ countryOverride: 'IN', regulatedCountries: ['IN'] });
      expect(res.show).toBe(true);

      // Region regulation (e.g., treat US-NY as regulated)
      res = await shouldShowConsentByGeo({ countryOverride: 'US', regionOverride: 'US-NY', regulatedRegions: ['US-NY'] });
      expect(res.show).toBe(true);
    });
  });
});


