import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { CookieManager } from '../src/context/CookieConsentContext';

const resetCookies = () => {
  document.cookie.split(';').forEach((c) => {
    const eqPos = c.indexOf('=');
    const name = eqPos > -1 ? c.slice(0, eqPos).trim() : c.trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
};

describe('CookieManager geolocation gating (inline endpoint)', () => {
  beforeEach(() => {
    resetCookies();
    vi.restoreAllMocks();
    // Fresh session cache for each test
    try {
      sessionStorage.clear();
    } catch {}
  });

  afterEach(() => {
    cleanup();
  });

  it('shows banner when endpoint returns showConsentBanner: true', async () => {
    const fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ showConsentBanner: true }),
    } as any);

    render(
      <CookieManager showManageButton>
        <div />
      </CookieManager>
    );

    expect(await screen.findByText('Manage Cookies')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('does not show banner when endpoint returns showConsentBanner: false', async () => {
    const fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ showConsentBanner: false }),
    } as any);

    render(
      <CookieManager showManageButton>
        <div />
      </CookieManager>
    );

    await waitFor(() => {
      expect(screen.queryByText('Manage Cookies')).not.toBeInTheDocument();
    }, { timeout: 1500 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('bypasses endpoint and shows banner when disableGeolocation is true', async () => {
    const fetchSpy = vi.spyOn(globalThis as any, 'fetch');

    render(
      <CookieManager showManageButton disableGeolocation>
        <div />
      </CookieManager>
    );

    expect(await screen.findByText('Manage Cookies')).toBeInTheDocument();
    // Should not call fetch when disabled
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('uses sessionStorage cache to avoid extra network calls', async () => {
    const fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ showConsentBanner: true }),
    } as any);

    // First render populates cache and shows banner
    const { unmount } = render(
      <CookieManager showManageButton>
        <div />
      </CookieManager>
    );
    expect(await screen.findByText('Manage Cookies')).toBeInTheDocument();
    unmount();

    // Second render should read from cache; no additional fetch call expected
    render(
      <CookieManager showManageButton>
        <div />
      </CookieManager>
    );
    expect(await screen.findByText('Manage Cookies')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});


