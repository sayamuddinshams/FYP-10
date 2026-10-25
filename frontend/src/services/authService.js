import api from './api';
import { emit, fail } from './core';

const SESSION_KEY = 'rentlink.session';

export function saveSession(user) {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* storage unavailable */
  }
}

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const authService = {
  /** Restore and validate the signed-in user on app start via GET /api/auth/me */
  async getSession() {
    const token = api.getToken();
    if (!token) {
      saveSession(null);
      return null;
    }

    try {
      const data = await api.get('/auth/me');
      const user = data?.user || data;
      saveSession(user);
      return user;
    } catch (err) {
      // If token expired or invalid, clear local session
      api.setToken(null);
      saveSession(null);
      return null;
    }
  },

  /** Sign in with email and password */
  async login({ email, password, remember = true }) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized || !password) {
      fail('Enter your email and password to continue.');
    }

    const data = await api.post('/auth/login', {
      email: normalized,
      password,
    });

    const user = data.user;
    const token = data.token;

    if (token) {
      api.setToken(token);
    }
    saveSession(remember ? user : null);
    emit('auth');
    return user;
  },

  /** Register a new user */
  async signup({ name, email, password, confirmPassword, role }) {
    if (password !== confirmPassword) {
      fail('Passwords do not match.');
    }

    const data = await api.post('/auth/register', {
      name: String(name || '').trim(),
      email: String(email || '').trim().toLowerCase(),
      password,
      role: role === 'owner' ? 'owner' : 'tenant',
    });

    return data.user || data;
  },

  async loginWithGoogle() {
    try {
      return await api.post('/auth/google');
    } catch (err) {
      fail(err.message || 'Google Sign-In is unavailable. Please sign in with email/password.');
    }
  },

  async forgotPassword({ email }) {
    const normalized = String(email || '').trim().toLowerCase();
    return { message: `Password reset instructions have been sent to ${normalized}.` };
  },

  /** Update profile fields for current user */
  async updateProfile(profileData) {
    const data = await api.put('/auth/profile', profileData);
    const user = data.user || data;
    saveSession(user);
    emit('auth');
    return user;
  },

  /** Change password */
  async changePassword({ currentPassword, newPassword }) {
    return api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /** End session and purge tokens */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      api.setToken(null);
      saveSession(null);
      emit('auth');
    }
  },

  currentUser() {
    return readSession();
  },
};

export default authService;
