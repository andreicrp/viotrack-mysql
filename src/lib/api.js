const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '');
let csrfToken = null;

const requestUrl = (path) => `${API_BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;

const fetchApi = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error(
      `Unable to reach the API server. Check that it is running and, for a separately hosted frontend, set VITE_API_BASE_URL to the API origin and allow this site in FRONTEND_ORIGINS.`
    );
  }
};

const readCsrfToken = async () => {
  const response = await fetchApi(requestUrl('/auth/csrf'), {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;
  if (!response.ok || typeof body?.csrfToken !== 'string') {
    const error = new Error(
      body?.error ||
        'The API did not return a CSRF token. Check that VITE_API_BASE_URL points to the API server and that the API is running.'
    );
    error.status = response.status;
    error.code = 'API_CSRF_INIT_FAILED';
    throw error;
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

  const response = await fetchApi(requestUrl(path), {
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
