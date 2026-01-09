import { tokenStorage } from '../storage/tokenStorage';

export const createHttpClient = ({ apiBaseUrl }) => {
  const request = async (path, options = {}) => {
    const access = tokenStorage.getAccess();
    const refresh = tokenStorage.getRefresh();

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body)
      headers.set('Content-Type', 'application/json');
    if (access) headers.set('Authorization', `Bearer ${access}`);

    let res = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });

    if (res.status === 401 && refresh) {
      const refreshRes = await fetch(`${apiBaseUrl}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        tokenStorage.setAccess(data.access);

        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${data.access}`);

        res = await fetch(`${apiBaseUrl}${path}`, { ...options, headers: retryHeaders });
      } else {
        tokenStorage.clear();
      }
    }

    return res;
  };

  const json = async (path, options = {}) => {
    const res = await request(path, options);
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const msg =
        typeof body === 'string' ? body : body?.detail || body?.message || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  };

  return {
    get: (path) => json(path, { method: 'GET' }),
    post: (path, body) => json(path, { method: 'POST', body: JSON.stringify(body) }),
    del: (path) => json(path, { method: 'DELETE' }),
    request,
  };
};
