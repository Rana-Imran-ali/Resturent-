import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MENU_ITEMS } from '../data/menu';
import { DEMO_CUSTOMERS } from '../data/customers';
import api from '../services/api';

const AppContext = createContext(null);

/**
 * Web Audio API synthesizer for instant pleasant chime
 */
export function playOrderNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch (err) {
    console.warn('Audio playback note:', err);
  }
}

// Initial fallback seed orders
const INITIAL_ORDERS = [
  {
    id: 1,
    order_number: "#PK-101",
    orderNumber: "#PK-101",
    customer_name: "Zainab Ahmed",
    customer_phone: "+92 300 1234567",
    delivery_address: "Flat 304, Al-Razi Heights, Block M, Gulberg III, Lahore",
    customer: {
      id: "cust-1",
      name: "Zainab Ahmed",
      phone: "+92 300 1234567",
      address: "Flat 304, Al-Razi Heights, Block M, Gulberg III, Lahore",
      type: "regular",
      tag: "Regular Customer",
      trustScore: 96,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
    },
    items: [
      { id: "deal1", item_code: "deal1", name: "Midnight Zinger Feast (Deal 1)", quantity: 1, price: 699, modifiers: ["Chilled Pepsi"] },
      { id: "s2", item_code: "s2", name: "Fiery Buffalo Hot Wings (6 Pcs)", quantity: 1, price: 390, modifiers: ["Spicy"] }
    ],
    subtotal: 1089,
    delivery_fee: 150,
    deliveryFee: 150,
    grand_total: 1239,
    grandTotal: 1239,
    status: "Preparing", // Pending | Preparing | Ready | Delivered | Cancelled
    channel: "AI Chatbot",
    placedAt: "12 mins ago",
    payment_method: "Cash on Delivery (COD)",
    paymentMethod: "Cash on Delivery (COD)",
    risk_flag: false,
    riskFlag: false,
    transcript: [
      { id: "t1", sender: "user", text: "Assalam o alaikum, 1 midnight deal 1 bhej dein aur 6 hot wings.", time: "12:18 PM" },
      { id: "t2", sender: "agent", text: "Walaikum Assalam! Midnight Zinger Feast (Deal 1) aur 6 Hot Wings add kar diye hain. Kya sath extra sauce chahiye?", time: "12:18 PM" },
      { id: "t3", sender: "user", text: "Haan garlic mayo daal dena, Gulberg 3 address pe COD kardo.", time: "12:19 PM" },
      { id: "t4", sender: "agent", text: "Total bill Rs. 1,239 hai. Kya confirm kar doon?", time: "12:19 PM" },
      { id: "t5", sender: "user", text: "Haan bhai confirm hai.", time: "12:20 PM" },
      { id: "t6", sender: "agent", text: "Shukriya! Order confirm ho gaya hai aur kitchen mein tayyar ho raha hai.", time: "12:20 PM" }
    ]
  },
  {
    id: 2,
    order_number: "#PK-102",
    orderNumber: "#PK-102",
    customer_name: "Ali Raza",
    customer_phone: "+92 321 7654321",
    delivery_address: "Shop 12, Main Commercial Market, Rawalpindi",
    customer: {
      id: "cust-2",
      name: "Ali Raza",
      phone: "+92 321 7654321",
      address: "Shop 12, Main Commercial Market, Rawalpindi",
      type: "flagged",
      tag: "Frequent Cancellations",
      trustScore: 42,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
    },
    items: [
      { id: "p2", item_code: "p2", name: "Chicken Fajita Pizza (Large)", quantity: 2, price: 1650, modifiers: ["Extra Cheese"] },
      { id: "d1", item_code: "d1", name: "Pepsi Can (345ml)", quantity: 3, price: 90, modifiers: ["Chilled"] }
    ],
    subtotal: 3570,
    delivery_fee: 150,
    deliveryFee: 150,
    grand_total: 3720,
    grandTotal: 3720,
    status: "Pending",
    channel: "AI Chatbot",
    placedAt: "2 mins ago",
    payment_method: "Cash on Delivery (COD)",
    paymentMethod: "Cash on Delivery (COD)",
    risk_flag: true,
    riskFlag: true,
    risk_reason: "High cancellation record (4 cancelled deliveries)",
    riskReason: "High cancellation record (4 cancelled deliveries)",
    transcript: [
      { id: "t11", sender: "user", text: "Bhai 2 large fajita pizza aur 3 thandi pepsi", time: "12:28 PM" },
      { id: "t12", sender: "agent", text: "Zabardast! 2x Chicken Fajita Pizza aur 3x Pepsi Can cart mein add kar diye hain.", time: "12:28 PM" },
      { id: "t13", sender: "user", text: "Bill kitna hua? Rawalpindi shop 12 address hai.", time: "12:29 PM" },
      { id: "t14", sender: "agent", text: "Subtotal Rs. 3,570 + Delivery Rs. 150 = Grand Total Rs. 3,720 COD. Kya confirm kar doon?", time: "12:29 PM" },
      { id: "t15", sender: "user", text: "Haan kar do bhai jaldi.", time: "12:30 PM" }
    ]
  }
];

const INITIAL_MESSAGES = [
  {
    id: "m-init-1",
    sender: "agent",
    text: "Assalam-o-Alaikum! Main aapka Dastarkhwan AI Ordering Assistant hoon. Aap Urdu, Roman Urdu, ya English mein order kar sakte hain.",
    time: "Just now"
  },
  {
    id: "m-init-2",
    sender: "agent",
    text: "Misal ke taur par: \"Mujhe 2 zinger burger aur 1 thanda Pepsi bhej do\" ya \"Midnight deal 1 lagao\".",
    time: "Just now"
  }
];

export function AppProvider({ children }) {
  // ─── Authentication & Roles State ──────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dastarkhwan_user');
      return saved ? JSON.parse(saved) : {
        id: 1,
        name: "Restaurant Admin",
        email: "admin@dastarkhwan.com",
        role: "admin",
        phone: "+92 300 0000000",
        address: "Dastarkhwan Main Kitchen, MM Alam Road, Gulberg III, Lahore",
        risk_level: "Low"
      };
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // ─── Menu State ────────────────────────────────────────────────────────────
  const [menu, setMenu] = useState(MENU_ITEMS);
  const [menuLoading, setMenuLoading] = useState(false);

  // ─── Customer Persona State (for testing & demo) ───────────────────────────
  const [activeCustomer, setActiveCustomer] = useState(DEMO_CUSTOMERS[0]);

  // ─── Cart State ────────────────────────────────────────────────────────────
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    deliveryFee: 150,
    grandTotal: 0,
    address: DEMO_CUSTOMERS[0].address,
    paymentMethod: "Cash on Delivery (COD)"
  });

  // ─── Orders State ──────────────────────────────────────────────────────────
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [recentOrderId, setRecentOrderId] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ─── Tracking Modal State ──────────────────────────────────────────────────
  const [trackingModalData, setTrackingModalData] = useState(null); // { isOpen, orderNumber, trackingInfo }

  // ─── Chat Messages State ───────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);

  // ─── Human Handoff State ───────────────────────────────────────────────────
  const [conversationsNeedingAttention, setConversationsNeedingAttention] = useState([]);

  // ─── Synchronize With Backend on Mount ─────────────────────────────────────
  const fetchBackendData = useCallback(async () => {
    // 1. Fetch Menu
    try {
      setMenuLoading(true);
      const menuRes = await api.menu.getItems();
      if (menuRes?.items?.length) {
        // Map backend fields to frontend friendly structure
        const formatted = menuRes.items.map(i => ({
          ...i,
          id: i.item_code || String(i.id),
          dbId: i.id,
          name_ur: i.name_ur || '',
          price: Number(i.price),
          available: Boolean(i.available),
          is_popular: Boolean(i.is_popular),
          is_spicy: Boolean(i.is_spicy),
          aliases: Array.isArray(i.aliases) ? i.aliases : (i.aliases ? JSON.parse(i.aliases) : [])
        }));
        setMenu(formatted);
      }
    } catch (err) {
      console.warn('Backend menu fetch warning, using local menu:', err?.message);
    } finally {
      setMenuLoading(false);
    }

    // 2. Fetch Orders
    try {
      setOrdersLoading(true);
      const ordersRes = await api.orders.getOrders();
      if (ordersRes?.orders?.length) {
        const mappedOrders = ordersRes.orders.map(o => ({
          ...o,
          id: o.id,
          orderNumber: o.order_number,
          customer: {
            name: o.customer_name,
            phone: o.customer_phone,
            address: o.delivery_address,
            type: o.risk_flag ? 'flagged' : 'regular',
            tag: o.risk_flag ? 'High Risk' : 'Verified Customer',
            trustScore: o.risk_flag ? 40 : 95
          },
          items: o.items || [],
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.delivery_fee),
          grandTotal: Number(o.grand_total),
          paymentMethod: o.payment_method,
          placedAt: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          riskFlag: Boolean(o.risk_flag),
          riskReason: o.risk_reason
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.warn('Backend orders fetch warning, using local orders:', err?.message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  // Keep customer address synced with activeCustomer or currentUser
  useEffect(() => {
    if (currentUser?.address) {
      setCart(prev => ({ ...prev, address: currentUser.address }));
    } else if (activeCustomer?.address) {
      setCart(prev => ({ ...prev, address: activeCustomer.address }));
    }
  }, [currentUser, activeCustomer]);

  // ─── Authentication Operations ─────────────────────────────────────────────
  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem('dastarkhwan_token', res.token);
      localStorage.setItem('dastarkhwan_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      setAuthModalOpen(false);
      return res.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (userData) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await api.auth.register(userData);
      localStorage.setItem('dastarkhwan_token', res.token);
      localStorage.setItem('dastarkhwan_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      setAuthModalOpen(false);
      return res.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check the form.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
  };

  const quickSwitchRole = async (targetRole) => {
    if (targetRole === 'admin') {
      try {
        await login('admin@dastarkhwan.com', 'admin123');
      } catch {
        setCurrentUser({
          id: 1,
          name: "Dastarkhwan Admin",
          email: "admin@dastarkhwan.com",
          role: "admin",
          phone: "+92 300 0000000",
          address: "Dastarkhwan Main Kitchen, MM Alam Road, Gulberg III, Lahore",
          risk_level: "Low"
        });
      }
    } else {
      try {
        await login('customer@dastarkhwan.com', 'customer123');
      } catch {
        setCurrentUser({
          id: 2,
          name: "Zainab Ahmed",
          email: "customer@dastarkhwan.com",
          role: "customer",
          phone: "+92 300 1234567",
          address: "Flat 304, Al-Razi Heights, Block M, Gulberg III, Lahore",
          risk_level: "Low"
        });
      }
    }
  };

  // ─── Cart Helpers ──────────────────────────────────────────────────────────
  const recalculateCart = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = items.length > 0 ? 150 : 0;
    return {
      items,
      subtotal,
      deliveryFee,
      grandTotal: subtotal + deliveryFee,
      address: currentUser?.address || activeCustomer.address,
      paymentMethod: cart.paymentMethod || "Cash on Delivery (COD)"
    };
  };

  const addToCart = useCallback((item, quantity = 1, modifiers = []) => {
    setCart(prev => {
      const existingIndex = prev.items.findIndex(i => i.id === item.id || (item.item_code && i.item_code === item.item_code));
      let updatedItems;
      if (existingIndex > -1) {
        updatedItems = [...prev.items];
        updatedItems[existingIndex].quantity += quantity;
      } else {
        updatedItems = [
          ...prev.items,
          {
            id: item.id || item.item_code,
            item_code: item.item_code || item.id,
            name: item.name,
            price: Number(item.price),
            quantity,
            modifiers
          }
        ];
      }
      return recalculateCart(updatedItems);
    });
  }, [currentUser, activeCustomer, cart.paymentMethod]);

  const removeFromCart = useCallback((itemId) => {
    setCart(prev => {
      const updatedItems = prev.items.filter(i => i.id !== itemId && i.item_code !== itemId);
      return recalculateCart(updatedItems);
    });
  }, [currentUser, activeCustomer]);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      grandTotal: 0,
      address: currentUser?.address || activeCustomer.address,
      paymentMethod: "Cash on Delivery (COD)"
    });
  }, [currentUser, activeCustomer]);

  // ─── Order Operations (Backend Sync + Fallback) ─────────────────────────────
  const placeOrder = useCallback(async (customOrderData = null) => {
    const items = customOrderData?.items || cart.items;
    if (!items.length) return null;

    const custName = customOrderData?.customer?.name || currentUser?.name || activeCustomer.name;
    const custPhone = customOrderData?.customer?.phone || currentUser?.phone || activeCustomer.phone;
    const custAddress = customOrderData?.address || cart.address || currentUser?.address || activeCustomer.address;
    const payment = customOrderData?.paymentMethod || cart.paymentMethod || "Cash on Delivery (COD)";
    const channel = customOrderData?.channel || "Web Order";

    let createdOrder = null;

    try {
      // 1. Post to real Laravel Backend
      const payload = {
        customer_name: custName,
        customer_phone: custPhone,
        customer_email: currentUser?.email || "customer@dastarkhwan.com",
        delivery_address: custAddress,
        channel: channel,
        payment_method: payment,
        notes: customOrderData?.notes || null,
        items: items.map(i => ({
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
          item_code: i.item_code || i.id,
          modifiers: i.modifiers || []
        })),
        transcript: customOrderData?.transcript || [...chatMessages]
      };

      const backendRes = await api.orders.createOrder(payload);
      if (backendRes?.order) {
        const o = backendRes.order;
        createdOrder = {
          ...o,
          id: o.id,
          orderNumber: o.order_number,
          customer: {
            name: o.customer_name,
            phone: o.customer_phone,
            address: o.delivery_address,
            type: o.risk_flag ? 'flagged' : 'regular',
            tag: o.risk_flag ? 'High Risk' : 'Verified Customer',
            trustScore: o.risk_flag ? 40 : 95
          },
          items: o.items || items,
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.delivery_fee),
          grandTotal: Number(o.grand_total),
          paymentMethod: o.payment_method,
          placedAt: "Just now",
          riskFlag: Boolean(o.risk_flag),
          riskReason: o.risk_reason
        };
      }
    } catch (err) {
      console.warn('Backend order placement error, saving locally:', err?.message);
    }

    // Fallback if backend wasn't reached
    if (!createdOrder) {
      const fallbackNum = `#PK-${Math.floor(100 + Math.random() * 900)}`;
      createdOrder = {
        id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
        order_number: fallbackNum,
        orderNumber: fallbackNum,
        customer_name: custName,
        customer_phone: custPhone,
        delivery_address: custAddress,
        customer: customOrderData?.customer || activeCustomer,
        items: items,
        subtotal: customOrderData?.subtotal || cart.subtotal,
        deliveryFee: customOrderData?.deliveryFee || cart.deliveryFee,
        grandTotal: customOrderData?.grandTotal || cart.grandTotal,
        status: "Pending",
        channel: channel,
        placedAt: "Just now",
        address: custAddress,
        paymentMethod: payment,
        riskFlag: activeCustomer.type === "flagged",
        riskReason: activeCustomer.type === "flagged" ? activeCustomer.notes : null,
        transcript: customOrderData?.transcript || [...chatMessages]
      };
    }

    // Play chime sound
    playOrderNotificationSound();

    // Trigger visual glowing highlight in dashboard
    setRecentOrderId(createdOrder.id || createdOrder.orderNumber);
    setTimeout(() => {
      setRecentOrderId(null);
    }, 4500);

    // Update orders list & clear cart
    setOrders(prev => [createdOrder, ...prev]);
    clearCart();

    return createdOrder;
  }, [cart, currentUser, activeCustomer, chatMessages, clearCart]);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    // 1. Optimistic local update
    setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: newStatus } : o));

    // 2. Sync to Backend
    try {
      // Find order to check if it has a database ID
      const found = orders.find(o => o.id === orderId || o.orderNumber === orderId);
      const targetId = found?.id && typeof found.id === 'number' ? found.id : orderId;
      if (typeof targetId === 'number') {
        await api.orders.updateStatus(targetId, newStatus);
      }
    } catch (err) {
      console.warn('Could not sync status to backend:', err?.message);
    }
  }, [orders]);

  const cancelOrder = useCallback(async (orderId, reason = 'Cancelled by user/restaurant') => {
    setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: "Cancelled" } : o));
    try {
      const found = orders.find(o => o.id === orderId || o.orderNumber === orderId);
      const targetId = found?.id && typeof found.id === 'number' ? found.id : orderId;
      if (typeof targetId === 'number') {
        await api.orders.cancelOrder(targetId, reason);
      }
    } catch (err) {
      console.warn('Could not sync cancel to backend:', err?.message);
    }
  }, [orders]);

  // ─── Menu Item Operations (Admin) ──────────────────────────────────────────
  const toggleItemAvailability = useCallback(async (itemId) => {
    // 1. Optimistic update
    setMenu(prev => prev.map(item => (item.id === itemId || item.item_code === itemId) ? { ...item, available: !item.available } : item));

    // 2. Sync with backend
    try {
      const found = menu.find(item => item.id === itemId || item.item_code === itemId);
      if (found?.dbId) {
        await api.menu.toggleAvailability(found.dbId);
      }
    } catch (err) {
      console.warn('Failed to toggle availability on backend:', err?.message);
    }
  }, [menu]);

  const createMenuItem = useCallback(async (itemData) => {
    try {
      const res = await api.menu.createItem(itemData);
      if (res?.item) {
        const newItem = {
          ...res.item,
          id: res.item.item_code || String(res.item.id),
          dbId: res.item.id,
          name_ur: res.item.name_ur || '',
          price: Number(res.item.price),
          available: Boolean(res.item.available),
          is_popular: Boolean(res.item.is_popular),
          is_spicy: Boolean(res.item.is_spicy),
          aliases: res.item.aliases || []
        };
        setMenu(prev => [newItem, ...prev]);
        return newItem;
      }
    } catch (err) {
      console.warn('Create menu item backend error:', err);
      // Fallback local create
      const localId = 'item_' + Date.now();
      const localItem = { ...itemData, id: localId, available: true };
      setMenu(prev => [localItem, ...prev]);
      return localItem;
    }
  }, []);

  const updateMenuItem = useCallback(async (itemId, itemData) => {
    try {
      const found = menu.find(i => i.id === itemId || i.item_code === itemId);
      if (found?.dbId) {
        await api.menu.updateItem(found.dbId, itemData);
      }
    } catch (err) {
      console.warn('Update menu item backend error:', err);
    }
    setMenu(prev => prev.map(i => (i.id === itemId || i.item_code === itemId) ? { ...i, ...itemData } : i));
  }, [menu]);

  const deleteMenuItem = useCallback(async (itemId) => {
    try {
      const found = menu.find(i => i.id === itemId || i.item_code === itemId);
      if (found?.dbId) {
        await api.menu.deleteItem(found.dbId);
      }
    } catch (err) {
      console.warn('Delete menu item backend error:', err);
    }
    setMenu(prev => prev.filter(i => i.id !== itemId && i.item_code !== itemId));
  }, [menu]);

  // ─── Order Tracking Operations ─────────────────────────────────────────────
  const openOrderTracker = useCallback(async (orderNumber) => {
    if (!orderNumber) return;
    try {
      const res = await api.orders.trackOrder(orderNumber);
      if (res?.order) {
        setTrackingModalData({
          isOpen: true,
          orderNumber: res.order.order_number,
          order: res.order,
          tracking: res.tracking
        });
        return;
      }
    } catch (err) {
      console.warn('Backend tracking lookup note:', err?.message);
    }

    // Fallback: look up in local orders
    const local = orders.find(o => (o.orderNumber === orderNumber || o.order_number === orderNumber || `#${o.orderNumber}` === orderNumber));
    if (local) {
      const statusMap = {
        'Pending': { step: 1, percent: 20, text: 'Order Received & Awaiting Kitchen Confirmation' },
        'Preparing': { step: 2, percent: 50, text: 'Chef is preparing your meal hot & fresh' },
        'Ready': { step: 3, percent: 75, text: 'Packed & Ready for Dispatch' },
        'Delivered': { step: 4, percent: 100, text: 'Order Delivered! Enjoy your meal.' },
        'Cancelled': { step: 0, percent: 0, text: 'This order was cancelled.' }
      };
      const info = statusMap[local.status] || statusMap['Pending'];
      setTrackingModalData({
        isOpen: true,
        orderNumber: local.orderNumber || local.order_number,
        order: local,
        tracking: {
          current_step: info.step,
          progress_percent: info.percent,
          status_message: info.text,
          estimated_time: '25-35 mins',
          timeline: [
            { title: 'Order Placed', done: true, time: local.placedAt || 'Recently' },
            { title: 'Kitchen Preparing', done: ['Preparing', 'Ready', 'Delivered'].includes(local.status) },
            { title: 'Ready for Dispatch', done: ['Ready', 'Delivered'].includes(local.status) },
            { title: 'Delivered to Address', done: local.status === 'Delivered' }
          ]
        }
      });
    } else {
      setTrackingModalData({
        isOpen: true,
        orderNumber,
        order: null,
        error: `Order ${orderNumber} not found.`
      });
    }
  }, [orders]);

  const closeOrderTracker = useCallback(() => {
    setTrackingModalData(null);
  }, []);

  // ─── Chat Operations ───────────────────────────────────────────────────────
  const addChatMessage = useCallback((message) => {
    setChatMessages(prev => [
      ...prev,
      {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...message
      }
    ]);
  }, []);

  // ─── Human Handoff Operations ──────────────────────────────────────────────
  const flagConversationForAttention = useCallback((reason) => {
    const attentionItem = {
      id: "attn-" + Date.now(),
      customer: currentUser || activeCustomer,
      reason,
      flaggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversationsNeedingAttention(prev => [attentionItem, ...prev]);
  }, [currentUser, activeCustomer]);

  const resolveAttention = useCallback((id) => {
    setConversationsNeedingAttention(prev => prev.filter(a => a.id !== id));
  }, []);

  // Reset Demo
  const resetDemo = useCallback(() => {
    setMenu(MENU_ITEMS);
    setActiveCustomer(DEMO_CUSTOMERS[0]);
    clearCart();
    setOrders(INITIAL_ORDERS);
    setChatMessages(INITIAL_MESSAGES);
    setConversationsNeedingAttention([]);
    setRecentOrderId(null);
    fetchBackendData();
  }, [clearCart, fetchBackendData]);

  return (
    <AppContext.Provider value={{
      // Auth & Roles
      currentUser,
      isAdmin: currentUser?.role === 'admin',
      authModalOpen,
      setAuthModalOpen,
      authLoading,
      authError,
      login,
      register,
      logout,
      quickSwitchRole,

      // Menu
      menu,
      menuLoading,
      toggleItemAvailability,
      createMenuItem,
      updateMenuItem,
      deleteMenuItem,

      // Customer Persona
      activeCustomer,
      setActiveCustomer,

      // Cart
      cart,
      setCart,
      addToCart,
      removeFromCart,
      clearCart,

      // Orders
      orders,
      ordersLoading,
      recentOrderId,
      placeOrder,
      updateOrderStatus,
      cancelOrder,

      // Live Tracking
      trackingModalData,
      openOrderTracker,
      closeOrderTracker,

      // AI Chat
      chatMessages,
      addChatMessage,

      // Attention
      conversationsNeedingAttention,
      flagConversationForAttention,
      resolveAttention,

      // Reset
      resetDemo,
      fetchBackendData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
