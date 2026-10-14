export const MOCK_CONVERSATIONS = [
  {
    id: 'c1',
    propertyId: 'p2',
    participants: ['u1', 'u7'],
    unread: { u1: 1, u7: 0 },
    updatedAt: '2026-10-06T08:42:00',
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Salam, is the Karimabad apartment still available for a six-month lease?', at: '2026-10-05T17:20:00' },
      { id: 'm2', senderId: 'u7', text: 'Walaikum salam. Yes, it is available from 20 October. Furnished as shown in the photos.', at: '2026-10-05T17:34:00' },
      { id: 'm3', senderId: 'u1', text: 'Great. Does the rent include internet, or is that separate?', at: '2026-10-05T17:41:00' },
      { id: 'm4', senderId: 'u7', text: 'Internet is separate: about Rs 2,500 per month with the local fibre provider. Heating fuel is also separate.', at: '2026-10-05T18:02:00' },
      { id: 'm5', senderId: 'u1', text: 'Understood. I have requested a visit for Saturday at 11am.', at: '2026-10-06T08:35:00' },
      { id: 'm6', senderId: 'u7', text: 'Confirmed, see you Saturday at 11am. Bring your CNIC for the building register.', at: '2026-10-06T08:42:00' },
    ],
  },
  {
    id: 'c2',
    propertyId: 'p1',
    participants: ['u1', 'u6'],
    unread: { u1: 0, u6: 1 },
    updatedAt: '2026-10-05T14:35:00',
    messages: [
      { id: 'm7', senderId: 'u1', text: 'Hello, I submitted a visit request for the Jutial house on the 14th.', at: '2026-10-05T14:10:00' },
      { id: 'm8', senderId: 'u6', text: 'Received, thank you. The house is available after 2pm. 3pm works on our side.', at: '2026-10-05T14:28:00' },
      { id: 'm9', senderId: 'u6', text: 'Is the rent negotiable for a two-year lease?', at: '2026-10-05T14:35:00' },
    ],
  },
  {
    id: 'c3',
    propertyId: 'p4',
    participants: ['u1', 'u6'],
    unread: { u1: 0, u6: 0 },
    updatedAt: '2026-09-29T12:15:00',
    messages: [
      { id: 'm10', senderId: 'u1', text: 'Thank you for showing us the hostel yesterday. My sister liked the room.', at: '2026-09-29T11:50:00' },
      { id: 'm11', senderId: 'u6', text: 'Glad to hear it. The admission form is attached to the visit notes. We can hold room 6 until Friday.', at: '2026-09-29T12:04:00' },
      { id: 'm12', senderId: 'u1', text: 'Perfect, we will confirm by Thursday.', at: '2026-09-29T12:15:00' },
    ],
  },
  {
    id: 'c4',
    propertyId: 'p5',
    participants: ['u2', 'u8'],
    unread: { u2: 2, u8: 0 },
    updatedAt: '2026-10-04T12:40:00',
    messages: [
      { id: 'm13', senderId: 'u2', text: 'We are a travel agency from Hunza. Can the office be leased for 12 months upfront?', at: '2026-10-03T09:15:00' },
      { id: 'm14', senderId: 'u8', text: 'Yes, a 12-month lease gets you one month free. Parking bays are included.', at: '2026-10-03T10:20:00' },
      { id: 'm15', senderId: 'u8', text: 'I have also moved your visit to 10 October, 2pm, as maintenance is on the 9th.', at: '2026-10-04T12:40:00' },
    ],
  },
  {
    id: 'c5',
    propertyId: 'p3',
    participants: ['u4', 'u9'],
    unread: { u4: 1, u9: 0 },
    updatedAt: '2026-10-06T07:55:00',
    messages: [
      { id: 'm16', senderId: 'u4', text: 'Is the Danyore room still free for the spring term?', at: '2026-10-05T19:30:00' },
      { id: 'm17', senderId: 'u9', text: 'Yes, available from 10 October. Rent includes electricity and water.', at: '2026-10-05T20:02:00' },
      { id: 'm18', senderId: 'u4', text: 'Can I bring a small study desk?', at: '2026-10-06T07:55:00' },
    ],
  },
  {
    id: 'c6',
    propertyId: 'p13',
    participants: ['u3', 'u8'],
    unread: { u3: 0, u8: 0 },
    updatedAt: '2026-10-02T16:20:00',
    messages: [
      { id: 'm19', senderId: 'u3', text: 'The flat worked perfectly for my posting. Sending the keys back tomorrow.', at: '2026-10-02T15:40:00' },
      { id: 'm20', senderId: 'u8', text: 'Thank you, Fatima. Your deposit will be released within three working days.', at: '2026-10-02T16:20:00' },
    ],
  },
];

export const MOCK_MESSAGES_ERROR_TEXT = 'Message could not be sent. Please try again.';
