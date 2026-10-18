import { db, emit, getUser } from '../data/store';
import { delay, fail, createNotification } from './core';

function decorate(visit) {
  const property = db.properties.find((p) => p.id === visit.propertyId);
  const tenant = getUser(visit.tenantId);
  const owner = getUser(visit.ownerId);
  return {
    ...visit,
    property: property ? { id: property.id, title: property.title, image: property.images?.[0], price: property.price, district: property.district, city: property.city, area: property.area, location: `${property.area}, ${property.city}` } : null,
    tenant: tenant ? { id: tenant.id, name: tenant.name, email: tenant.email, phone: tenant.phone, verification: tenant.verification } : null,
    owner: owner ? { id: owner.id, name: owner.name, verification: owner.verification } : null,
  };
}

const visitService = {
  async listByTenant(tenantId, status) {
    await delay(340);
    let items = db.visits.filter((v) => v.tenantId === tenantId);
    if (status && status !== 'all') items = items.filter((v) => v.status === status);
    items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return items.map(decorate);
  },

  async listByOwner(ownerId, status) {
    await delay(340);
    let items = db.visits.filter((v) => v.ownerId === ownerId);
    if (status && status !== 'all') items = items.filter((v) => v.status === status);
    items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return items.map(decorate);
  },

  async listAll(status) {
    await delay(400);
    let items = [...db.visits];
    if (status && status !== 'all') items = items.filter((v) => v.status === status);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return items.map(decorate);
  },

  async create({ propertyId, tenantId, date, time, message }) {
    await delay(750);
    const property = db.properties.find((p) => p.id === propertyId);
    if (!property) fail('Property not found.');
    if (!tenantId) fail('Sign in to request a visit.');

    const visit = {
      id: `v_${Math.random().toString(36).slice(2, 9)}`,
      propertyId,
      tenantId,
      ownerId: property.ownerId,
      date,
      time,
      status: 'pending',
      message: message || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.visits.unshift(visit);

    createNotification({
      userId: property.ownerId,
      type: 'visit_request',
      title: 'New visit request',
      body: `${getUser(tenantId)?.name || 'A tenant'} requested a visit to ${property.title} on ${date} at ${time}.`,
      link: '/owner/visits',
    });
    emit();
    return decorate(visit);
  },

  async updateStatus(id, status, note = '') {
    await delay(520);
    const visit = db.visits.find((v) => v.id === id);
    if (!visit) fail('Visit request not found.');
    visit.status = status;
    visit.updatedAt = new Date().toISOString();
    if (note) visit.ownerNote = note;

    const property = db.properties.find((p) => p.id === visit.propertyId);
    const messages = {
      approved: `Your visit to ${property?.title || 'the property'} has been approved.`,
      rejected: `Your visit to ${property?.title || 'the property'} was declined by the owner.`,
      rescheduled: `Your visit to ${property?.title || 'the property'} has been rescheduled.${note ? ` ${note}` : ''}`,
      completed: `Your visit to ${property?.title || 'the property'} is marked as completed.`,
      pending: `Your visit request to ${property?.title || 'the property'} is pending.`,
    };
    const titles = {
      approved: 'Visit approved',
      rejected: 'Visit rejected',
      rescheduled: 'Visit rescheduled',
      completed: 'Visit completed',
      pending: 'Visit request updated',
    };
    createNotification({
      userId: visit.tenantId,
      type: `visit_${status}`,
      title: titles[status] || 'Visit updated',
      body: messages[status] || 'Your visit request was updated.',
      link: '/tenant/visits',
    });
    emit();
    return decorate(visit);
  },

  async reschedule(id, { date, time, note }) {
    await delay(520);
    const visit = db.visits.find((v) => v.id === id);
    if (!visit) fail('Visit request not found.');
    visit.status = 'rescheduled';
    visit.date = date;
    visit.time = time;
    visit.updatedAt = new Date().toISOString();
    if (note) visit.ownerNote = note;

    const property = db.properties.find((p) => p.id === visit.propertyId);
    createNotification({
      userId: visit.tenantId,
      type: 'visit_rescheduled',
      title: 'Visit rescheduled',
      body: `Your visit to ${property?.title || 'the property'} moved to ${date} at ${time}.`,
      link: '/tenant/visits',
    });
    emit();
    return decorate(visit);
  },
};

export default visitService;
