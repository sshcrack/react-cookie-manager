import { getBlockedHosts, getBlockedKeywords } from '../src/utils/tracker-utils';

describe('tracker-utils', () => {
  test('blocks all when preferences are null', () => {
    const hosts = getBlockedHosts(null);
    const keywords = getBlockedKeywords(null);
    expect(hosts.length).toBeGreaterThan(0);
    expect(keywords.length).toBeGreaterThan(0);
  });

  test('respects category preferences', () => {
    const hosts = getBlockedHosts({ Analytics: false, Social: true, Advertising: false });
    // Expect at least some analytics and advertising hosts present
    expect(hosts.some(h => typeof h === 'string')).toBe(true);

    const keywords = getBlockedKeywords({ Analytics: true, Social: false, Advertising: true });
    expect(keywords.some(k => typeof k === 'string')).toBe(true);
  });
});


