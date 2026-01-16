import { createHttpClient } from './httpClient';
import { tokenStorage } from '../storage/tokenStorage';

jest.mock('../storage/tokenStorage', () => ({
  tokenStorage: {
    getAccess: jest.fn(),
    getRefresh: jest.fn(),
    setAccess: jest.fn(),
    clear: jest.fn(),
  },
}));

function mockFetchResponse({ ok = true, status = 200, headers = {}, json, text } = {}) {
  return {
    ok,
    status,
    headers: {
      get: (k) => {
        const key = String(k).toLowerCase();
        return headers[key] ?? headers[k] ?? null;
      },
    },
    json: json ? jest.fn().mockResolvedValue(json) : jest.fn(),
    text: text ? jest.fn().mockResolvedValue(text) : jest.fn(),
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

test('adds Content-Type when body is present and adds Authorization when access token exists', async () => {
  tokenStorage.getAccess.mockReturnValue('ACCESS');
  tokenStorage.getRefresh.mockReturnValue(null);

  global.fetch.mockResolvedValueOnce(
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: { ok: true },
    }),
  );

  const http = createHttpClient({ apiBaseUrl: 'https://api.example.com' });
  const result = await http.post('/things', { a: 1 });

  expect(result).toEqual({ ok: true });

  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [url, options] = global.fetch.mock.calls[0];

  expect(url).toBe('https://api.example.com/things');
  expect(options.method).toBe('POST');
  expect(options.body).toBe(JSON.stringify({ a: 1 }));

  // headers is a real Headers instance (from JSDOM)
  expect(options.headers.get('Content-Type')).toBe('application/json');
  expect(options.headers.get('Authorization')).toBe('Bearer ACCESS');
});

test('does not override Content-Type if already provided', async () => {
  tokenStorage.getAccess.mockReturnValue(null);
  tokenStorage.getRefresh.mockReturnValue(null);

  global.fetch.mockResolvedValueOnce(
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: { ok: true },
    }),
  );

  const http = createHttpClient({ apiBaseUrl: 'https://api.example.com' });

  await http.request('/x', {
    method: 'POST',
    body: JSON.stringify({ a: 1 }),
    headers: { 'Content-Type': 'text/plain' },
  });

  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.get('Content-Type')).toBe('text/plain');
});

test('json(): returns text when response content-type is not json', async () => {
  tokenStorage.getAccess.mockReturnValue(null);
  tokenStorage.getRefresh.mockReturnValue(null);

  global.fetch.mockResolvedValueOnce(
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: { 'content-type': 'text/plain' },
      text: 'HELLO',
    }),
  );

  const http = createHttpClient({ apiBaseUrl: 'https://api.example.com' });
  const result = await http.get('/hello');

  expect(result).toBe('HELLO');
});

test('json(): throws error with detail/message/string body when response is not ok', async () => {
  tokenStorage.getAccess.mockReturnValue(null);
  tokenStorage.getRefresh.mockReturnValue(null);

  global.fetch.mockResolvedValueOnce(
    mockFetchResponse({
      ok: false,
      status: 400,
      headers: { 'content-type': 'application/json' },
      json: { detail: 'Bad Request' },
    }),
  );

  const http = createHttpClient({ apiBaseUrl: 'https://api.example.com' });

  await expect(http.get('/fail')).rejects.toMatchObject({
    message: 'Bad Request',
    status: 400,
    body: { detail: 'Bad Request' },
  });
});

test('request(): on 401 with refresh token, refreshes, stores new access, and retries original request', async () => {
  tokenStorage.getAccess.mockReturnValue('OLD_ACCESS');
  tokenStorage.getRefresh.mockReturnValue('REFRESH');

  // 1) first request => 401
  global.fetch.mockResolvedValueOnce(
    mockFetchResponse({
      ok: false,
      status: 401,
      headers: { 'content-type': 'text/plain' },
      text: 'unauthorized',
    }),
  );

  // 2) refresh request => ok with new token
  global.fetch.mockResolvedValueOnce(
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: { access: 'NEW_ACCESS' },
    }),
  );

  // 3) retry original request => 200
  global.fetch.mockResolvedValueOnce(
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: { ok: true },
    }),
  );

  const http = createHttpClient({ apiBaseUrl: 'https://api.example.com' });
  const res = await http.request('/protected', { method: 'GET' });

  expect(res.ok).toBe(true);
  expect(global.fetch).toHaveBeenCalledTimes(3);

  // Refresh call
  expect(global.fetch.mock.calls[1][0]).toBe('https://api.example.com/token/refresh/');
  expect(global.fetch.mock.calls[1][1]).toMatchObject({ method: 'POST' });

  expect(tokenStorage.setAccess).toHaveBeenCalledWith('NEW_ACCESS');

  // Retry call should have new Authorization header
  const retryOptions = global.fetch.mock.calls[2][1];
  expect(retryOptions.headers.get('Authorization')).toBe('Bearer NEW_ACCESS');
});

test('request(): on 401 when refresh fails, clears token storage and does not retry', async () => {
  tokenStorage.getAccess.mockReturnValue('ACCESS');
  tokenStorage.getRefresh.mockReturnValue('REFRESH');

  // 1) first request => 401
  global.fetch.mockResolvedValueOnce(mockFetchResponse({ ok: false, status: 401 }));

  // 2) refresh request => not ok
  global.fetch.mockResolvedValueOnce(mockFetchResponse({ ok: false, status: 400 }));

  const http = createHttpClient({ apiBaseUrl: 'https://api.example.com' });
  const res = await http.request('/protected', { method: 'GET' });

  expect(res.status).toBe(401);
  expect(tokenStorage.clear).toHaveBeenCalledTimes(1);

  // Only 2 calls: original + refresh (no retry)
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
