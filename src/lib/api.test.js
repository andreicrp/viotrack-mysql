import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiPost } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('API request initialization', () => {
  it('identifies a static-site response instead of treating it as a CSRF token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<html></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' }
        })
      )
    );

    await expect(apiPost('/auth/login', { email: 'admin@example.com', password: 'secret' }))
      .rejects.toMatchObject({
        message: expect.stringContaining('VITE_API_BASE_URL'),
        code: 'API_CSRF_INIT_FAILED',
        status: 200
      });
  });

  it('reports an unreachable API without disguising it as an authentication failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiPost('/auth/login', { email: 'admin@example.com', password: 'secret' }))
      .rejects.toMatchObject({
        message: expect.stringContaining('Unable to reach the API server')
      });
  });
});
