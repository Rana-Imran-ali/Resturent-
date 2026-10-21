// 3 Demo Customers for the Pakistani Restaurant Ordering Prototype

export const DEMO_CUSTOMERS = [
  {
    id: "cust-new",
    name: "Hamza Tariq",
    phone: "+92 301 5550192",
    address: "House 42, Street 8, Sector F-10/2, Islamabad",
    type: "new",
    tag: "First-time Customer",
    orderCount: 0,
    cancelledOrders: 0,
    trustScore: "Unknown",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    notes: "New account. Default COD verification may be recommended."
  },
  {
    id: "cust-regular",
    name: "Zainab Ahmed",
    phone: "+92 321 8884912",
    address: "Flat 304, Al-Razi Heights, Block M, Gulberg III, Lahore",
    type: "regular",
    tag: "VIP Loyal Regular",
    orderCount: 18,
    cancelledOrders: 0,
    trustScore: "99% High Trust",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    notes: "Orders weekly. Prefers mild spice and extra sauce."
  },
  {
    id: "cust-cancelled",
    name: "Ali Raza",
    phone: "+92 333 4441098",
    address: "Shop 12, Main Commercial Market, Satellite Town, Rawalpindi",
    type: "flagged",
    tag: "High Cancellation Risk",
    orderCount: 5,
    cancelledOrders: 4,
    trustScore: "20% High Risk",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face",
    notes: "Cancelled last 4 out of 5 orders at the doorstep. Requires manager confirmation."
  }
];
