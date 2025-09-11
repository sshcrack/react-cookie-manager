import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ManageConsent } from '../src/components/ManageConsent';
import { createTFunction } from '../src/utils/translations';

const t = createTFunction();

describe('ManageConsent', () => {
  test('respects cookieCategories visibility flags', async () => {
    render(
      <ManageConsent
        tFunction={t}
        theme="light"
        onSave={() => {}}
        cookieCategories={{ Analytics: true, Social: false, Advertising: true }}
      />
    );

    // Essential is always present
    expect(screen.getByText('Essential')).toBeInTheDocument();

    // Analytics visible
    expect(screen.getByText('Analytics')).toBeInTheDocument();

    // Social hidden
    expect(screen.queryByText('Social')).not.toBeInTheDocument();

    // Advertising visible
    expect(screen.getByText('Advertising')).toBeInTheDocument();
  });

  test('toggles and saves preferences', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <ManageConsent
        tFunction={t}
        theme="light"
        onSave={onSave}
        initialPreferences={{ Analytics: false, Social: false, Advertising: false }}
      />
    );

    // Toggle analytics via checkbox by label proximity
    const analyticsTitle = screen.getByText('Analytics');
    const analyticsToggle = analyticsTitle.closest('div')?.parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(analyticsToggle).toBeInTheDocument();

    await user.click(analyticsToggle);

    await user.click(screen.getByText('Save Preferences'));

    expect(onSave).toHaveBeenCalledWith({ Analytics: true, Social: false, Advertising: false });
  });
});


