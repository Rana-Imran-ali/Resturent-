// Mock Pakistani Restaurant Menu Data with Roman Urdu aliases and modifiers

export const MENU_CATEGORIES = [
  { id: 'deals', name: 'Special Deals', nameUr: 'سپیشل ڈیلز', icon: '🔥' },
  { id: 'burgers', name: 'Burgers & Sandwiches', nameUr: 'برگرز', icon: '🍔' },
  { id: 'desi', name: 'Desi Karahi & BBQ', nameUr: 'دیسی کڑاہی اور بی بی کیو', icon: '🍲' },
  { id: 'pizza', name: 'Fast Food & Pizza', nameUr: 'پیزا', icon: '🍕' },
  { id: 'sides', name: 'Sides & Fries', nameUr: 'فرائز اور سائیڈز', icon: '🍟' },
  { id: 'drinks', name: 'Beverages & Drinks', nameUr: 'مشروبات', icon: '🥤' },
];

export const MENU_ITEMS = [
  // Burgers
  {
    id: 'b1',
    categoryId: 'burgers',
    name: 'Crispy Zinger Burger',
    nameUr: 'کرسپی زنگر برگر',
    price: 490,
    description: 'Crunchy golden fried chicken fillet with spicy mayo and fresh lettuce',
    aliases: ['zinger', 'zingar', 'zngr', 'crispy burger', 'chicken burger', 'zenger'],
    modifiers: [
      { id: 'spice', name: 'Spice Level', options: ['Regular', 'Mild', 'Extra Spicy'] },
      { id: 'addon', name: 'Add-ons', options: ['Extra Cheese (+Rs 60)', 'Double Patty (+Rs 220)'] }
    ],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'b2',
    categoryId: 'burgers',
    name: 'Mighty Zinger Double Patty',
    nameUr: 'مائیٹی زنگر برگر',
    price: 790,
    description: 'Double crispy chicken fillets with double cheese slice and secret sauce',
    aliases: ['mighty zinger', 'mighty burger', 'double zinger', 'bada zinger', 'double patty'],
    modifiers: [
      { id: 'spice', name: 'Spice Level', options: ['Regular', 'Spicy'] }
    ],
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'b3',
    categoryId: 'burgers',
    name: 'Grilled Beef Burger',
    nameUr: 'بیف برگر',
    price: 650,
    description: 'Juicy smashed beef patty, caramelized onions and cheddar melt',
    aliases: ['beef burger', 'beef patty', 'bif burger'],
    modifiers: [
      { id: 'doneness', name: 'Cooking', options: ['Well Done', 'Medium Juicy'] }
    ],
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'b4',
    categoryId: 'burgers',
    name: 'Chicken Chapli Burger',
    nameUr: 'چپلی کباب برگر',
    price: 420,
    description: 'Peshawari style chicken chapli patty inside toasted sesame bun with mint chutney',
    aliases: ['chapli burger', 'chapli', 'chapli kabab burger'],
    modifiers: [
      { id: 'spice', name: 'Chutney', options: ['Mint Chutney', 'Imli Sauce', 'Garlic Mayo'] }
    ],
    image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500&auto=format&fit=crop&q=60'
  },

  // Desi
  {
    id: 'd1',
    categoryId: 'desi',
    name: 'Special Chicken Karahi (Half)',
    nameUr: 'چکن کڑاہی ہاف',
    price: 950,
    description: 'Fresh chicken cooked in iron wok with organic tomatoes, green chillies & julienne ginger',
    aliases: ['karahi', 'chicken karahi', 'charsi karahi', 'kadhai', 'karai', 'half karahi'],
    modifiers: [
      { id: 'spice', name: 'Gravy Style', options: ['Medium Spicy', 'Desi Spicy', 'Butter Fry (+Rs 120)'] }
    ],
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'd2',
    categoryId: 'desi',
    name: 'Special Chicken Karahi (Full)',
    nameUr: 'چکن کڑاہی فل',
    price: 1750,
    description: '1 KG fresh chicken karahi with traditional herbs and garnishing',
    aliases: ['full karahi', '1kg karahi', 'full chicken karahi'],
    modifiers: [
      { id: 'spice', name: 'Gravy Style', options: ['Medium Spicy', 'Desi Spicy', 'Butter Fry (+Rs 200)'] }
    ],
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'd3',
    categoryId: 'desi',
    name: 'Chicken Malai Boti (8 pcs)',
    nameUr: 'چکن ملائی بوٹی',
    price: 580,
    description: 'Melt-in-mouth creamy boneless barbecue skewers served with mint raita',
    aliases: ['malai boti', 'malai booti', 'malai tikka', 'bbq boti'],
    modifiers: [],
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'd4',
    categoryId: 'desi',
    name: 'Chicken Bihari Paratha Roll',
    nameUr: 'بہاری پراٹھا رول',
    price: 360,
    description: 'Crispy lachha paratha stuffed with spicy bihari chicken and onions',
    aliases: ['roll', 'paratha roll', 'bihari roll', 'chicken roll', 'zinger roll'],
    modifiers: [
      { id: 'sauce', name: 'Sauce', options: ['Garlic Mayo', 'Chutney', 'Extra Spicy'] }
    ],
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'd5',
    categoryId: 'desi',
    name: 'Roghni Naan',
    nameUr: 'روغنی نان',
    price: 70,
    description: 'Traditional tandoori flatbread brushed with sesame seeds and butter',
    aliases: ['naan', 'roghni naan', 'roti', 'khamiri naan'],
    modifiers: [],
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60'
  },

  // Pizza
  {
    id: 'p1',
    categoryId: 'pizza',
    name: 'Chicken Fajita Pizza (Medium)',
    nameUr: 'چکن فجیتا پیزا میڈیم',
    price: 1150,
    description: 'Fajita chicken, onions, bell peppers, mozzarella cheese and pizza sauce',
    aliases: ['fajita pizza', 'pizza', 'chicken pizza', 'medium pizza', 'fajita'],
    modifiers: [
      { id: 'crust', name: 'Crust', options: ['Pan Crust', 'Thin Crust', 'Cheese Stuffed (+Rs 200)'] }
    ],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'p2',
    categoryId: 'pizza',
    name: 'Chicken Tikka Pizza (Large)',
    nameUr: 'چکن تکہ پیزا لارج',
    price: 1650,
    description: 'Smokey tikka chicken chunks, spicy tomato sauce, onions and lots of cheese',
    aliases: ['tikka pizza', 'large pizza', 'bada pizza', 'chicken tikka pizza'],
    modifiers: [
      { id: 'crust', name: 'Crust', options: ['Pan Crust', 'Cheese Stuffed (+Rs 300)'] }
    ],
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60'
  },

  // Sides
  {
    id: 's1',
    categoryId: 'sides',
    name: 'Loaded Masala Fries',
    nameUr: 'مصالحہ فرائز',
    price: 280,
    description: 'Hot crispy potato fries dusted with authentic chaat masala and garlic mayo dip',
    aliases: ['fries', 'chips', 'masala fries', 'finger chips', 'patato'],
    modifiers: [
      { id: 'flavor', name: 'Seasoning', options: ['Chaat Masala', 'Plain Salted', 'Cheese Powder (+Rs 50)'] }
    ],
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 's2',
    categoryId: 'sides',
    name: 'Chicken Nuggets (6 pcs)',
    nameUr: 'چکن نگٹس',
    price: 340,
    description: 'Tender chicken nuggets fried to golden perfection with honey mustard dip',
    aliases: ['nuggets', 'chiken nuggets', 'nagets'],
    modifiers: [],
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 's3',
    categoryId: 'sides',
    name: 'Crispy Fried Chicken Wings (6 pcs)',
    nameUr: 'کرسپی ونگز',
    price: 450,
    description: 'Spicy batter fried wings served with dip',
    aliases: ['wings', 'hot wings', 'chicken wings'],
    modifiers: [
      { id: 'flavor', name: 'Style', options: ['Crispy Plain', 'Buffalo Spicy', 'Honey BBQ'] }
    ],
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60'
  },

  // Drinks
  {
    id: 'dr1',
    categoryId: 'drinks',
    name: 'Pepsi Regular (345ml)',
    nameUr: 'پیپسی ریگولر',
    price: 90,
    description: 'Ice cold chilled Pepsi bottle',
    aliases: ['pepsi', 'papsi', 'pepsi cold drink', 'chilled pepsi', 'pepsi de do', 'thanda pepsi'],
    modifiers: [
      { id: 'temp', name: 'Chilled', options: ['Thanda / Chilled', 'Normal Room Temp'] }
    ],
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'dr2',
    categoryId: 'drinks',
    name: '7Up Regular (345ml)',
    nameUr: 'سیون اپ',
    price: 90,
    description: 'Chilled refreshing lemon-lime fizzy soda',
    aliases: ['7up', 'seven up', '7 up', 'white drink', 'sprite'],
    modifiers: [],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'dr3',
    categoryId: 'drinks',
    name: 'Pakola Ice Cream Soda (Can)',
    nameUr: 'پاکولا آئس کریم سوڈا',
    price: 130,
    description: 'The national taste of Pakistan - green ice cream soda',
    aliases: ['pakola', 'pakola can', 'green drink', 'ice cream soda'],
    modifiers: [],
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'dr4',
    categoryId: 'drinks',
    name: 'Mineral Water (500ml)',
    nameUr: 'منرل واٹر',
    price: 60,
    description: 'Pure bottled drinking water',
    aliases: ['water', 'pani', 'mineral water', 'paani', 'bottle'],
    modifiers: [],
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60'
  },

  // Deals
  {
    id: 'dl1',
    categoryId: 'deals',
    name: 'Midnight Deal 1 (Zinger Combo)',
    nameUr: 'مڈ نائٹ ڈیل ۱',
    price: 699,
    description: '1 Crispy Zinger Burger + 1 Regular Fries + 1 Chilled Pepsi (345ml)',
    aliases: ['deal 1', 'midnight deal 1', 'zinger deal', 'dil 1', 'deal one', 'combo 1'],
    includedItems: [
      { name: 'Crispy Zinger Burger', qty: 1 },
      { name: 'Loaded Masala Fries', qty: 1 },
      { name: 'Pepsi Regular', qty: 1 }
    ],
    modifiers: [
      { id: 'drink', name: 'Drink Choice', options: ['Pepsi', '7Up', 'Pakola (+Rs 30)'] }
    ],
    image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'dl2',
    categoryId: 'deals',
    name: 'Friends Duo Deal (2 Zingers + 2 Drinks)',
    nameUr: 'فرینڈز ڈیل ۲',
    price: 1290,
    description: '2 Crispy Zinger Burgers + 1 Large Masala Fries + 2 Chilled Drinks',
    aliases: ['deal 2', 'friends deal', 'two zingers', '2 zinger deal', 'deal two'],
    includedItems: [
      { name: 'Crispy Zinger Burger', qty: 2 },
      { name: 'Loaded Masala Fries', qty: 1 },
      { name: 'Pepsi Regular', qty: 2 }
    ],
    modifiers: [],
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'dl3',
    categoryId: 'deals',
    name: 'Family Feast Platter',
    nameUr: 'فیملی فیسٹ پلیٹر',
    price: 2850,
    description: '1 Half Chicken Karahi + 1 Chicken Tikka Pizza Medium + 4 Roghni Naans + 1.5L Pepsi',
    aliases: ['deal 3', 'family deal', 'family feast', 'karahi pizza deal', 'deal three'],
    includedItems: [
      { name: 'Chicken Karahi Half', qty: 1 },
      { name: 'Chicken Tikka Pizza Med', qty: 1 },
      { name: 'Roghni Naan', qty: 4 },
      { name: 'Pepsi 1.5 Litre', qty: 1 }
    ],
    modifiers: [],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60'
  }
];
