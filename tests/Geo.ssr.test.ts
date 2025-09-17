import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectGeo, shouldShowConsentByGeo } from '../src/utils/geo';

describe('geo utils SSR behavior', () => {
  const originalWindow = globalThis.window as any;
  const originalLocalStorage = globalThis.localStorage as any;
  const originalFetch = globalThis.fetch as any;

  beforeEach(() => {
    // Simulate SSR (no window, no localStorage, no fetch)
    // @ts-expect-error - deleting for test purposes
    delete (globalThis as any).window;
    // @ts-expect-error - deleting for test purposes
    delete (globalThis as any).localStorage;
    // Keep fetch defined in node, but we expect detectGeo to short-circuit before using it.
  });

  afterEach(() => {
    // Restore globals
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalLocalStorage;
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('detectGeo returns null codes on SSR', async () => {
    const res = await detectGeo();
    expect(res).toEqual({ countryCode: null, regionCode: null });
  });

  it('shouldShowConsentByGeo respects defaultBehavior on SSR when unknown', async () => {
    const hide = await shouldShowConsentByGeo({ defaultBehavior: 'hide' });
    expect(hide.show).toBe(false);
    const show = await shouldShowConsentByGeo({ defaultBehavior: 'show' });
    expect(show.show).toBe(true);
  });

  it('shouldShowConsentByGeo honors overrides even on SSR', async () => {
    const res = await shouldShowConsentByGeo({ countryOverride: 'DE' });
    expect(res.show).toBe(true);
    expect(res.jurisdiction).toBe('GDPR');
  });
});


