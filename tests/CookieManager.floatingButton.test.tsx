import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieManager } from '../src/context/CookieConsentContext';

describe('CookieManager floating button', () => {
  test('floating button appears after accept when enabled', async () => {
    const user = userEvent.setup();

    render(
      <CookieManager showManageButton enableFloatingButton>
        <div />
      </CookieManager>
    );

    await user.click(await screen.findByText('Accept'));

    // Wait for banner to hide and floating button to appear
    const flt = await screen.findByRole('button', { name: 'Manage cookie preferences' });
    expect(flt).toBeInTheDocument();
  });
});


