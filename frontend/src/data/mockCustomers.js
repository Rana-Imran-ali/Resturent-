// Mock Pakistani demo customers for testing personas and risk engine

export const DEMO_CUSTOMERS = [
  {
    id: 'c1',
    name: 'Hamza Khan',
    phone: '0300-1234567',
    address: 'House 42, Street 8, F-7/2, Islamabad',
    cancelCount: 0,
    totalOrders: 14,
    badge: 'Loyal VIP'
  },
  {
    id: 'c2',
    name: 'Zainab Ahmed',
    phone: '0321-9876543',
    address: 'Flat 304, Al-Razi Heights, Gulberg III, Lahore',
    cancelCount: 1,
    totalOrders: 6,
    badge: 'Regular'
  },
  {
    id: 'c3',
    name: 'Ali Raza (High Cancellation Risk)',
    phone: '0333-5551234',
    address: 'Shop 12, Main Commercial Market, Rawalpindi',
    cancelCount: 4,
    totalOrders: 5,
    badge: 'High Risk'
  },
  {
    id: 'c4',
    name: 'Bilal Tariq (First Time Customer)',
    phone: '0345-8889900',
    address: 'Sector G-11/3, Islamabad',
    cancelCount: 0,
    totalOrders: 0,
    badge: 'New Guest'
  }
];
