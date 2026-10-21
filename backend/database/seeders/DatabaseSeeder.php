<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        $admin = User::updateOrCreate(
            ['email' => 'admin@dastarkhwan.com'],
            [
                'name' => 'Dastarkhwan Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '+92 300 0000000',
                'address' => 'Dastarkhwan Main Kitchen, MM Alam Road, Gulberg III, Lahore',
                'risk_level' => 'Low',
            ]
        );

        $customer1 = User::updateOrCreate(
            ['email' => 'customer@dastarkhwan.com'],
            [
                'name' => 'Zainab Ahmed',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
                'phone' => '+92 300 1234567',
                'address' => 'Flat 304, Al-Razi Heights, Block M, Gulberg III, Lahore',
                'risk_level' => 'Low',
            ]
        );

        $customer2 = User::updateOrCreate(
            ['email' => 'ali@dastarkhwan.com'],
            [
                'name' => 'Ali Raza',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
                'phone' => '+92 321 7654321',
                'address' => 'Shop 12, Main Commercial Market, Rawalpindi',
                'risk_level' => 'High',
            ]
        );

        $customer3 = User::updateOrCreate(
            ['email' => 'bilal@dastarkhwan.com'],
            [
                'name' => 'Bilal Tariq',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
                'phone' => '+92 333 9988776',
                'address' => 'House 45-B, Sector F-7/2, Islamabad',
                'risk_level' => 'Low',
            ]
        );

        // 2. Seed Categories
        $categoriesData = [
            ['name' => 'Burgers', 'slug' => 'burgers', 'icon' => '🍔', 'description' => 'Crispy fried & flame grilled gourmet burgers', 'sort_order' => 1],
            ['name' => 'Pizza', 'slug' => 'pizza', 'icon' => '🍕', 'description' => 'Stone-baked artisan pizzas with generous toppings', 'sort_order' => 2],
            ['name' => 'Sides & Wings', 'slug' => 'sides', 'icon' => '🍟', 'description' => 'Golden crinkle fries, hot wings & garlic bread', 'sort_order' => 3],
            ['name' => 'Beverages', 'slug' => 'drinks', 'icon' => '🥤', 'description' => 'Chilled soft drinks, shakes & refreshing juices', 'sort_order' => 4],
            ['name' => 'Value Deals', 'slug' => 'deals', 'icon' => '🔥', 'description' => 'Super saver combos & midnight student specials', 'sort_order' => 5],
        ];

        $categoryMap = [];
        foreach ($categoriesData as $cat) {
            $created = Category::updateOrCreate(['slug' => $cat['slug']], $cat);
            $categoryMap[$cat['slug']] = $created->id;
        }

        // 3. Seed Menu Items
        $menuItemsData = [
            // Burgers
            [
                'item_code' => 'b1',
                'name' => 'Crispy Zinger Burger',
                'name_ur' => 'کرسپی زنگر برگر',
                'category' => 'burgers',
                'category_id' => $categoryMap['burgers'],
                'price' => 520,
                'available' => true,
                'description' => 'Crispy golden fried chicken breast fillet layered with spicy garlic mayo and fresh shredded iceberg lettuce.',
                'ingredients' => 'Crispy Chicken Fillet, Spicy Mayo, Brioche Bun, Shredded Iceberg Lettuce',
                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop&q=80',
                'is_spicy' => true,
                'is_popular' => true,
                'aliases' => ['zinger', 'zingar', 'crispy zinger', 'chilli zinger', 'zinger burger', 'jinger', 'chicken burger'],
                'stock_quantity' => 45,
            ],
            [
                'item_code' => 'b2',
                'name' => 'Double Patty Beef Burger',
                'name_ur' => 'ڈبل پیٹی بیف برگر',
                'category' => 'burgers',
                'category_id' => $categoryMap['burgers'],
                'price' => 780,
                'available' => true,
                'description' => 'Two prime smash beef patties grilled to perfection, melted cheddar cheese, caramelized onions, and smoky BBQ dip.',
                'ingredients' => 'Prime Beef Patties, Cheddar Cheese, Caramelized Onions, Pickles, BBQ Sauce',
                'image' => 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => true,
                'aliases' => ['beef burger', 'double beef', 'patty burger', 'beef patty', 'double patty', 'smash burger'],
                'stock_quantity' => 30,
            ],
            [
                'item_code' => 'b3',
                'name' => 'Jumbo Zinger with Cheese',
                'name_ur' => 'جمبو زنگر مع پنیر',
                'category' => 'burgers',
                'category_id' => $categoryMap['burgers'],
                'price' => 620,
                'available' => true,
                'description' => 'Extra large crispy zinger chicken fillet topped with two melted American cheddar slices and secret Dastarkhwan sauce.',
                'ingredients' => 'Jumbo Fried Chicken, 2x Cheddar Slices, Dastarkhwan Secret Sauce, Fresh Slaw',
                'image' => 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&h=450&fit=crop&q=80',
                'is_spicy' => true,
                'is_popular' => false,
                'aliases' => ['cheese zinger', 'jumbo zinger', 'cheesy zinger', 'cheese wala zinger', 'cheesy burger'],
                'stock_quantity' => 25,
            ],
            [
                'item_code' => 'b4',
                'name' => 'Flame Grilled Chicken Burger',
                'name_ur' => 'گرلڈ چکن برگر',
                'category' => 'burgers',
                'category_id' => $categoryMap['burgers'],
                'price' => 560,
                'available' => true,
                'description' => 'Tender chicken breast marinated in peri-peri herbs, flame-charred and served with honey mustard and tomatoes.',
                'ingredients' => 'Grilled Chicken Breast, Peri-Peri Marinade, Honey Mustard, Tomatoes, Lettuce',
                'image' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => false,
                'aliases' => ['grilled burger', 'grill burger', 'diet burger', 'grill chicken', 'flame burger'],
                'stock_quantity' => 20,
            ],

            // Pizzas
            [
                'item_code' => 'p1',
                'name' => 'Chicken Tikka Pizza (Medium)',
                'name_ur' => 'چکن تکہ پیزا (درمیانہ)',
                'category' => 'pizza',
                'category_id' => $categoryMap['pizza'],
                'price' => 1150,
                'available' => true,
                'description' => 'Traditional Pakistani smoky tikka chunks, crisp onions, bell peppers, fresh herbs, and 100% real dairy mozzarella cheese.',
                'ingredients' => 'Smoked Chicken Tikka, Mozzarella, Marinara, Bell Peppers, Red Onion, Tikka Spice',
                'image' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=450&fit=crop&q=80',
                'is_spicy' => true,
                'is_popular' => true,
                'aliases' => ['tikka pizza', 'chicken tikka pizza', 'tikka', 'medium tikka', 'tikka medium'],
                'stock_quantity' => 40,
            ],
            [
                'item_code' => 'p2',
                'name' => 'Chicken Fajita Pizza (Large)',
                'name_ur' => 'چکن فجیتا پیزا (بڑا)',
                'category' => 'pizza',
                'category_id' => $categoryMap['pizza'],
                'price' => 1650,
                'available' => true,
                'description' => 'Mexican-spiced chicken fajita slices with roasted red capsicum, sweet corn, black olives, oregano, and molten mozzarella.',
                'ingredients' => 'Fajita Spiced Chicken, Sweet Corn, Black Olives, Bell Peppers, Mozzarella, Oregano',
                'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => true,
                'aliases' => ['fajita pizza', 'chicken fajita', 'large fajita', 'fajita', 'fajita large'],
                'stock_quantity' => 35,
            ],
            [
                'item_code' => 'p3',
                'name' => 'Crown Crust Royal Pizza (Medium)',
                'name_ur' => 'کراؤن کرسٹ پیزا',
                'category' => 'pizza',
                'category_id' => $categoryMap['pizza'],
                'price' => 1350,
                'available' => true,
                'description' => 'Handcrafted royal crown crust stuffed with juicy chicken seekh kabab bites and creamy garlic dip centers.',
                'ingredients' => 'Kabab Stuffed Crust, BBQ Chicken, Cheddar, Mozzarella, Garlic Cream Swirl',
                'image' => 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&h=450&fit=crop&q=80',
                'is_spicy' => true,
                'is_popular' => false,
                'aliases' => ['crown crust', 'crown pizza', 'kabab crust', 'crown crust pizza'],
                'stock_quantity' => 20,
            ],
            [
                'item_code' => 'p4',
                'name' => 'Four Cheese Margherita Pizza (Small)',
                'name_ur' => 'چیزی چیز پیزا',
                'category' => 'pizza',
                'category_id' => $categoryMap['pizza'],
                'price' => 750,
                'available' => true,
                'description' => 'Rich tomato basil base loaded with a quadruple blend of mozzarella, cheddar, gouda, and parmesan cheeses.',
                'ingredients' => 'Mozzarella, Cheddar, Gouda, Parmesan, Tomato Basil Herb Sauce',
                'image' => 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => false,
                'aliases' => ['cheese pizza', 'simple pizza', 'margherita', 'chota pizza', 'small pizza'],
                'stock_quantity' => 25,
            ],

            // Sides & Wings
            [
                'item_code' => 's1',
                'name' => 'Crispy Crinkle Fries (Large)',
                'name_ur' => 'فرائز (بڑے)',
                'category' => 'sides',
                'category_id' => $categoryMap['sides'],
                'price' => 280,
                'available' => true,
                'description' => 'Thick cut crinkle potato fries seasoned with Pakistani chaat masala and classic sea salt.',
                'ingredients' => 'Crinkle Cut Potatoes, Chaat Masala, Sea Salt, Dip',
                'image' => 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => true,
                'aliases' => ['fries', 'chips', 'potato fries', 'french fries', 'large fries', 'crinkle fries'],
                'stock_quantity' => 60,
            ],
            [
                'item_code' => 's2',
                'name' => 'Fiery Buffalo Hot Wings (6 Pcs)',
                'name_ur' => 'ہاٹ ونگز (۶ عدد)',
                'category' => 'sides',
                'category_id' => $categoryMap['sides'],
                'price' => 390,
                'available' => true,
                'description' => 'Crispy breaded chicken wings tossed in tangy red buffalo hot sauce with ranch dipping side.',
                'ingredients' => '6x Crispy Chicken Wings, Buffalo Hot Glaze, Creamy Ranch',
                'image' => 'https://images.unsplash.com/photo-1527477378408-1bc09a3cf3c1?w=600&h=450&fit=crop&q=80',
                'is_spicy' => true,
                'is_popular' => true,
                'aliases' => ['hot wings', 'wings', 'buffalo wings', 'spicy wings', '6 wings', 'chicken wings'],
                'stock_quantity' => 40,
            ],
            [
                'item_code' => 's3',
                'name' => 'Garlic Mayo Dip Sauce',
                'name_ur' => 'گارلک مایو ڈپ',
                'category' => 'sides',
                'category_id' => $categoryMap['sides'],
                'price' => 80,
                'available' => true,
                'description' => 'Signature velvety whipped garlic herb mayonnaise dip, perfect with fries and crusts.',
                'ingredients' => 'Roasted Garlic, Heavy Mayonnaise, Parsley, Lemon Zest',
                'image' => 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => false,
                'aliases' => ['garlic mayo', 'mayo', 'dip', 'sauce', 'chatni', 'extra sauce'],
                'stock_quantity' => 100,
            ],

            // Beverages
            [
                'item_code' => 'd1',
                'name' => 'Pepsi Can (345ml)',
                'name_ur' => 'پیپسی کین (۳۴۵ ملی)',
                'category' => 'drinks',
                'category_id' => $categoryMap['drinks'],
                'price' => 90,
                'available' => true,
                'description' => 'Chilled refreshing Pepsi cola can served ice cold.',
                'ingredients' => 'Carbonated Cola, Caramel, Ice-cold',
                'image' => 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => true,
                'aliases' => ['pepsi', 'pepsi can', 'cold drink', 'thandi pepsi', 'pepsi can 345ml', 'coke'],
                'stock_quantity' => 80,
            ],
            [
                'item_code' => 'd2',
                'name' => '7Up Lemon Lime (345ml)',
                'name_ur' => 'سیون اپ (۳۴۵ ملی)',
                'category' => 'drinks',
                'category_id' => $categoryMap['drinks'],
                'price' => 90,
                'available' => true,
                'description' => 'Crisp sparkling lemon and lime flavored carbonated drink.',
                'ingredients' => 'Sparkling Lemon Lime Beverage, Ice-cold',
                'image' => 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => false,
                'aliases' => ['7up', 'seven up', 'lemon drink', 'white drink', 'sprite'],
                'stock_quantity' => 70,
            ],
            [
                'item_code' => 'd3',
                'name' => 'Nestle Pure Life Mineral Water (500ml)',
                'name_ur' => 'پانی کی بوتل (۵۰۰ ملی)',
                'category' => 'drinks',
                'category_id' => $categoryMap['drinks'],
                'price' => 60,
                'available' => true,
                'description' => 'Pure and balanced mineral drinking water bottle.',
                'ingredients' => 'Purified Mineral Water',
                'image' => 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => false,
                'aliases' => ['water', 'paani', 'pani', 'mineral water', 'water bottle'],
                'stock_quantity' => 120,
            ],

            // Value Deals
            [
                'item_code' => 'deal1',
                'name' => 'Midnight Zinger Feast (Deal 1)',
                'name_ur' => 'مڈنائٹ زنگر ڈیل ۱',
                'category' => 'deals',
                'category_id' => $categoryMap['deals'],
                'price' => 699,
                'available' => true,
                'description' => '1x Crispy Zinger Burger + 1x Regular Crinkle Fries + 1x Chilled Pepsi Can (Save Rs. 190).',
                'ingredients' => 'Crispy Zinger Burger, Crinkle Fries, Chilled Pepsi Can 345ml',
                'image' => 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=450&fit=crop&q=80',
                'is_spicy' => true,
                'is_popular' => true,
                'aliases' => ['deal 1', 'midnight deal 1', 'zinger deal', 'zinger combo', 'midnight deal', 'deal one'],
                'stock_quantity' => 50,
            ],
            [
                'item_code' => 'deal2',
                'name' => 'Royal Family Pizza Feast (Deal 2)',
                'name_ur' => 'شاہی فیملی پیزا ڈیل ۲',
                'category' => 'deals',
                'category_id' => $categoryMap['deals'],
                'price' => 2499,
                'available' => true,
                'description' => '1x Large Fajita Pizza + 1x Medium Tikka Pizza + 1x 1.5L Jumbo Drink + Garlic Bread (Save Rs. 650).',
                'ingredients' => 'Large Pizza, Medium Pizza, 1.5L Beverage, Cheesy Garlic Bread',
                'image' => 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=600&h=450&fit=crop&q=80',
                'is_spicy' => false,
                'is_popular' => true,
                'aliases' => ['deal 2', 'family deal', 'pizza deal', 'large pizza deal', 'family feast', 'deal two'],
                'stock_quantity' => 30,
            ],
        ];

        $menuItemMap = [];
        foreach ($menuItemsData as $item) {
            $created = MenuItem::updateOrCreate(['item_code' => $item['item_code']], $item);
            $menuItemMap[$item['item_code']] = $created;
        }

        // 4. Seed Realistic Initial Orders
        $order1 = Order::updateOrCreate(
            ['order_number' => '#PK-101'],
            [
                'user_id' => $customer1->id,
                'customer_name' => $customer1->name,
                'customer_phone' => $customer1->phone,
                'customer_email' => $customer1->email,
                'delivery_address' => $customer1->address,
                'subtotal' => 1089.00,
                'delivery_fee' => 150.00,
                'discount' => 0.00,
                'grand_total' => 1239.00,
                'status' => 'Preparing',
                'channel' => 'AI Chatbot',
                'payment_method' => 'Cash on Delivery (COD)',
                'payment_status' => 'Pending',
                'notes' => 'Please bring garlic mayo sauce and keep chicken extra crispy.',
                'risk_flag' => false,
                'risk_reason' => null,
                'estimated_delivery_time' => '25-30 mins',
                'transcript' => [
                    ['sender' => 'user', 'text' => 'Assalam o alaikum, 1 midnight deal 1 bhej dein aur 6 hot wings.', 'time' => '12:18 PM'],
                    ['sender' => 'agent', 'text' => 'Walaikum Assalam! Midnight Zinger Feast (Deal 1) aur 6 Fiery Hot Wings cart mein shamil kar diye hain.', 'time' => '12:18 PM'],
                    ['sender' => 'user', 'text' => 'Haan garlic mayo bhi daal dena, Gulberg 3 address pe COD kardo.', 'time' => '12:19 PM'],
                    ['sender' => 'agent', 'text' => 'Total bill Rs. 1,239 hai with delivery. Order confirm kar doon?', 'time' => '12:19 PM'],
                    ['sender' => 'user', 'text' => 'Haan bhai bilkul confirm hai.', 'time' => '12:20 PM'],
                    ['sender' => 'agent', 'text' => 'Shukriya! Order #PK-101 confirm ho gaya hai aur kitchen mein tayyar ho raha hai.', 'time' => '12:20 PM'],
                ],
            ]
        );

        // Attach items for Order 1
        $order1->items()->delete();
        $order1->items()->createMany([
            [
                'menu_item_id' => $menuItemMap['deal1']->id,
                'item_code' => 'deal1',
                'name' => 'Midnight Zinger Feast (Deal 1)',
                'price' => 699.00,
                'quantity' => 1,
                'modifiers' => ['Chilled Pepsi Can'],
                'subtotal' => 699.00,
            ],
            [
                'menu_item_id' => $menuItemMap['s2']->id,
                'item_code' => 's2',
                'name' => 'Fiery Buffalo Hot Wings (6 Pcs)',
                'price' => 390.00,
                'quantity' => 1,
                'modifiers' => ['Spicy Buffalo Glaze', 'Garlic Mayo Dip'],
                'subtotal' => 390.00,
            ]
        ]);

        $order2 = Order::updateOrCreate(
            ['order_number' => '#PK-102'],
            [
                'user_id' => $customer2->id,
                'customer_name' => $customer2->name,
                'customer_phone' => $customer2->phone,
                'customer_email' => $customer2->email,
                'delivery_address' => $customer2->address,
                'subtotal' => 3570.00,
                'delivery_fee' => 150.00,
                'discount' => 0.00,
                'grand_total' => 3720.00,
                'status' => 'Pending',
                'channel' => 'AI Chatbot',
                'payment_method' => 'Cash on Delivery (COD)',
                'payment_status' => 'Pending',
                'notes' => 'Call on delivery arrival at shop 12.',
                'risk_flag' => true,
                'risk_reason' => 'High cancellation record (4 cancelled deliveries in history)',
                'estimated_delivery_time' => '35-40 mins',
                'transcript' => [
                    ['sender' => 'user', 'text' => 'Bhai 2 large fajita pizza aur 3 thandi pepsi chahiye.', 'time' => '12:28 PM'],
                    ['sender' => 'agent', 'text' => 'Zabardast! 2x Chicken Fajita Pizza (Large) aur 3x Pepsi Can cart mein add kar diye.', 'time' => '12:28 PM'],
                    ['sender' => 'user', 'text' => 'Address Rawalpindi shop 12 commercial market hai.', 'time' => '12:29 PM'],
                    ['sender' => 'agent', 'text' => 'Total bill Rs. 3,720 COD ban gaya. Confirm kar doon?', 'time' => '12:29 PM'],
                    ['sender' => 'user', 'text' => 'Haan bhai jaldi confirm kar do.', 'time' => '12:30 PM'],
                ],
            ]
        );

        $order2->items()->delete();
        $order2->items()->createMany([
            [
                'menu_item_id' => $menuItemMap['p2']->id,
                'item_code' => 'p2',
                'name' => 'Chicken Fajita Pizza (Large)',
                'price' => 1650.00,
                'quantity' => 2,
                'modifiers' => ['Extra Cheese'],
                'subtotal' => 3300.00,
            ],
            [
                'menu_item_id' => $menuItemMap['d1']->id,
                'item_code' => 'd1',
                'name' => 'Pepsi Can (345ml)',
                'price' => 90.00,
                'quantity' => 3,
                'modifiers' => ['Ice Cold'],
                'subtotal' => 270.00,
            ]
        ]);

        $order3 = Order::updateOrCreate(
            ['order_number' => '#PK-103'],
            [
                'user_id' => $customer3->id,
                'customer_name' => $customer3->name,
                'customer_phone' => $customer3->phone,
                'customer_email' => $customer3->email,
                'delivery_address' => $customer3->address,
                'subtotal' => 2499.00,
                'delivery_fee' => 150.00,
                'discount' => 100.00,
                'grand_total' => 2549.00,
                'status' => 'Ready',
                'channel' => 'Web Order',
                'payment_method' => 'Credit / Debit Card',
                'payment_status' => 'Paid',
                'notes' => 'Leave with security guard if not answering.',
                'risk_flag' => false,
                'risk_reason' => null,
                'estimated_delivery_time' => 'Dispatched - on way',
            ]
        );

        $order3->items()->delete();
        $order3->items()->createMany([
            [
                'menu_item_id' => $menuItemMap['deal2']->id,
                'item_code' => 'deal2',
                'name' => 'Royal Family Pizza Feast (Deal 2)',
                'price' => 2499.00,
                'quantity' => 1,
                'modifiers' => ['Thin Crust on Medium Tikka', 'Garlic Dip Included'],
                'subtotal' => 2499.00,
            ]
        ]);

        $order4 = Order::updateOrCreate(
            ['order_number' => '#PK-104'],
            [
                'user_id' => $customer1->id,
                'customer_name' => $customer1->name,
                'customer_phone' => $customer1->phone,
                'customer_email' => $customer1->email,
                'delivery_address' => $customer1->address,
                'subtotal' => 1300.00,
                'delivery_fee' => 150.00,
                'discount' => 0.00,
                'grand_total' => 1450.00,
                'status' => 'Delivered',
                'channel' => 'Web Order',
                'payment_method' => 'Cash on Delivery (COD)',
                'payment_status' => 'Paid',
                'notes' => 'Customer was very satisfied with quick delivery.',
                'risk_flag' => false,
                'risk_reason' => null,
                'estimated_delivery_time' => 'Delivered successfully',
            ]
        );

        $order4->items()->delete();
        $order4->items()->createMany([
            [
                'menu_item_id' => $menuItemMap['b1']->id,
                'item_code' => 'b1',
                'name' => 'Crispy Zinger Burger',
                'price' => 520.00,
                'quantity' => 2,
                'modifiers' => ['Spicy'],
                'subtotal' => 1040.00,
            ],
            [
                'menu_item_id' => $menuItemMap['d1']->id,
                'item_code' => 'd1',
                'name' => 'Pepsi Can (345ml)',
                'price' => 90.00,
                'quantity' => 2,
                'modifiers' => ['Chilled'],
                'subtotal' => 180.00,
            ],
            [
                'menu_item_id' => $menuItemMap['s3']->id,
                'item_code' => 's3',
                'name' => 'Garlic Mayo Dip Sauce',
                'price' => 80.00,
                'quantity' => 1,
                'modifiers' => [],
                'subtotal' => 80.00,
            ],
        ]);
    }
}
