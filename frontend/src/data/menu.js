// Mock Menu Data for Pakistani Restaurant
// Contains individual items + deals with Roman Urdu aliases for conversational matching
// Images use Unsplash food CDN — no API key needed

export const MENU_ITEMS = [
  // --- BURGERS ---
  {
    id: "b1",
    name: "Crispy Zinger Burger",
    name_ur: "کرسپی زنگر برگر",
    aliases: ["zinger", "zingar", "crispy zinger", "chilli zinger", "zinger burger", "jinger"],
    price: 520,
    available: true,
    category: "burgers",
    description: "Crispy golden fried chicken fillet with spicy mayo and shredded lettuce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "b2",
    name: "Double Patty Beef Burger",
    name_ur: "ڈبل پیٹی بیف برگر",
    aliases: ["beef burger", "double beef", "patty burger", "beef patty", "double patty"],
    price: 780,
    available: true,
    category: "burgers",
    description: "Two grilled juicy beef patties topped with caramelized onions and cheddar cheese.",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "b3",
    name: "Jumbo Zinger with Cheese",
    name_ur: "جمبو زنگر مع پنیر",
    aliases: ["cheese zinger", "jumbo zinger", "cheesy zinger", "cheese wala zinger"],
    price: 620,
    available: true,
    category: "burgers",
    description: "Extra large crispy zinger topped with melted American cheddar slice.",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "b4",
    name: "Grilled Chicken Burger",
    name_ur: "گرلڈ چکن برگر",
    aliases: ["grilled burger", "grill burger", "diet burger", "grill chicken"],
    price: 560,
    available: true,
    category: "burgers",
    description: "Flame-grilled chicken breast glazed with peri-peri marinade.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&q=80"
  },

  // --- PIZZAS ---
  {
    id: "p1",
    name: "Chicken Tikka Pizza (Medium)",
    name_ur: "چکن تکہ پیزا (درمیانہ)",
    aliases: ["tikka pizza", "chicken tikka pizza", "tikka", "medium tikka"],
    price: 1150,
    available: true,
    category: "pizza",
    description: "Smoky chicken tikka chunks with onions, capsicum, and mozzarella.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "p2",
    name: "Chicken Fajita Pizza (Large)",
    name_ur: "چکن فجیتا پیزا (بڑا)",
    aliases: ["fajita pizza", "chicken fajita", "large fajita", "fajita"],
    price: 1650,
    available: true,
    category: "pizza",
    description: "Mexican style chicken fajita, bell peppers, sweet corn, and mozzarella cheese.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "p3",
    name: "Crown Crust Pizza (Medium)",
    name_ur: "کراؤن کرسٹ پیزا",
    aliases: ["crown crust", "crown pizza", "kabab crust"],
    price: 1350,
    available: true,
    category: "pizza",
    description: "Stuffed royal crown bites with chicken seekh kabab and garlic dip.",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "p4",
    name: "Cheesy Cheese Pizza (Small)",
    name_ur: "چیزی چیز پیزا",
    aliases: ["cheese pizza", "simple pizza", "margherita", "chota pizza"],
    price: 750,
    available: false,
    category: "pizza",
    description: "Loaded 100% pure dairy mozzarella with Italian tomato herb sauce.",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&q=80"
  },

  // --- SIDES & STARTERS ---
  {
    id: "s1",
    name: "Loaded Peri Peri Fries",
    name_ur: "لوڈڈ پیری پیری فرائز",
    aliases: ["loaded fries", "peri fries", "fries", "chips", "finger chips", "french fries"],
    price: 450,
    available: true,
    category: "sides",
    description: "Crispy french fries tossed in peri salt, topped with cheese sauce & jalapenos.",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "s2",
    name: "Chicken Hot Wings (6 pcs)",
    name_ur: "چکن ہاٹ ونگز (۶ عدد)",
    aliases: ["wings", "hot wings", "chicken wings", "spicy wings", "wingz"],
    price: 390,
    available: true,
    category: "sides",
    description: "Crispy fried wings tossed in fiery sweet & sour buffalo glaze.",
    image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "s3",
    name: "Crispy Chicken Nuggets (6 pcs)",
    name_ur: "کرسپی چکن نگٹس",
    aliases: ["nuggets", "chicken nuggets", "nagats", "chota snacks"],
    price: 340,
    available: true,
    category: "sides",
    description: "All white-meat chicken nuggets served with signature garlic mayo.",
    image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "s4",
    name: "Garlic Mayo Roll",
    name_ur: "گارلک مایو رول",
    aliases: ["roll", "paratha roll", "chicken roll", "garlic roll", "mayo roll"],
    price: 320,
    available: true,
    category: "sides",
    description: "Crispy paratha filled with barbecue chicken and creamy garlic sauce.",
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "s5",
    name: "Chicken Malai Boti Roll",
    name_ur: "چکن ملائی بوٹی رول",
    aliases: ["malai roll", "malai boti roll", "boti roll"],
    price: 360,
    available: true,
    category: "sides",
    description: "Soft butter paratha wrapped around velvety tender malai boti.",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop&q=80"
  },

  // --- DRINKS & BEVERAGES ---
  {
    id: "d1",
    name: "Pepsi Can (345ml)",
    name_ur: "پیپسی کین (۳۴۵ ملی)",
    aliases: ["pepsi", "pipsi", "cold drink", "thanda", "thandi drink", "pepsi can"],
    price: 90,
    available: true,
    category: "drinks",
    description: "Chilled classic refreshing Pepsi cola.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "d2",
    name: "7Up Can (345ml)",
    name_ur: "سیون اپ کین",
    aliases: ["7up", "seven up", "sevenup", "soda", "safaid drink", "lemon soda"],
    price: 90,
    available: true,
    category: "drinks",
    description: "Chilled lemon-lime soda.",
    image: "https://images.unsplash.com/photo-1606168094336-48f8b58a0be1?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "d3",
    name: "Mirinda Can (345ml)",
    name_ur: "مرنڈا کین",
    aliases: ["mirinda", "orange drink", "fanta", "orange soda"],
    price: 90,
    available: true,
    category: "drinks",
    description: "Sweet and bubbly orange flavored soda.",
    image: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "d4",
    name: "Mineral Water (500ml)",
    name_ur: "منرل واٹر (۵۰۰ ملی)",
    aliases: ["pani", "water", "mineral water", "thanda pani", "botal"],
    price: 60,
    available: true,
    category: "drinks",
    description: "Pure and fresh filtered drinking water.",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "d5",
    name: "Mint Margarita",
    name_ur: "منٹ مارگریٹا",
    aliases: ["margarita", "mint drink", "podina drink", "mint lemonade"],
    price: 240,
    available: true,
    category: "drinks",
    description: "Crushed ice, fresh mint leaves, lemon juice and sprite.",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&q=80"
  },

  // --- VALUE DEALS (3 DEALS) ---
  {
    id: "deal1",
    name: "Midnight Deal 1 (Zinger Combo)",
    name_ur: "مڈنائٹ ڈیل ۱ (زنگر کومبو)",
    aliases: ["deal 1", "deal one", "midnight deal", "zinger deal", "combo 1"],
    price: 699,
    available: true,
    category: "deals",
    description: "1x Crispy Zinger Burger + 1x Regular Fries + 1x Chilled Pepsi Can (345ml).",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "deal2",
    name: "Student Feast Deal 2",
    name_ur: "سٹوڈنٹ فیسٹ ڈیل ۲",
    aliases: ["deal 2", "deal two", "student deal", "two zinger deal", "dost deal"],
    price: 1299,
    available: true,
    category: "deals",
    description: "2x Crispy Zinger Burgers + 1x Large Loaded Fries + 2x Pepsi Cans.",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "deal3",
    name: "Family Pizza Feast Deal 3",
    name_ur: "فیملی پیزا فیسٹ ڈیل ۳",
    aliases: ["deal 3", "deal three", "family deal", "pizza deal", "bari deal"],
    price: 2499,
    available: true,
    category: "deals",
    description: "1x Large Chicken Tikka Pizza + 1x Medium Fajita Pizza + 1x 1.5L Pepsi.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&q=80"
  }
];

export const CATEGORIES = [
  { id: "all", label: "🍽️ All Items" },
  { id: "deals", label: "🔥 Value Deals" },
  { id: "burgers", label: "🍔 Burgers" },
  { id: "pizza", label: "🍕 Pizzas" },
  { id: "sides", label: "🍟 Sides & Rolls" },
  { id: "drinks", label: "🥤 Beverages" }
];
