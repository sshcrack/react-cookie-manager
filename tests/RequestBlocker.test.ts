import { blockTrackingRequests, restoreOriginalRequests } from '../src/utils/cookie-blocking';

describe('request-blocker', () => {
  afterEach(() => {
    restoreOriginalRequests();
  });

  test('blocks fetch requests to blocked hosts', async () => {
    blockTrackingRequests(['blocked.example']);
    const res = await fetch('https://blocked.example/script.js');
    expect(res.status).toBe(403);
  });

  test('allows fetch requests to other hosts', async () => {
    blockTrackingRequests(['blocked.example']);
    const original = globalThis.fetch;
    // mock original fetch to return 200 for non-blocked
    // @ts-expect-error - assigning mock
    globalThis.fetch = () => Promise.resolve(new Response('ok', { status: 200 }));
    const res = await fetch('https://good.example/script.js');
    expect(res.status).toBe(200);
    globalThis.fetch = original;
  });
});


