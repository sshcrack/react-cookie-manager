import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieManager } from '../src/context/CookieConsentContext';

describe('CookieManager initialPreferences', () => {
  test('Manage modal uses initialPreferences when no prior consent', async () => {
    const user = userEvent.setup();

    render(
      <CookieManager
        showManageButton
        initialPreferences={{ Analytics: true, Social: true, Advertising: true }}
      >
        <div />
      </CookieManager>
    );

    // Open Manage dialog from banner
    const manageBtn = await screen.findByText('Manage Cookies');
    await user.click(manageBtn);

    // Wait for lazy-loaded ManageConsent content
    await screen.findByText('Cookie Preferences');

    // Find toggles by proximity to headings
    const getToggleFor = (title: string) => {
      const heading = screen.getByText(title);
      const container = heading.closest('div')?.parentElement as HTMLElement;
      return container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    };

    expect(getToggleFor('Analytics').checked).toBe(true);
    expect(getToggleFor('Social').checked).toBe(true);
    expect(getToggleFor('Advertising').checked).toBe(true);
  });
});


