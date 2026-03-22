const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TOKEN_KEY = 'cb_jay_auth_token';

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error || 'Request failed.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const authApi = {
  login(password) {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
  me() {
    return apiFetch('/auth/me');
  },
};

export const offeringsApi = {
  listActive() {
    return apiFetch('/public/offerings');
  },
  listAll() {
    return apiFetch('/offerings');
  },
  create(name) {
    return apiFetch('/offerings', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
  updateStatus(id, status) {
    return apiFetch(`/offerings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export const ratingsApi = {
  listAll() {
    return apiFetch('/ratings');
  },
  create(input) {
    return apiFetch('/public/ratings', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

