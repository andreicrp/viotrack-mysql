const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '');
let csrfToken = null;

const requestUrl = (path) => `${API_BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;

const readCsrfToken = async () => {
  const response = await fetch(requestUrl('/auth/csrf'), {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || typeof body?.csrfToken !== 'string') {
    throw new Error(body?.error || 'Unable to initialize a secure API request.');
  }
  csrfToken = body.csrfToken;
  return csrfToken;
};

const send = async (path, { method = 'GET', body, retryCsrf = true } = {}) => {
  const upperMethod = method.toUpperCase();
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(upperMethod)) {
    headers['X-CSRF-Token'] = csrfToken || await readCsrfToken();
  }

  const response = await fetch(requestUrl(path), {
    method: upperMethod,
    credentials: 'include',
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const responseBody = await response.json().catch(() => null);

  if (response.status === 403 && retryCsrf && !['GET', 'HEAD', 'OPTIONS'].includes(upperMethod)) {
    csrfToken = null;
    await readCsrfToken();
    return send(path, { method: upperMethod, body, retryCsrf: false });
  }

  if (!response.ok) {
    const error = new Error(responseBody?.error || `API request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return responseBody;
};

export const apiGet = (path) => send(path);
export const apiPost = (path, body) => send(path, { method: 'POST', body });
export const apiPatch = (path, body) => send(path, { method: 'PATCH', body });
export const apiDelete = (path) => send(path, { method: 'DELETE' });

export const apiPut = (path, body) => send(path, { method: 'PUT', body });
