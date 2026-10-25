export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'office', label: 'Office' },
  { value: 'commercial', label: 'Commercial Space' },
];

export const PROPERTY_TYPE_MAP = Object.fromEntries(PROPERTY_TYPES.map((t) => [t.value, t.label]));

export function propertyTypeLabel(value) {
  return PROPERTY_TYPE_MAP[value] || value || '–';
}

export const AMENITIES = [
  { value: 'parking', label: 'Parking' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'heating', label: 'Heating' },
  { value: 'internet', label: 'Internet' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'security', label: 'Security' },
];

export const AMENITY_MAP = Object.fromEntries(AMENITIES.map((a) => [a.value, a.label]));

export const FURNISHING_OPTIONS = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];

export const VISIT_STATUSES = ['pending', 'approved', 'rescheduled', 'completed', 'rejected'];

export const VISIT_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rescheduled: 'Rescheduled',
  completed: 'Completed',
  rejected: 'Rejected',
};

export const LISTING_STATUSES = ['draft', 'pending', 'approved', 'rejected', 'changes', 'suspended'];

export const LISTING_STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes: 'Changes Requested',
  suspended: 'Suspended',
};

export const USER_ROLES = {
  tenant: 'Tenant',
  owner: 'Owner / Agent',
  admin: 'Admin',
};

export const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

export const PRICE_RANGES = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under Rs 15,000', min: 0, max: 15000 },
  { label: 'Rs 15,000 – 30,000', min: 15000, max: 30000 },
  { label: 'Rs 30,000 – 60,000', min: 30000, max: 60000 },
  { label: 'Rs 60,000 – 120,000', min: 60000, max: 120000 },
  { label: 'Above Rs 120,000', min: 120000, max: Infinity },
];

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export const PLATFORM_FEE_RATE = 0.05;

export const DEMO_ACCOUNTS = [
  { role: 'tenant', name: 'Karim Ali', email: 'tenant@rentlink.pk' },
  { role: 'owner', name: 'Hunza Heritage Homes', email: 'owner@rentlink.pk' },
  { role: 'admin', name: 'RentLink Admin', email: 'admin@rentlink.pk' },
];
