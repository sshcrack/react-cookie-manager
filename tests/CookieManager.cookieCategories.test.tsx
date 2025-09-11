import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieManager } from '../src/context/CookieConsentContext';

describe('CookieManager cookieCategories', () => {
  test('Manage modal hides Social when cookieCategories.Social = false', async () => {
    const user = userEvent.setup();

    render(
      <CookieManager
        showManageButton
        cookieCategories={{ Analytics: true, Social: false, Advertising: true }}
      >
        <div />
      </CookieManager>
    );

    // Open Manage dialog from banner
    const btn = await screen.findByText('Manage Cookies');
    await user.click(btn);

    // Wait for lazy-loaded ManageConsent content
    await screen.findByText('Cookie Preferences');
    // Social should not appear in manage modal
    await waitFor(() => expect(screen.queryByText('Social')).not.toBeInTheDocument());
    // Others should
    expect(await screen.findByText('Analytics')).toBeInTheDocument();
    expect(await screen.findByText('Advertising')).toBeInTheDocument();
  });
});


