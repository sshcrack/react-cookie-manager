import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FloatingCookieButton } from '../src/components/FloatingCookieButton';

describe('FloatingCookieButton', () => {
  test('calls onClick and onClose', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(<FloatingCookieButton onClick={onClick} onClose={onClose} />);

    const btn = screen.getByRole('button', { name: 'Manage cookie preferences' });
    await user.click(btn);
    expect(onClick).toHaveBeenCalled();

    // simulate hover to show close button then click close
    await user.hover(btn);
    const close = await screen.findByRole('button', { name: 'Close cookie button' });
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalled();
  });
});


