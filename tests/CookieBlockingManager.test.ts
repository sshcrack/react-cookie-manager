import { CookieBlockingManager } from '../src/utils/cookie-blocking';

describe('CookieBlockingManager', () => {
  test('initialize and cleanup set/clear intervals', () => {
    const manager = new CookieBlockingManager();
    const setSpy = vi.spyOn(window, 'setInterval');
    const clearSpy = vi.spyOn(window, 'clearInterval');

    manager.initialize(['example.com'], ['example']);
    expect(setSpy).toHaveBeenCalled();

    manager.cleanup();
    expect(clearSpy).toHaveBeenCalled();

    setSpy.mockRestore();
    clearSpy.mockRestore();
  });
});


