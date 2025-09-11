import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieManager, useCookieConsent } from '../src/context/CookieConsentContext';

const Consumer = () => {
  const { openPreferencesModal, showConsentBanner } = useCookieConsent();
  return (
    <div>
      <button onClick={openPreferencesModal}>Open Prefs</button>
      <button onClick={showConsentBanner}>Show Banner</button>
    </div>
  );
};

describe('CookieManager context', () => {
  test('openPreferencesModal shows manage modal when consent exists', async () => {
    const user = userEvent.setup();
    render(
      <CookieManager showManageButton>
        <Consumer />
      </CookieManager>
    );

    // Accept first to create consent
    await user.click(await screen.findByText('Accept'));

    // Wait for accept delay to persist consent
    await waitFor(() => expect(document.cookie).toMatch(/cookie-consent=/), { timeout: 1500 });

    // Use context to open prefs (now that consent exists)
    await user.click(screen.getByText('Open Prefs'));

    // Manage UI title should be visible
    expect(await screen.findByText('Cookie Preferences')).toBeInTheDocument();
  });
});


