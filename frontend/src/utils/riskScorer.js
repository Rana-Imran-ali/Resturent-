// Fake-Order & Fraud Risk Scorer for Pakistani Restaurant Ordering Prototype
// Uses explainable heuristic rules tailored to COD (Cash-on-Delivery) restaurant operations

/**
 * Calculates a 0-100 risk score and breakdown for an order
 * 
 * @param {Object} order
 * @param {Object} order.customer - Customer profile
 * @param {Array} order.items - Ordered items
 * @param {number} order.grandTotal - Total in PKR
 * @param {string} order.paymentMethod - COD or Online
 * @returns {Object} { score: number, level: 'Low'|'Medium'|'High', reasons: string[], callNeeded: boolean }
 */
export function calculateOrderRisk(order) {
  let score = 10; // Baseline score
  const reasons = [];

  const customer = order.customer || {};
  const items = order.items || [];
  const grandTotal = order.grandTotal || 0;
  const isCod = !order.paymentMethod || order.paymentMethod.toLowerCase().includes('cash') || order.paymentMethod.toLowerCase().includes('cod');

  // Rule 1: Past Cancellations (Primary indicator in Pakistan COD market)
  if (customer.cancelledOrders >= 3) {
    score += 45;
    reasons.push(`History of ${customer.cancelledOrders} cancelled deliveries`);
  } else if (customer.cancelledOrders > 0) {
    score += 25;
    reasons.push(`${customer.cancelledOrders} previous order cancellation`);
  }

  // Rule 2: First-time New Customer
  if (customer.orderCount === 0 || customer.type === 'new') {
    score += 15;
    reasons.push('First-time new customer (Unverified address)');
  }

  // Rule 3: High-Value Order on COD
  if (isCod && grandTotal > 3000) {
    const points = grandTotal > 5000 ? 30 : 15;
    score += points;
    reasons.push(`High COD basket value (Rs. ${grandTotal.toLocaleString()})`);
  }

  // Rule 4: Suspicious Large Quantities on single item
  const maxItemQty = items.reduce((max, it) => Math.max(max, it.quantity || 1), 0);
  const totalItemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  if (maxItemQty >= 4) {
    score += 15;
    reasons.push(`Large quantity of single item (${maxItemQty}x)`);
  } else if (totalItemsCount >= 7) {
    score += 15;
    reasons.push(`Unusually large bulk order (${totalItemsCount} items)`);
  }

  // Cap score between 5 and 98
  score = Math.min(98, Math.max(5, score));

  // Determine Risk Level
  let level = 'Low';
  if (score >= 55) {
    level = 'High';
  } else if (score >= 30) {
    level = 'Medium';
  }

  const callNeeded = level === 'High' || (level === 'Medium' && isCod);

  return {
    score,
    level,
    reasons,
    callNeeded
  };
}
