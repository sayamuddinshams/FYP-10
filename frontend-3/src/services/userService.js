import { db, emit } from '../data/store';
import { createNotification, delay, fail } from './core';

function decorate(user) {
  const { password, ...rest } = user;
  const properties = db.properties.filter((p) => p.ownerId === user.id);
  return {
    ...rest,
    propertyCount: properties.length,
    approvedCount: properties.filter((p) => p.status === 'approved').length,
  };
}

const userService = {
  async list({ role, status, query = '', page = 1, limit = 8 } = {}) {
    await delay(360);
    let items = db.users.map(decorate);
    if (role && role !== 'all') items = items.filter((u) => u.role === role);
    if (status && status !== 'all') items = items.filter((u) => u.status === status);
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((u) => [u.name, u.email, u.city, u.district].join(' ').toLowerCase().includes(q));
    }
    items.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    const total = items.length;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit).map((u) => ({ ...u, password: undefined })), total, page, pages: Math.max(1, Math.ceil(total / limit)) };
  },

  async listOwners() {
    await delay(360);
    const owners = db.users.filter((u) => u.role === 'owner').map(decorate);
    owners.sort((a, b) => (a.verification === 'verified' ? -1 : 1) - (b.verification === 'verified' ? -1 : 1) || new Date(b.joinedAt) - new Date(a.joinedAt));
    return owners;
  },

  async getById(id) {
    await delay(240);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');
    return decorate(user);
  },

  async updateProfile(id, data) {
    await delay(500);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');
    Object.assign(user, data);
    emit();
    return decorate(user);
  },

  async setStatus(id, status) {
    await delay(420);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');
    if (user.role === 'admin') fail('Admin accounts cannot be suspended.');
    user.status = status;
    emit();
    return decorate(user);
  },

  async setVerification(id, verification, notes = '') {
    await delay(440);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');
    user.verification = verification;
    if (verification === 'verified') {
      user.nadraStatus = 'nadra_verified';
      user.verifiedAt = new Date().toISOString();
      createNotification({
        userId: id,
        type: 'system',
        title: 'Identity verified successfully',
        body: 'Your identity and CNIC documents have been approved by RentLink administration. Your listings now feature the Verified Owner badge.',
        link: '/owner/profile',
      });
    } else if (verification === 'rejected') {
      user.nadraStatus = 'rejected';
      user.verificationNotes = notes || 'Verification documents were rejected. Please review your details and re-upload.';
      createNotification({
        userId: id,
        type: 'system',
        title: 'Verification documents rejected',
        body: notes || 'Your CNIC submission could not be verified. Please visit your profile to re-submit clear documents.',
        link: '/owner/profile',
      });
    }
    emit();
    return decorate(user);
  },

  async submitCnicVerification(id, { cnic, cnicName, cnicDob, cnicExpiry, cnicLifetime = false, cnicFront, cnicBack }) {
    await delay(650);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');

    if (!cnic) fail('Please provide a valid 13-digit CNIC number.');
    if (!cnicFront) fail('Please upload a clear photo of the front side of your CNIC.');
    if (!cnicBack) fail('Please upload a clear photo of the back side of your CNIC.');

    const trackingId = `NADRA-PK-${Math.floor(100000 + Math.random() * 900000)}`;

    user.cnic = cnic.trim();
    user.cnicName = (cnicName || user.name || '').trim();
    user.cnicDob = cnicDob || '';
    user.cnicExpiry = cnicLifetime ? 'Lifetime' : (cnicExpiry || '');
    user.cnicLifetime = Boolean(cnicLifetime);
    user.cnicFront = cnicFront;
    user.cnicBack = cnicBack;
    user.verification = 'pending';
    user.nadraStatus = 'pending_sync';
    user.nadraTrackingId = trackingId;
    user.verificationSubmittedAt = new Date().toISOString();
    user.verificationNotes = '';

    createNotification({
      userId: id,
      type: 'system',
      title: 'CNIC queued for NADRA database verification',
      body: `Your CNIC (${cnic}) has been submitted under tracking ${trackingId}. It is queued for NADRA registry match and admin approval.`,
      link: '/owner/profile',
    });

    emit();
    return decorate(user);
  },

  async simulateNadraSync(id, approve = true, reason = '') {
    await delay(700);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');

    if (!user.cnic) fail('No CNIC submitted for this user yet.');

    if (approve) {
      user.verification = 'verified';
      user.nadraStatus = 'nadra_verified';
      user.verifiedAt = new Date().toISOString();
      user.verificationNotes = 'Verified against NADRA National Database registry.';
      createNotification({
        userId: id,
        type: 'system',
        title: 'NADRA Sync Verified',
        body: `CNIC ${user.cnic} was matched and verified against the NADRA database. Your account has received verified landlord status.`,
        link: '/owner/profile',
      });
    } else {
      user.verification = 'rejected';
      user.nadraStatus = 'rejected';
      user.verificationNotes = reason || 'CNIC details could not be authenticated against the NADRA database.';
      createNotification({
        userId: id,
        type: 'system',
        title: 'NADRA Verification Failed',
        body: reason || 'NADRA registry cross-reference failed. Please review your CNIC details and submit again.',
        link: '/owner/profile',
      });
    }

    emit();
    return decorate(user);
  },
};

export default userService;
