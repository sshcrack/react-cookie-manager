import { setCookie, getCookie, deleteCookie, getAllCookies, clearAllCookies } from '../src/utils/cookie-utils';

describe('cookie-utils', () => {
  beforeEach(() => {
    document.cookie.split(';').forEach(c => {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.slice(0, eqPos) : c;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  test('set/get/delete cookie', () => {
    setCookie('foo', 'bar', 1);
    expect(getCookie('foo')).toBe('bar');
    deleteCookie('foo');
    expect(getCookie('foo')).toBeNull();
  });

  test('getAllCookies and clearAllCookies', () => {
    setCookie('a', '1', 1);
    setCookie('b', '2', 1);
    const all = getAllCookies();
    expect(all.a).toBe('1');
    expect(all.b).toBe('2');
    clearAllCookies();
    expect(getCookie('a')).toBeNull();
    expect(getCookie('b')).toBeNull();
  });
});


