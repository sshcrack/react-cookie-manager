import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { CookieManager } from '../src/context/CookieConsentContext';

describe('unregulated regions: no banner -> allow all by default', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Cache a geo decision of show=false to simulate unregulated region
    sessionStorage.setItem('rcm_geo_decision_v1', JSON.stringify({ ts: Date.now(), show: false }));
  });

  afterEach(() => {
    sessionStorage.clear();
    global.fetch = originalFetch as any;
    vi.restoreAllMocks();
  });

  it('does not block tracking requests when geo says do not show banner', async () => {
    // Spy on fetch to ensure it's not blocked by request-blocker
    const spy = vi.spyOn(global, 'fetch');
    spy.mockResolvedValue(new Response('{}', { status: 200 }))

    render(
      <CookieManager translations={{}}>
        <div>App</div>
      </CookieManager>
    );

    // Attempt a request to a known tracker host that would be blocked if preferences were null
    await global.fetch('https://www.google-analytics.com/collect');
    expect(spy).toHaveBeenCalled();

    // Ensure the call was not short-circuited with 403 by our request blocker
    const res = await spy.mock.results[0].value as Response;
    expect(res.status).toBe(200);
  });
});


