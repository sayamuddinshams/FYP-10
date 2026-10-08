export const MOCK_NOTIFICATIONS = [
  // Tenant — Ayesha (u1)
  { id: 'n1', userId: 'u1', type: 'visit_approved', title: 'Visit approved', body: 'Karim Builders & Estates approved your visit to Modern 3-Bedroom Family House in Jutial.', at: '2026-10-06T08:42:00', read: false, link: '/tenant/visits' },
  { id: 'n2', userId: 'u1', type: 'message', title: 'New message', body: 'Hunza Heritage Homes replied to your message about Furnished Apartment with Hunza Valley View.', at: '2026-10-06T08:42:00', read: false, link: '/tenant/messages' },
  { id: 'n3', userId: 'u1', type: 'visit_rescheduled', title: 'Visit rescheduled', body: 'Your visit to Ready-to-Move Office Space on Kargil Road moved to 10 October, 2:00 PM.', at: '2026-10-04T12:10:00', read: false, link: '/tenant/visits' },
  { id: 'n4', userId: 'u1', type: 'property_update', title: 'Price drop on a saved property', body: 'Girls Hostel Rooms with Meals, Sultanabad is now listed at Rs 17,500 per month.', at: '2026-10-03T18:00:00', read: true, link: '/property/p4' },
  { id: 'n5', userId: 'u1', type: 'visit_rejected', title: 'Visit request declined', body: 'The owner declined your request for Spacious 4-Bedroom House with Garden, Konodas — it has been rented.', at: '2026-09-07T09:00:00', read: true, link: '/tenant/visits' },
  { id: 'n6', userId: 'u1', type: 'system', title: 'Welcome to RentLink', body: 'Complete your profile with a phone number to receive faster replies from owners.', at: '2026-10-01T09:00:00', read: true, link: '/tenant/profile' },

  // Tenant — Bilal (u2)
  { id: 'n7', userId: 'u2', type: 'visit_rescheduled', title: 'Visit rescheduled', body: 'Deosai Property Group moved your office visit to 10 October, 2:00 PM.', at: '2026-10-04T12:10:00', read: false, link: '/tenant/visits' },
  { id: 'n8', userId: 'u2', type: 'message', title: 'New message', body: 'Deosai Property Group shared the 12-month lease terms with you.', at: '2026-10-04T12:40:00', read: false, link: '/tenant/messages' },
  { id: 'n9', userId: 'u2', type: 'visit_approved', title: 'Visit approved', body: 'Hunza Heritage Homes approved your visit to Family House with Mountain View, Aliabad.', at: '2026-09-17T10:30:00', read: true, link: '/tenant/visits' },

  // Tenant — Fatima (u3)
  { id: 'n10', userId: 'u3', type: 'visit_pending', title: 'Visit request sent', body: 'Your visit request for Luxury 5-Bedroom House with Servant Quarter, Barmas is awaiting owner response.', at: '2026-10-06T09:05:00', read: false, link: '/tenant/visits' },
  { id: 'n11', userId: 'u3', type: 'property_update', title: 'New listing in Skardu', body: 'A serviced 2-bedroom flat in Gamba Skardu was added near your search area.', at: '2026-10-05T11:00:00', read: true, link: '/property/p13' },

  // Tenant — Imran (u4)
  { id: 'n12', userId: 'u4', type: 'visit_approved', title: 'Visit approved', body: 'Karim Builders & Estates approved your hostel visit for 12 October, 5:00 PM.', at: '2026-10-04T08:15:00', read: false, link: '/tenant/visits' },
  { id: 'n13', userId: 'u4', type: 'message', title: 'New message', body: 'Raza Ali asked whether you would like to bring a study desk.', at: '2026-10-06T07:55:00', read: false, link: '/tenant/messages' },

  // Owner — Karim Builders (u6)
  { id: 'n14', userId: 'u6', type: 'listing_approved', title: 'Listing approved', body: 'Luxury 5-Bedroom House with Servant Quarter, Barmas is now live on RentLink.', at: '2026-10-02T14:00:00', read: false, link: '/owner/properties' },
  { id: 'n15', userId: 'u6', type: 'visit_request', title: 'New visit request', body: 'Ayesha Khan requested a visit to Modern 3-Bedroom Family House in Jutial on 14 October, 3:00 PM.', at: '2026-10-05T14:02:00', read: false, link: '/owner/visits' },
  { id: 'n16', userId: 'u6', type: 'visit_request', title: 'New visit request', body: 'Fatima Noor requested a walkthrough of Luxury 5-Bedroom House, Barmas on 18 October.', at: '2026-10-06T09:05:00', read: false, link: '/owner/visits' },
  { id: 'n17', userId: 'u6', type: 'message', title: 'New message', body: 'Ayesha Khan asked if the rent is negotiable for a two-year lease.', at: '2026-10-05T14:35:00', read: true, link: '/owner/messages' },
  { id: 'n18', userId: 'u6', type: 'listing_changes', title: 'Changes requested', body: 'Admin requested clearer photos for Family House, Sonikot before review can continue.', at: '2026-10-05T16:20:00', read: true, link: '/owner/properties' },
  { id: 'n19', userId: 'u6', type: 'fee_update', title: 'Platform fee update', body: 'The platform fee remains 5% of the rental amount for the 2026–27 financial year.', at: '2026-09-30T10:00:00', read: true, link: '/owner/earnings' },
  { id: 'n20', userId: 'u6', type: 'system', title: 'Verification renewed', body: 'Your owner verification was renewed successfully and is valid until October 2027.', at: '2026-09-15T09:00:00', read: true, link: '/owner/profile' },

  // Owner — Hunza Heritage (u7)
  { id: 'n21', userId: 'u7', type: 'listing_approved', title: 'Listing approved', body: 'Ground-Floor Retail Shop near Aliabad Bazaar is now live.', at: '2026-10-02T11:30:00', read: false, link: '/owner/properties' },
  { id: 'n22', userId: 'u7', type: 'visit_request', title: 'New visit request', body: 'Sana Riaz requested a visit to Ground-Floor Retail Shop near Aliabad Bazaar.', at: '2026-09-30T11:00:00', read: false, link: '/owner/visits' },
  { id: 'n23', userId: 'u7', type: 'message', title: 'New message', body: 'Ayesha Khan confirmed the Saturday visit for the Karimabad apartment.', at: '2026-10-06T08:35:00', read: false, link: '/owner/messages' },
  { id: 'n24', userId: 'u7', type: 'listing_changes', title: 'Changes requested', body: 'Admin requested four clear room photos for Winter Hostel Rooms, Gulmit.', at: '2026-10-02T09:45:00', read: true, link: '/owner/properties' },

  // Owner — Deosai (u8)
  { id: 'n25', userId: 'u8', type: 'visit_request', title: 'New visit request', body: 'Bilal Ahmad requested a visit to Ready-to-Move Office Space, Skardu.', at: '2026-10-01T16:45:00', read: false, link: '/owner/visits' },
  { id: 'n26', userId: 'u8', type: 'listing_pending', title: 'Listing submitted', body: 'Commercial Showroom on Skardu Airport Road is queued for admin review.', at: '2026-10-05T10:00:00', read: false, link: '/owner/properties' },
  { id: 'n27', userId: 'u8', type: 'system', title: 'Verification pending', body: 'Your owner verification is still under review. Complete it to unlock priority listing placement.', at: '2026-09-28T15:00:00', read: true, link: '/owner/profile' },

  // Owner — Raza (u9)
  { id: 'n28', userId: 'u9', type: 'listing_suspended', title: 'Listing suspended', body: 'Office Rooms in Danyore Business Centre was suspended pending document re-verification.', at: '2026-09-27T13:00:00', read: false, link: '/owner/properties' },
  { id: 'n29', userId: 'u9', type: 'visit_request', title: 'New visit request', body: 'Imran Shah requested a visit to Quiet Single Room for Students, Danyore.', at: '2026-10-06T07:50:00', read: false, link: '/owner/visits' },

  // Admin (u11)
  { id: 'n30', userId: 'u11', type: 'listing_pending', title: '3 listings awaiting review', body: 'Commercial Showroom, Serviced Hostel Beds and Lakeside Apartment are queued for review.', at: '2026-10-06T07:00:00', read: false, link: '/admin/properties' },
  { id: 'n31', userId: 'u11', type: 'report', title: 'New report received', body: 'A tenant reported a misleading listing price on a Skardu apartment.', at: '2026-10-05T19:20:00', read: false, link: '/admin/reports' },
  { id: 'n32', userId: 'u11', type: 'system', title: 'Weekly payout batch completed', body: 'Rs 1,284,500 was released to 14 owners in the weekly payout batch.', at: '2026-10-04T06:00:00', read: true, link: '/admin/transactions' },
];
