import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_CUSTOMERS } from '../data/mockCustomers';
import { MENU_ITEMS } from '../data/menuData';
import { processCustomerMessage, calculateOrderTotals } from '../services/agentEngine';
import { speakText, stopSpeaking } from '../services/speechService';

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  // Navigation: 'customer' | 'dashboard' | 'menu'
  const [activeTab, setActiveTab] = useState('customer');

  // Customer Persona selection
  const [selectedCustomer, setSelectedCustomer] = useState(DEMO_CUSTOMERS[0]);

  // Audio / Speech settings
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Conversation State
  const [conversationStatus, setConversationStatus] = useState('active'); // active | needs_attention | handed_off | completed
  const [handoffReason, setHandoffReason] = useState(null);

  // Chat Messages history
  const [messages, setMessages] = useState([
    {
      id: 'm-welcome',
      role: 'assistant',
      content: 'Assalam-o-Alaikum! Khush-Aamdeed! Main aapka AI Voice & Chat Ordering Agent hoon.\n\nAap bol kar ya likh kar order de sakte hain. Maslan:\n• "Bhai 2 Zinger burger aur thanda Pepsi bhej do"\n• "Midnight Deal 1 kardo"\n• "1 Half Chicken Karahi with 2 Roghni Naan"',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      simulatedTool: { name: 'greet_customer', arguments: { language: 'roman_urdu' } }
    }
  ]);

  // Current active draft cart
  const [draftOrder, setDraftOrder] = useState({
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    grandTotal: 0,
    address: selectedCustomer.address,
    notes: ''
  });

  // Pre-seeded Live Restaurant Orders to showcase dashboard immediately
  const [liveOrders, setLiveOrders] = useState([
    {
      id: 'ORD-901',
      orderNumber: '#PK-8901',
      customer: DEMO_CUSTOMERS[1], // Zainab Ahmed
      items: [
        { id: 'dl1', name: 'Midnight Deal 1 (Zinger Combo)', quantity: 1, price: 699, modifiers: ['Pepsi'] },
        { id: 's2', name: 'Chicken Nuggets (6 pcs)', quantity: 1, price: 340, modifiers: [] }
      ],
      subtotal: 1039,
      deliveryFee: 120,
      grandTotal: 1159,
      address: 'Flat 304, Al-Razi Heights, Gulberg III, Lahore',
      status: 'preparing', // pending | confirmed | preparing | ready | delivered | cancelled
      riskScore: 18,
      riskLevel: 'Low',
      riskReasons: ['Previous order cancelled (1 times)'],
      paymentMethod: 'Cash on Delivery (COD)',
      channel: 'voice',
      createdAt: '12 mins ago'
    },
    {
      id: 'ORD-902',
      orderNumber: '#PK-8902',
      customer: DEMO_CUSTOMERS[2], // Ali Raza (High Risk)
      items: [
        { id: 'p2', name: 'Chicken Tikka Pizza (Large)', quantity: 2, price: 1650, modifiers: ['Pan Crust'] },
        { id: 'dr1', name: 'Pepsi Regular (345ml)', quantity: 3, price: 90, modifiers: ['Chilled'] }
      ],
      subtotal: 3570,
      deliveryFee: 120,
      grandTotal: 3690,
      address: 'Shop 12, Main Commercial Market, Rawalpindi',
      status: 'pending',
      riskScore: 72,
      riskLevel: 'High',
      riskReasons: ['High past cancellations (4 cancellations)', 'High value COD order'],
      paymentMethod: 'Cash on Delivery (COD)',
      channel: 'text',
      createdAt: '3 mins ago'
    }
  ]);

  // Keep customer address synced if draft address is empty
  useEffect(() => {
    if (!draftOrder.address) {
      setDraftOrder(prev => ({ ...prev, address: selectedCustomer.address }));
    }
  }, [selectedCustomer]);

  /**
   * Dispatches a customer message through the agentEngine
   */
  const sendCustomerMessage = (text) => {
    if (!text.trim()) return;

    const userMsgId = 'msg-' + Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      content: text,
      createdAt: timeStr
    };

    setMessages(prev => [...prev, newUserMsg]);

    // If human has taken over, don't execute AI logic, wait for staff response
    if (conversationStatus === 'handed_off') {
      return;
    }

    // Process through Mock AI Agent
    setTimeout(() => {
      const result = processCustomerMessage({
        messageText: text,
        currentDraft: draftOrder,
        customer: selectedCustomer,
        conversationState: conversationStatus
      });

      // Update draft order
      if (result.draftOrder) {
        setDraftOrder(result.draftOrder);
      }

      // Check for human handoff trigger
      if (result.action === 'REQUEST_HANDOFF') {
        setConversationStatus('handed_off');
        setHandoffReason(result.handoffReason);
      }

      // Check for Order Confirmation
      if (result.action === 'CONFIRM_ORDER') {
        const newOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        const newOrderNumber = '#PK-' + Math.floor(1000 + Math.random() * 9000);

        const createdOrder = {
          id: newOrderId,
          orderNumber: newOrderNumber,
          customer: selectedCustomer,
          items: result.draftOrder.items,
          subtotal: result.draftOrder.subtotal,
          deliveryFee: result.draftOrder.deliveryFee,
          grandTotal: result.draftOrder.grandTotal,
          address: result.draftOrder.address || selectedCustomer.address,
          status: 'pending',
          riskScore: result.draftOrder.riskScore || 15,
          riskLevel: result.draftOrder.riskLevel || 'Low',
          riskReasons: result.draftOrder.riskReasons || [],
          paymentMethod: 'Cash on Delivery (COD)',
          channel: 'ai_chat',
          createdAt: 'Just now'
        };

        // Add to live orders on the dashboard immediately!
        setLiveOrders(prev => [createdOrder, ...prev]);

        // Reset draft order for next order
        setDraftOrder({
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          grandTotal: 0,
          address: selectedCustomer.address,
          notes: ''
        });
      }

      const botMsgId = 'bot-' + Date.now();
      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: result.reply,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        simulatedTool: result.simulatedTool,
        needsConfirmation: result.needsConfirmation
      };

      setMessages(prev => [...prev, botMsg]);

      // Speak response if audio isn't muted
      if (!isTtsMuted) {
        setIsSpeaking(true);
        speakText(result.reply, {
          onEnd: () => setIsSpeaking(false),
          isMuted: isTtsMuted
        });
      }
    }, 450);
  };

  /**
   * Human Staff sends message from the Dashboard
   */
  const sendStaffMessage = (text) => {
    if (!text.trim()) return;

    const staffMsg = {
      id: 'staff-' + Date.now(),
      role: 'human_agent',
      content: `[Staff Member]: ${text}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, staffMsg]);

    if (!isTtsMuted) {
      speakText(`Staff member says: ${text}`, { isMuted: isTtsMuted });
    }
  };

  /**
   * Take over or return conversation to AI
   */
  const triggerManualHandoff = () => {
    setConversationStatus('handed_off');
    setHandoffReason('Manual takeover by restaurant manager');
    const note = {
      id: 'sys-' + Date.now(),
      role: 'system',
      content: '⚠️ Human Manager has joined the chat and taken control of this conversation.',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, note]);
  };

  const returnControlToAi = () => {
    setConversationStatus('active');
    setHandoffReason(null);
    const note = {
      id: 'sys-' + Date.now(),
      role: 'system',
      content: '🤖 Conversation returned to AI Ordering Agent.',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, note]);
  };

  /**
   * Update order status on live dashboard
   */
  const updateOrderStatus = (orderId, newStatus) => {
    setLiveOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord));
  };

  /**
   * Clear chat and start a fresh order session
   */
  const resetOrderingSession = () => {
    stopSpeaking();
    setDraftOrder({
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      grandTotal: 0,
      address: selectedCustomer.address,
      notes: ''
    });
    setConversationStatus('active');
    setHandoffReason(null);
    setMessages([
      {
        id: 'm-welcome-' + Date.now(),
        role: 'assistant',
        content: `Assalam-o-Alaikum ${selectedCustomer.name.split(' ')[0]}! Main aapka AI Ordering Agent hoon. Aaj aapke liye kya mangwayein?`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <RestaurantContext.Provider value={{
      activeTab,
      setActiveTab,
      selectedCustomer,
      setSelectedCustomer,
      isTtsMuted,
      setIsTtsMuted,
      isListening,
      setIsListening,
      isSpeaking,
      conversationStatus,
      handoffReason,
      messages,
      draftOrder,
      setDraftOrder,
      liveOrders,
      sendCustomerMessage,
      sendStaffMessage,
      triggerManualHandoff,
      returnControlToAi,
      updateOrderStatus,
      resetOrderingSession
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within RestaurantProvider');
  return context;
}
