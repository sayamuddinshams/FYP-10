import { db, emit } from '../data/store';
import { delay, fail } from './core';

const SESSION_KEY = 'rentlink.session';

function publicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export function saveSession(user) {
  db.session = user ? user.id : null;
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    else localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    /* storage unavailable — session stays in memory */
  }
}

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return db.users.find((u) => u.id === parsed.userId) || null;
  } catch (err) {
    return null;
  }
}

const authService = {
  /** Restore the signed-in user on app start. */
  async getSession() {
    await delay(150);
    const user = readSession();
    db.session = user?.id || null;
    return publicUser(user);
  },

  async login({ email, password, remember = true }) {
    await delay(700);
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized || !password) fail('Enter your email and password to continue.');

    const user = db.users.find((u) => u.email.toLowerCase() === normalized);
    if (!user) fail('Invalid credentials. Check your email and password and try again.');
    if (user.password !== password) fail('Invalid credentials. Check your email and password and try again.');
    if (user.status === 'suspended') fail('This account is suspended. Contact RentLink support for help.');

    saveSession(remember ? user : null);
    db.session = user.id;
    emit();
    return publicUser(user);
  },

  async signup({ name, email, password, confirmPassword, role }) {
    await delay(850);
    const normalized = String(email || '').trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalized)) fail('Email already exists. Try logging in instead.');
    if (password !== confirmPassword) fail('Passwords do not match.');

    const user = {
      id: `u_${Math.random().toString(36).slice(2, 9)}`,
      name: String(name).trim(),
      email: normalized,
      password,
      role: role === 'owner' ? 'owner' : 'tenant',
      phone: '',
      district: '',
      city: '',
      area: '',
      address: '',
      avatar: null,
      bio: '',
      joinedAt: new Date().toISOString().slice(0, 10),
      status: 'active',
      verification: role === 'owner' ? 'unverified' : 'pending',
      lastActivity: new Date().toISOString(),
      memberSince: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    };
    db.users.push(user);
    db.favorites[user.id] = [];
    saveSession(user);
    db.session = user.id;
    emit();
    return publicUser(user);
  },

  async loginWithGoogle() {
    await delay(900);
    const user = db.users.find((u) => u.email === 'ayesha.khan@example.com');
    saveSession(user);
    db.session = user.id;
    emit();
    return publicUser(user);
  },

  async forgotPassword({ email }) {
    await delay(800);
    const normalized = String(email || '').trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === normalized);
    if (!user) fail('No account found with that email address.');
    return { message: `Password reset link sent to ${normalized}.` };
  },

  async logout() {
    await delay(250);
    saveSession(null);
    db.session = null;
    emit();
  },

  currentUser() {
    return publicUser(readSession());
  },
};

export default authService;
