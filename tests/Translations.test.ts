import { createTFunction } from '../src/utils/translations';

describe('translations', () => {
  test('defaults and param interpolation', () => {
    const t = createTFunction();
    expect(t('manageAdvertTitle')).toBe('Advertising');
    const s = t('manageCookiesStatus', { status: 'Consented', date: '2025-01-01' });
    expect(s).toBe('Status: Consented on 2025-01-01');
  });
});


