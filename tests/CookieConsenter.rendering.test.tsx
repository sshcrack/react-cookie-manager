import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CookieConsenter from '../src/components/CookieConsenter';
import { createTFunction } from '../src/utils/translations';

describe('CookieConsenter rendering', () => {
  const t = createTFunction();

  test('decline triggers callback after delay', async () => {
    const user = userEvent.setup();
    const onDecline = vi.fn();

    render(
      <CookieConsenter
        tFunction={t}
        displayType="banner"
        showManageButton
        onDecline={onDecline}
      />
    );

    await user.click(screen.getByText('Decline'));

    await waitFor(() => expect(onDecline).toHaveBeenCalled(), { timeout: 1000 });
  });

  test('accept triggers callback after delay', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();

    render(
      <CookieConsenter
        tFunction={t}
        displayType="banner"
        showManageButton
        onAccept={onAccept}
      />
    );

    await user.click(screen.getByText('Accept'));

    await waitFor(() => expect(onAccept).toHaveBeenCalled(), { timeout: 1000 });
  });

  test('manage triggers callback immediately', async () => {
    const user = userEvent.setup();
    const onManage = vi.fn();

    render(
      <CookieConsenter
        tFunction={t}
        displayType="banner"
        showManageButton
        onManage={onManage}
      />
    );

    await user.click(screen.getByText('Manage Cookies'));
    expect(onManage).toHaveBeenCalled();
  });
});


