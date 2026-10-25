/**
 * Centralized REST API Client for RentLink
 * -----------------------------------------
 * Connects the React application directly to the Express + MongoDB backend.
 * Handles:
 *  - Configurable baseURL via VITE_API_BASE_URL
 *  - Automatic JWT Bearer authorization headers
 *  - Unified error handling & response parsing
 *  - Automatic session cleanup on 401 Unauthorized
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const TOKEN_KEY = 'rentlink_token';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // storage unavailable
    }
  }

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;
    const token = this.getToken();

    const headers = {
      Accept: 'application/json',
      ...options.headers,
    };

    // If body is NOT FormData, set JSON content type
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    let body = options.body;
    if (body && typeof body === 'object' && !isFormData) {
      body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body,
      });

      let json = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          json = await response.json();
        } catch {
          json = null;
        }
      }

      if (!response.ok) {
        // If unauthorized, clear stored token
        if (response.status === 401) {
          this.setToken(null);
        }

        const errorMessage = json?.message || json?.error || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.errors = json?.errors || null;
        throw error;
      }

      // If backend wrapped in { success: true, data: ... }, unwrap data
      if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
      }

      return json;
    } catch (err) {
      // Re-throw with consistent message
      if (!err.status && err.name === 'TypeError' && err.message.includes('fetch')) {
        const connErr = new Error('Cannot connect to backend server. Ensure Express API is running on ' + this.baseURL);
        connErr.status = 0;
        throw connErr;
      }
      throw err;
    }
  }

  get(endpoint, params = {}, options = {}) {
    const qs = new URLSearchParams();
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qs.append(k, String(v));
        }
      });
    }
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return this.request(`${endpoint}${query}`, {
      method: 'GET',
      ...options,
    });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
      ...options,
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
      ...options,
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body,
      ...options,
    });
  }

  delete(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      body,
      ...options,
    });
  }
}

export const api = new ApiClient();
export default api;
