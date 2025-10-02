import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const readConsentCookieObject = (): any | null => {
  const entry = document.cookie
    .split('; ')
    .find((c) => c.startsWith('cookie-consent='));
  if (!entry) return null;
  const value = entry.split('=')[1];
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

describe('CookieManager cookie filtering by cookieCategories', () => {
  beforeEach(() => {
    resetCookies();
  });

  test('Accept writes only visible categories to cookie', async () => {
    const user = userEvent.setup();

    render(
      <CookieManager
        showManageButton
        cookieCategories={{ Analytics: true, Social: false, Advertising: true }}
      >
        <div />
      </CookieManager>
    );

    const accept = await screen.findByText('Accept');
    await user.click(accept);

    await waitFor(() => expect(document.cookie).toMatch(/cookie-consent=/), { timeout: 1500 });
    const obj = readConsentCookieObject();
    expect(obj).not.toBeNull();
    // Social is hidden, so it should not be present in cookie payload
    expect('Social' in obj!).toBe(false);
    expect('Analytics' in obj!).toBe(true);
    expect('Advertising' in obj!).toBe(true);
  });

  test('Decline writes only visible categories to cookie', async () => {
    const user = userEvent.setup();

    render(
      <CookieManager
        showManageButton
        cookieCategories={{ Analytics: false, Social: false, Advertising: true }}
      >
        <div />
      </CookieManager>
    );

    const decline = await screen.findByText('Decline');
    await user.click(decline);

    await waitFor(() => expect(document.cookie).toMatch(/cookie-consent=/), { timeout: 1500 });
    const obj = readConsentCookieObject();
    expect(obj).not.toBeNull();
    // Only Advertising visible here
    expect('Analytics' in obj!).toBe(false);
    expect('Social' in obj!).toBe(false);
    expect('Advertising' in obj!).toBe(true);
  });

  test('Saving preferences writes only visible categories to cookie', async () => {
    const user = userEvent.setup();

    render(
      <CookieManager
        showManageButton
        cookieCategories={{ Analytics: true, Social: false, Advertising: true }}
        initialPreferences={{ Analytics: true, Social: true, Advertising: false }}
      >
        <div />
      </CookieManager>
    );

    const manageBtn = await screen.findByText('Manage Cookies');
    await user.click(manageBtn);
    await screen.findByText('Cookie Preferences');

    const save = await screen.findByText('Save Preferences');
    await user.click(save);

    await waitFor(() => expect(document.cookie).toMatch(/cookie-consent=/), { timeout: 1500 });
    const obj = readConsentCookieObject();
    expect(obj).not.toBeNull();
    // Hidden Social is not persisted
    expect('Social' in obj!).toBe(false);
    // Visible ones are persisted
    expect('Analytics' in obj!).toBe(true);
    expect('Advertising' in obj!).toBe(true);
  });
});


