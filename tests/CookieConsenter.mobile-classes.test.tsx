import React from 'react';
import { render, waitFor } from '@testing-library/react';
import CookieConsenter from '../src/components/CookieConsenter';
import { createTFunction } from '../src/utils/translations';

// Helper to mock window.innerWidth and dispatch resize
const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  window.dispatchEvent(new Event('resize'));
};

describe('CookieConsenter classNames persist across resize', () => {
  const t = createTFunction();

  test('bannerContent class persists when switching to mobile', async () => {
    // Start desktop
    setViewportWidth(1024);

    const classNames = {
      bannerContent: 'custom-banner-content',
      popupContent: 'custom-popup-content',
      modalContent: 'custom-modal-content',
    } as const;

    render(
      <CookieConsenter tFunction={t} displayType="banner" classNames={classNames} />
    );

    const findBanner = () => document.body.querySelector('.custom-banner-content');

    // On desktop, should have custom banner class applied
    await waitFor(() => {
      expect(findBanner()).toBeTruthy();
    });

    // Switch to mobile and ensure our class is applied via MobileModal wrapper
    setViewportWidth(375);

    // After resize, MobileModal re-renders; find our custom class still present
    await waitFor(() => {
      expect(findBanner()).toBeTruthy();
    });
  });
});


