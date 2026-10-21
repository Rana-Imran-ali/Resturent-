// Mock AI Agent Engine for Pakistani Restaurant Voice & Chat Prototype
// Grounded against src/data/menu.js with Roman Urdu / Urdu / English understanding

import { MENU_ITEMS } from '../data/menu';

// Roman Urdu & English numeral words dictionary
const NUMBER_WORDS = {
  // Roman Urdu & variants
  'ek': 1, 'aik': 1, 'ak': 1, 'ik': 1,
  'do': 2, 'doh': 2, 'dou': 2,
  'teen': 3, 'tin': 3,
  'chaar': 4, 'char': 4,
  'paanch': 5, 'panch': 5,
  'chhe': 6, 'che': 6, 'chhay': 6,
  'saat': 7, 'sat': 7,
  'aath': 8, 'ath': 8,
  'nau': 9, 'nou': 9,
  'das': 10, 'dus': 10,
  // Urdu script numbers and digits
  'ایک': 1, 'دو': 2, 'تین': 3, 'چار': 4, 'پانچ': 5, 'چھ': 6, 'سات': 7, 'آٹھ': 8, 'نو': 9, 'دس': 10,
  '۱': 1, '۲': 2, '۳': 3, '۴': 4, '۵': 5, '۶': 6, '۷': 7, '۸': 8, '۹': 9, '۱۰': 10,
  // English words
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  // Digits
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
};

// Known common Pakistani dishes that are definitely NOT on our fast food/pizza menu
const OUT_OF_MENU_ITEMS = [
  'biryani', 'biryani', 'bryani', 'pulao', 'haleem', 'halim', 'nihari', 'nehari',
  'karahi', 'karhai', 'handi', 'qorma', 'korma', 'daal', 'daal chawal', 'chapati', 'roti',
  'sushi', 'pasta', 'lasagna', 'steak', 'chowmein', 'manchurian', 'fried rice',
  'chai', 'tea', 'doodh patti', 'green tea', 'kahwa', 'ice cream', 'falooda', 'kheer'
];

/**
 * Detect language style: 'urdu_script' | 'roman_urdu' | 'english'
 */
export function detectLanguage(text = '') {
  // Urdu script detection (Arabic/Urdu unicode block)
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'urdu_script';
  }

  // Common Roman Urdu keywords
  const romanUrduPatterns = /\b(bhai|kardo|kar do|de do|dedo|chahye|chahiye|nahi|haan|ji|acha|theek|sahi|mangwana|khana|kya|batao|karen|hoga|bhejo|bhej do|thanda|thandi|garam|pani|shukriya|kitna|haye|pe|aur|bhi|wala|wali|lagao)\b/i;
  if (romanUrduPatterns.test(text)) {
    return 'roman_urdu';
  }

  return 'english';
}

/**
 * Normalizes input text for keyword and alias matching
 */
function normalize(str = '') {
  return str
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find menu items mentioned in customer speech/text
 */
export function findMentionedItems(text, menu = MENU_ITEMS) {
  const norm = normalize(text);
  const words = norm.split(' ');
  const matches = [];

  for (const item of menu) {
    let matchedAlias = null;

    // Check main name
    if (norm.includes(item.name.toLowerCase())) {
      matchedAlias = item.name.toLowerCase();
    } else if (item.name_ur && norm.includes(normalize(item.name_ur))) {
      matchedAlias = item.name_ur;
    } else {
      // Check aliases
      for (const alias of item.aliases) {
        const normAlias = normalize(alias);
        // Word boundary match for short aliases (e.g. "roll", "fries", "pepsi")
        const regex = new RegExp(`(^|\\s)${normAlias}(\\s|$)`, 'i');
        if (regex.test(norm)) {
          matchedAlias = normAlias;
          break;
        }
      }
    }

    if (matchedAlias) {
      // Extract quantity associated with this item
      let qty = 1;
      const aliasTokens = matchedAlias.split(' ');
      const firstToken = aliasTokens[0];
      const tokenIdx = words.indexOf(firstToken);

      // Check 1 or 2 words before the item name: e.g. "2 zinger", "do zinger"
      if (tokenIdx > 0 && NUMBER_WORDS[words[tokenIdx - 1]]) {
        qty = NUMBER_WORDS[words[tokenIdx - 1]];
      } else if (tokenIdx > 1 && NUMBER_WORDS[words[tokenIdx - 2]]) {
        qty = NUMBER_WORDS[words[tokenIdx - 2]];
      } else {
        // Look for digit/number word in sentence
        for (const w of words) {
          if (NUMBER_WORDS[w]) {
            qty = NUMBER_WORDS[w];
            break;
          }
        }
      }

      // Extract modifiers
      const modifiers = [];
      if (/extra spicy|tez mirch|spicy/i.test(norm)) modifiers.push('Extra Spicy');
      if (/mild|kam mirch/i.test(norm)) modifiers.push('Mild');
      if (/cheese|cheez/i.test(norm) && !item.name.toLowerCase().includes('cheese')) modifiers.push('Extra Cheese');
      if (/thanda|thandi|chilled|baraf/i.test(norm)) modifiers.push('Chilled');

      matches.push({
        item,
        quantity: Math.max(1, qty),
        modifiers
      });
    }
  }

  // Deduplicate
  const unique = [];
  const seen = new Set();
  for (const m of matches) {
    if (!seen.has(m.item.id)) {
      seen.add(m.item.id);
      unique.push(m);
    }
  }

  return unique;
}

/**
 * Main Agent Processing Function
 * 
 * @param {Object} params
 * @param {string} params.text Customer message
 * @param {Object} params.cart Current active cart { items, subtotal, deliveryFee, grandTotal, address, paymentMethod }
 * @param {Object} params.customer Active customer profile
 * @param {Array} params.menu Current menu list (with availability flags)
 * @param {Object} params.agentState State tracking: { waitingForConfirmation, waitingForAddress, waitingForPayment, hasUpsold, lastItemAdded }
 */
export function processAgentMessage({
  text,
  cart,
  customer,
  menu = MENU_ITEMS,
  agentState = {}
}) {
  const norm = normalize(text);
  const lang = detectLanguage(text);

  let reply = '';
  let updatedCart = { ...cart };
  let updatedState = { ...agentState };
  let action = null; // 'CREATE_ORDER' | 'REQUEST_HANDOFF' | 'UPDATE_CART' | null

  // -------------------------------------------------------------
  // 1. HUMAN HANDOFF CHECK (Human request OR Customer Angry)
  // -------------------------------------------------------------
  const isAngry = /\b(bakwas|ghussa|gussa|fuzool|fazool|chawal|stupid|idiot|worst|bad service|fraud|sharam|bekar|dimagh kharab|complaint|shikayat)\b/i.test(norm);
  const isHumanRequest = /\b(human|manager|banda|talk to human|agent se baat|representative|call manager)\b/i.test(norm);

  if (isAngry || isHumanRequest) {
    action = 'REQUEST_HANDOFF';
    const reason = isAngry 
      ? 'Customer expressed anger/frustration (sentiment alert: negative keywords)'
      : 'Customer requested human manager takeover';

    if (lang === 'urdu_script') {
      reply = 'معذرت خواہ ہیں! میں یہ بات فوری طور پر ہمارے ریستوران کے مینیجر کو ٹرانسفر کر رہا ہوں تاکہ وہ آپ کی مدد کر سکیں۔ برائے مہربانی چند لمحے انتظار کیجیے۔';
    } else if (lang === 'roman_urdu') {
      reply = 'Maazrat khwah hain! Main yeh chat foran apne Restaurant Manager ko transfer kar raha hoon taake wo direct aapki rehnumai kar sakein. Baraye meherbani thori der intezar farmayein.';
    } else {
      reply = 'We apologize for any trouble! I am transferring you directly to our restaurant manager right away. Please hold on.';
    }
    return { reply, updatedCart, updatedState, action, handoffReason: reason };
  }

  // -------------------------------------------------------------
  // 2. ORDER CONFIRMATION CHECK (When awaiting confirmation)
  // -------------------------------------------------------------
  if (agentState.waitingForConfirmation) {
    const isAffirmative = /\b(haan|yes|ji|ji haan|sahi hai|confirm|theek hai|kardo|kar do|done|yes please|yup|ok|okay)\b/i.test(norm);
    const isNegative = /\b(nahi|no|cancel|ruko|stop|not now|badalna|change)\b/i.test(norm);

    if (isAffirmative) {
      action = 'CREATE_ORDER';
      updatedState.waitingForConfirmation = false;
      const orderNum = '#PK-' + Math.floor(100 + Math.random() * 900);

      if (lang === 'urdu_script') {
        reply = `بہت شکریہ! آپ کا آرڈر نمبر ${orderNum} کامیابی سے تصدیق ہو چکا ہے اور کچن میں تیار ہو رہا ہے۔ آپ کی دہلیز پر تقریباً 30-35 منٹ میں پہنچ جائے گا۔ جزاک اللہ!`;
      } else if (lang === 'roman_urdu') {
        reply = `Shukriya! Aapka order (${orderNum}) confirm ho chuka hai aur kitchen mein tayyar hona shuru ho gaya hai. 30-35 mins mein aapke address (${updatedCart.address || customer.address}) par deliver ho jaye ga. Khaaba Express enjoy karein!`;
      } else {
        reply = `Thank you! Your order (${orderNum}) has been confirmed and sent to the kitchen. It will arrive at your address in approximately 30-35 minutes. Enjoy your meal!`;
      }

      return { reply, updatedCart, updatedState, action };
    }

    if (isNegative) {
      updatedState.waitingForConfirmation = false;
      if (lang === 'urdu_script') {
        reply = 'کوئی مسئلہ نہیں۔ آرڈر روکا گیا ہے۔ آپ کیا تبدیلی کرنا چاہتے ہیں؟';
      } else if (lang === 'roman_urdu') {
        reply = 'Koi masla nahi! Order confirm nahi kiya gaya. Aap cart mein kya change ya add karna chahenge?';
      } else {
        reply = 'No problem! Order was not placed. What would you like to modify in your cart?';
      }
      return { reply, updatedCart, updatedState, action };
    }
  }

  // -------------------------------------------------------------
  // 3. QUANTITY CORRECTION CHECK: e.g. "nahi nahi, 3 nahi, 2"
  // -------------------------------------------------------------
  const correctionMatch = norm.match(/(?:nahi|not|change to|make it|kardo|kar do|nah)\s*(\d+|ek|aik|do|teen|tin|chaar|char|paanch|panch)\s*(?:nahi)?\s*(\d+|ek|aik|do|teen|tin|chaar|char|paanch|panch)?/i);
  if (correctionMatch && (cart.items.length > 0 || updatedState.lastItemAdded)) {
    // Determine the desired new quantity
    let newQty = null;
    const token1 = correctionMatch[1];
    const token2 = correctionMatch[2];

    if (token2 && NUMBER_WORDS[token2]) {
      newQty = NUMBER_WORDS[token2];
    } else if (token1 && NUMBER_WORDS[token1]) {
      newQty = NUMBER_WORDS[token1];
    }

    if (newQty && newQty > 0) {
      // Apply to last added item or top cart item
      const targetId = updatedState.lastItemAdded?.id || cart.items[cart.items.length - 1]?.id;
      if (targetId) {
        const itemIdx = updatedCart.items.findIndex(i => i.id === targetId);
        if (itemIdx > -1) {
          const itemName = updatedCart.items[itemIdx].name;
          updatedCart.items[itemIdx].quantity = newQty;
          
          // Recalculate
          const subtotal = updatedCart.items.reduce((s, i) => s + (i.price * i.quantity), 0);
          updatedCart.subtotal = subtotal;
          updatedCart.deliveryFee = subtotal > 0 ? 150 : 0;
          updatedCart.grandTotal = subtotal + updatedCart.deliveryFee;

          action = 'UPDATE_CART';

          if (lang === 'urdu_script') {
            reply = `ٹھیک ہے، مقدار اپڈیٹ کر دی گئی ہے: اب ${newQty}x ${itemName} ہیں۔ کل رقم: Rs. ${updatedCart.grandTotal}۔`;
          } else if (lang === 'roman_urdu') {
            reply = `Theek hai! Quantity update kar di hai: ab ${newQty}x ${itemName} cart mein hain. Total bill: Rs. ${updatedCart.grandTotal}. Aur kuch add karna hai?`;
          } else {
            reply = `Updated! The quantity has been changed to ${newQty}x ${itemName}. Updated total is Rs. ${updatedCart.grandTotal}. Would you like anything else?`;
          }
          return { reply, updatedCart, updatedState, action };
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 4. GREETING CHECK
  // -------------------------------------------------------------
  if (/^(salam|assalam|aoa|hi|hello|hey|adab|kese ho|how are you|kaisa hai|kese hain)\b/i.test(norm)) {
    if (lang === 'urdu_script') {
      reply = `وعلیکم السلام! خاباہ ایکسپریس میں خوش آمدید۔ آپ کیا آرڈر کرنا چاہیں گے؟ ہمارا کرسپی زنگر برگر اور مڈنائٹ ڈیل 1 کافی مشہور ہے!`;
    } else if (lang === 'roman_urdu') {
      reply = `Walaikum Assalam! Khaaba Express mein khush-aamdeed. Main aapka AI Ordering Assistant hoon. Aaj aapke liye kya mangwayein? Zinger Burger, Hot Pizza, ya koi Deal?`;
    } else {
      reply = `Hello! Welcome to Khaaba Express. I'm your AI Ordering Assistant. What would you like to order today? We have delicious Zinger Burgers, Pizzas, and Value Deals!`;
    }
    return { reply, updatedCart, updatedState, action };
  }

  // -------------------------------------------------------------
  // 5. MENU & DEALS INQUIRY
  // -------------------------------------------------------------
  if (/\b(menu|deals|deal dikhao|kya hai|show menu|kya deals hain|options|kya milta hai)\b/i.test(norm)) {
    if (lang === 'urdu_script') {
      reply = `ہمارے پاس مندرجہ ذیل چیزیں دستیاب ہیں:\n• برگرز: زنگر (Rs. 520)، ڈبل بیف (Rs. 780)\n• پیزا: چکن تکہ (Rs. 1150)، فجیتا (Rs. 1650)\n• ڈیلز: مڈنائٹ ڈیل 1 (زنگر + فرائز + پیپسی: Rs. 699)\nآپ کس چیز کا آرڈر دینا چاہیں گے؟`;
    } else if (lang === 'roman_urdu') {
      reply = `Hamara popular menu yeh hai:\n• Burgers: Crispy Zinger (Rs. 520), Double Beef (Rs. 780)\n• Pizzas: Chicken Tikka (Rs. 1150), Fajita (Rs. 1650)\n• Value Deals: Midnight Deal 1 (Zinger + Fries + Pepsi = Rs. 699)\n• Sides: Loaded Fries (Rs. 450), Wings (Rs. 390)\nAapko kya pasand aye ga?`;
    } else {
      reply = `Here are our popular menu items:\n• Burgers: Crispy Zinger (Rs. 520), Double Beef (Rs. 780)\n• Pizzas: Chicken Tikka (Rs. 1150), Fajita Large (Rs. 1650)\n• Deals: Midnight Deal 1 (Zinger + Fries + Pepsi for Rs. 699)\nWhat would you like to order?`;
    }
    return { reply, updatedCart, updatedState, action };
  }

  // -------------------------------------------------------------
  // 6. OUT-OF-MENU ITEMS CHECK (NEVER GUESS)
  // -------------------------------------------------------------
  const matchedOutOfMenu = OUT_OF_MENU_ITEMS.find(dish => {
    const r = new RegExp(`\\b${dish}\\b`, 'i');
    return r.test(norm);
  });

  if (matchedOutOfMenu) {
    if (lang === 'urdu_script') {
      reply = `معذرت، ہمارے مینو میں "${matchedOutOfMenu}" شامل نہیں ہے۔ ہم برگرز، پیزا، فرائز اور ویلیو ڈیلز پیش کرتے ہیں۔ کیا آپ ہمارا کرسپی زنگر برگر یا چکن تکہ پیزا پسند کریں گے؟`;
    } else if (lang === 'roman_urdu') {
      reply = `Maaf kijiye ga, hamare menu mein "${matchedOutOfMenu}" available nahi hai. Hum Burgers, Pizzas, Sides aur Cold Drinks serve karte hain. Kya aap Crispy Zinger ya Pizza try karna chahenge?`;
    } else {
      reply = `Sorry, "${matchedOutOfMenu}" is not on our menu. We specialize in Burgers, Pizzas, Loaded Fries, and Soft Drinks. Would you like to try our Zinger Burger or Chicken Tikka Pizza instead?`;
    }
    return { reply, updatedCart, updatedState, action };
  }

  // -------------------------------------------------------------
  // 7. ITEM DETECTION & AVAILABILITY
  // -------------------------------------------------------------
  const detected = findMentionedItems(text, menu);

  if (detected.length > 0) {
    const unavailableItems = [];
    const addedItems = [];

    for (const match of detected) {
      if (match.item.available === false) {
        unavailableItems.push(match.item);
      } else {
        // Add to cart or update quantity
        const existingIdx = updatedCart.items.findIndex(i => i.id === match.item.id);
        if (existingIdx > -1) {
          updatedCart.items[existingIdx].quantity += match.quantity;
          if (match.modifiers?.length > 0) {
            updatedCart.items[existingIdx].modifiers = Array.from(new Set([
              ...(updatedCart.items[existingIdx].modifiers || []),
              ...match.modifiers
            ]));
          }
        } else {
          updatedCart.items.push({
            id: match.item.id,
            name: match.item.name,
            price: match.item.price,
            quantity: match.quantity,
            modifiers: match.modifiers || []
          });
        }
        addedItems.push({ item: match.item, quantity: match.quantity, modifiers: match.modifiers });
        updatedState.lastItemAdded = match.item;
      }
    }

    // Recalculate cart
    const subtotal = updatedCart.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    updatedCart.subtotal = subtotal;
    updatedCart.deliveryFee = subtotal > 0 ? 150 : 0;
    updatedCart.grandTotal = subtotal + updatedCart.deliveryFee;
    action = 'UPDATE_CART';

    // Build Response
    let responseParts = [];

    // 7A: Handle unavailable item mentions
    if (unavailableItems.length > 0) {
      const itemNames = unavailableItems.map(i => i.name).join(', ');
      if (lang === 'urdu_script') {
        responseParts.push(`معذرت، ${itemNames} اس وقت ختم (Out of stock) ہے۔ اس کے متبادل آپ چکن تکہ پیزا یا کراؤن کرسٹ لے سکتے ہیں۔`);
      } else if (lang === 'roman_urdu') {
        responseParts.push(`Maaf kijiye ga, ${itemNames} abhi sold out hai. Iski jagah aap Chicken Tikka Pizza ya Crown Crust try kar sakte hain!`);
      } else {
        responseParts.push(`Sorry, ${itemNames} is currently out of stock. As an alternative, may I recommend our Chicken Tikka Pizza?`);
      }
    }

    // 7B: Acknowledge successfully added items
    if (addedItems.length > 0) {
      const summaryText = addedItems.map(a => `${a.quantity}x ${a.item.name}${a.modifiers?.length ? ` (${a.modifiers.join(', ')})` : ''}`).join(', ');

      if (lang === 'urdu_script') {
        responseParts.push(`زبردست! میں نے ${summaryText} آپ کی کارٹ میں شامل کر دیا ہے۔ (کل رقم: Rs. ${updatedCart.grandTotal})۔`);
      } else if (lang === 'roman_urdu') {
        responseParts.push(`Zabardast! Main ne ${summaryText} aapke cart mein add kar diya hai. Current Total: Rs. ${updatedCart.grandTotal}.`);
      } else {
        responseParts.push(`Great choice! I have added ${summaryText} to your cart. Current Total: Rs. ${updatedCart.grandTotal}.`);
      }

      // 7C: Natural Upsell (once per order)
      const hasDrinkOrFries = updatedCart.items.some(i => i.id.startsWith('d') || i.id.startsWith('s1'));
      if (!updatedState.hasUpsold && !hasDrinkOrFries) {
        updatedState.hasUpsold = true;
        if (lang === 'urdu_script') {
          responseParts.push(`کیا ساتھ ٹھنڈی پیپسی (Rs. 90) یا پیری پیری فرائز (Rs. 450) بھی شامل کر دیں؟`);
        } else if (lang === 'roman_urdu') {
          responseParts.push(`Kya sath thanda Pepsi Can (Rs. 90) ya Loaded Peri Peri Fries (Rs. 450) bhi add kar doon?`);
        } else {
          responseParts.push(`Would you like to add a chilled Pepsi Can (Rs. 90) or Loaded Peri Peri Fries (Rs. 450) to go with that?`);
        }
      }
    }

    reply = responseParts.join(' ');
    return { reply, updatedCart, updatedState, action };
  }

  // -------------------------------------------------------------
  // 8. ADDRESS & PAYMENT METHOD / CHECKOUT READ-BACK FLOW
  // -------------------------------------------------------------
  if (/\b(order kardo|bhej do|deliver|khatam karo|checkout|bill kitna|order complete|pack kardo)\b/i.test(norm) || updatedState.waitingForAddress) {
    if (updatedCart.items.length === 0) {
      if (lang === 'urdu_script') {
        reply = 'آپ کی کارٹ ابھی خالی ہے۔ برائے مہربانی پہلے کوئی آئٹم منتخب کریں (مثلاً: "2 زنگر برگر")۔';
      } else if (lang === 'roman_urdu') {
        reply = 'Aapki cart abhi khali hai! Pehle koi item bataiye (maslan: "2 zinger burger" ya "deal 1").';
      } else {
        reply = 'Your cart is empty right now! Please pick something from our menu first (e.g. "2 zinger burgers").';
      }
      return { reply, updatedCart, updatedState, action };
    }

    // Check for payment mention
    if (/\b(cod|cash on delivery|cash|pesay ghar pe)\b/i.test(norm)) {
      updatedCart.paymentMethod = 'Cash on Delivery (COD)';
    } else if (/\b(online|card|bank|jazzcash|easypaisa)\b/i.test(norm)) {
      updatedCart.paymentMethod = 'Online / Card Payment';
    }

    // Ready for full read-back and confirmation
    updatedState.waitingForConfirmation = true;
    const itemsList = updatedCart.items.map(i => `• ${i.quantity}x ${i.name} (Rs. ${i.price * i.quantity})`).join('\n');
    const payment = updatedCart.paymentMethod || 'Cash on Delivery (COD)';
    const addr = updatedCart.address || customer.address;

    if (lang === 'urdu_script') {
      reply = `بہترین! یہ رہا آپ کا مکمل آرڈر سمری:\n${itemsList}\n• سب ٹوٹل: Rs. ${updatedCart.subtotal}\n• ڈلیوری چارجز: Rs. ${updatedCart.deliveryFee}\n• کل رقم: Rs. ${updatedCart.grandTotal}\n• پتہ: ${addr}\n• ادائیگی: ${payment}\n\nکیا میں آرڈر کنفرم کر کے کچن بھیج دوں؟ (ہاں یا نہیں میں جواب دیجیے)`;
    } else if (lang === 'roman_urdu') {
      reply = `Bilkul theek! Aapke order ki mukammal tafseel yeh hai:\n${itemsList}\n• Subtotal: Rs. ${updatedCart.subtotal}\n• Delivery: Rs. ${updatedCart.deliveryFee}\n• Grand Total: Rs. ${updatedCart.grandTotal}\n• Address: ${addr}\n• Payment: ${payment}\n\nKya main yeh order confirm kar doon? ("Haan" ya "Nahi" likhiye/boliye).`;
    } else {
      reply = `Perfect! Here is your complete order summary:\n${itemsList}\n• Subtotal: Rs. ${updatedCart.subtotal}\n• Delivery Fee: Rs. ${updatedCart.deliveryFee}\n• Grand Total: Rs. ${updatedCart.grandTotal}\n• Address: ${addr}\n• Payment: ${payment}\n\nShall I confirm this order and send it to the kitchen? (Please reply "Yes" or "No").`;
    }

    return { reply, updatedCart, updatedState, action };
  }

  // -------------------------------------------------------------
  // 9. DEFAULT / FALLBACK (With 2-failure Human Handoff)
  // -------------------------------------------------------------
  const unknownCount = (agentState.unknownCount || 0) + 1;
  updatedState.unknownCount = unknownCount;

  if (unknownCount >= 2) {
    action = 'REQUEST_HANDOFF';
    const reason = 'AI failed to understand customer intent 2 times in a row';

    if (lang === 'urdu_script') {
      reply = 'لگتا ہے مجھے آپ کی بات سمجھنے میں مشکل پیش آ رہی ہے۔ میں یہ گفتگو براہِ راست ہمارے ریستوران کے مینیجر کو ٹرانسفر کر رہا ہوں تاکہ وہ فوری طور پر آپ کا آرڈر لے سکیں۔';
    } else if (lang === 'roman_urdu') {
      reply = 'Lagta hai mujhe aapki baat samajhne mein thori dushwari ho rahi hai. Main yeh chat foran live Restaurant Manager ko hand-over kar raha hoon taake aapka order theek se liya ja sake.';
    } else {
      reply = 'It seems I am having trouble understanding your request. I am handing over this conversation to our store manager right now.';
    }

    return { reply, updatedCart, updatedState, action, handoffReason: reason };
  }

  if (lang === 'urdu_script') {
    reply = 'میں آپ کا مطلب پوری طرح سمجھ نہیں سکا۔ آپ برگر، پیزا، فرائز یا ڈیلز مانگ سکتے ہیں (مثلاً: "2 زنگر برگر اور 1 پیپسی")۔ یا اگر انسان سے بات کرنی ہے تو "Talk to human" کہہ سکتے ہیں۔';
  } else if (lang === 'roman_urdu') {
    reply = 'Main theek se samajh nahi saka. Aap menu se koi item bata sakte hain (maslan: "2 zinger burger aur thanda pepsi") ya manager se baat karne ke liye "Human manager" bol sakte hain.';
  } else {
    reply = 'I did not quite catch that. You can order items like "2 Zinger burgers and 1 Pepsi", ask for "Deals", or say "Talk to a human" to reach our store manager.';
  }

  return { reply, updatedCart, updatedState, action };
}
