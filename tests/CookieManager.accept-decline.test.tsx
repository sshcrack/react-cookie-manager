import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieManager } from '../src/context/CookieConsentContext';

describe('CookieManager accept/decline flow', () => {
  beforeEach(() => {
    // Reset cookies
    document.cookie.split(';').forEach(c => {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.slice(0, eqPos) : c;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  test('accept sets cookie and hides banner', async () => {
    const user = userEvent.setup();

    render(
      <CookieManager showManageButton enableFloatingButton>
        <div />
      </CookieManager>
    );

    const accept = await screen.findByText('Accept');
    await user.click(accept);

    // Banner should disappear after animation delay (500ms)
    await waitFor(() => {
      expect(screen.queryByText('Manage Cookies')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Cookie should be set
    expect(document.cookie).toMatch(/cookie-consent=/);
  });

  test('decline sets cookie and hides banner', async () => {
    const user = userEvent.setup();

    render(
      <CookieManager showManageButton enableFloatingButton>
        <div />
      </CookieManager>
    );

    const decline = await screen.findByText('Decline');
    await user.click(decline);

    await waitFor(() => {
      expect(screen.queryByText('Manage Cookies')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    expect(document.cookie).toMatch(/cookie-consent=/);
  });
});


