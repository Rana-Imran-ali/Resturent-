<?php

namespace App\Services;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\VectorKnowledgeBase;
use Illuminate\Support\Str;

class VectorRagService
{
    protected int $dimensions = 64;

    /**
     * Semantic feature dictionary for multi-lingual food & restaurant domain
     * (English, Roman Urdu, Urdu Script)
     */
    protected array $semanticKeywords = [
        // Food types
        'burger' => [0, 1.0], 'zinger' => [0, 0.95], 'patty' => [0, 0.9], 'beef' => [1, 1.0],
        'chicken' => [2, 1.0], 'murgh' => [2, 0.9], 'fillet' => [2, 0.85],
        'pizza' => [3, 1.0], 'fajita' => [3, 0.9], 'tikka' => [3, 0.9], 'crust' => [3, 0.85],
        'cheese' => [4, 1.0], 'cheesy' => [4, 0.95], 'mozzarella' => [4, 0.9], 'cheddar' => [4, 0.9],
        'fries' => [5, 1.0], 'chips' => [5, 0.9], 'wings' => [6, 1.0], 'hot wings' => [6, 0.95],
        'drink' => [7, 1.0], 'pepsi' => [7, 0.95], '7up' => [7, 0.9], 'water' => [8, 1.0], 'pani' => [8, 0.95],
        'deal' => [9, 1.0], 'combo' => [9, 0.95], 'midnight' => [9, 0.85], 'family' => [9, 0.85],

        // Taste & Traits
        'spicy' => [10, 1.0], 'mirch' => [10, 0.95], 'masala' => [10, 0.9], 'fiery' => [10, 0.9], 'hot' => [10, 0.85],
        'crispy' => [11, 1.0], 'fried' => [11, 0.9], 'grilled' => [12, 1.0], 'bbq' => [12, 0.9],
        'sauce' => [13, 1.0], 'mayo' => [13, 0.95], 'garlic' => [13, 0.9], 'dip' => [13, 0.85],

        // Price, Deals, Cost
        'price' => [14, 1.0], 'cost' => [14, 0.9], 'kitna' => [14, 0.95], 'paisa' => [14, 0.9], 'bill' => [14, 0.9],
        'rate' => [14, 0.85], 'discount' => [15, 1.0], 'sasta' => [15, 0.9], 'offer' => [15, 0.9],

        // Operational policies
        'delivery' => [16, 1.0], 'bhejna' => [16, 0.9], 'rider' => [16, 0.85], 'charges' => [16, 0.9], 'fee' => [16, 0.9],
        'time' => [17, 1.0], 'kitni der' => [17, 0.95], 'timing' => [17, 0.9], 'der' => [17, 0.85], 'hours' => [17, 0.8],
        'address' => [18, 1.0], 'location' => [18, 0.95], 'kahan' => [18, 0.9], 'branch' => [18, 0.85], 'gulberg' => [18, 0.8],
        'payment' => [19, 1.0], 'cod' => [19, 0.95], 'cash' => [19, 0.9], 'card' => [19, 0.85], 'jazzcash' => [19, 0.9], 'easypaisa' => [19, 0.9],
        'order' => [20, 1.0], 'status' => [20, 0.95], 'track' => [20, 0.95], 'cancel' => [21, 1.0], 'cancelation' => [21, 0.9],
        'halal' => [22, 1.0], 'hygiene' => [22, 0.9], 'clean' => [22, 0.85],
        'available' => [23, 1.0], 'khatam' => [23, 0.9], 'stock' => [23, 0.95], '86' => [23, 0.9],

        // Urdu script keywords
        'برگر' => [0, 1.0], 'زنگر' => [0, 0.95], 'بیف' => [1, 1.0], 'چکن' => [2, 1.0],
        'پیزا' => [3, 1.0], 'پنیر' => [4, 1.0], 'فرائز' => [5, 1.0], 'ونگز' => [6, 1.0],
        'پیپسی' => [7, 1.0], 'پانی' => [8, 1.0], 'ڈیل' => [9, 1.0], 'مرچ' => [10, 1.0],
        'ڈلیوری' => [16, 1.0], 'وقت' => [17, 1.0], 'قیمت' => [14, 1.0], 'پتہ' => [18, 1.0],
    ];

    /**
     * Generate Dense Normalized Semantic Vector for text (Vector Embedding)
     */
    public function generateEmbedding(string $text): array
    {
        $vector = array_fill(0, $this->dimensions, 0.0);
        $clean = Str::lower($text);
        $tokens = preg_split('/[^\p{L}\p{N}]+/u', $clean, -1, PREG_SPLIT_NO_EMPTY);

        if (empty($tokens)) {
            return $vector;
        }

        // 1. Direct and multi-gram semantic mapping
        $combinedText = implode(' ', $tokens);
        foreach ($this->semanticKeywords as $kw => $info) {
            [$dimIndex, $weight] = $info;
            if (str_contains($combinedText, $kw)) {
                $vector[$dimIndex % $this->dimensions] += $weight;
            }
        }

        // 2. Token hash projections for arbitrary text & subwords
        foreach ($tokens as $token) {
            $len = mb_strlen($token);
            if ($len < 2) continue;

            $hash = crc32($token);
            $idx1 = abs($hash) % $this->dimensions;
            $idx2 = abs($hash >> 5) % $this->dimensions;

            $vector[$idx1] += 0.25;
            $vector[$idx2] += 0.15;
        }

        // 3. Normalize vector (L2 norm) so dot product is exact Cosine Similarity
        $sumSq = 0.0;
        for ($i = 0; $i < $this->dimensions; $i++) {
            $sumSq += $vector[$i] * $vector[$i];
        }

        $norm = sqrt($sumSq);
        if ($norm > 0) {
            for ($i = 0; $i < $this->dimensions; $i++) {
                $vector[$i] = round($vector[$i] / $norm, 6);
            }
        }

        return $vector;
    }

    /**
     * Cosine Similarity between two normalized vectors: dot product
     */
    public function cosineSimilarity(array $vecA, array $vecB): float
    {
        $dot = 0.0;
        $count = min(count($vecA), count($vecB));
        for ($i = 0; $i < $count; $i++) {
            $dot += ($vecA[$i] ?? 0.0) * ($vecB[$i] ?? 0.0);
        }
        return max(0.0, min(1.0, round($dot, 4)));
    }

    /**
     * Retrieve Top-K most relevant knowledge base chunks using Vector Search
     */
    public function vectorSearch(string $query, int $topK = 4, float $threshold = 0.15): array
    {
        // Auto-seed vector store if empty
        if (VectorKnowledgeBase::count() === 0) {
            $this->seedVectorStore();
        }

        $queryEmbedding = $this->generateEmbedding($query);
        $allRecords = VectorKnowledgeBase::all();

        $scored = [];
        foreach ($allRecords as $record) {
            $recordEmbedding = $record->embedding ?? [];
            if (empty($recordEmbedding)) continue;

            $sim = $this->cosineSimilarity($queryEmbedding, $recordEmbedding);
            if ($sim >= $threshold) {
                $scored[] = [
                    'id' => $record->id,
                    'document_type' => $record->document_type,
                    'reference_id' => $record->reference_id,
                    'title' => $record->title,
                    'content' => $record->content,
                    'metadata' => $record->metadata,
                    'similarity' => $sim,
                    'similarity_percent' => round($sim * 100, 1),
                ];
            }
        }

        // Sort by similarity descending
        usort($scored, fn($a, $b) => $b['similarity'] <=> $a['similarity']);

        return array_slice($scored, 0, $topK);
    }

    /**
     * Answer User Question using Retrieval-Augmented Generation (RAG)
     */
    public function answerQuestionWithRag(string $userMessage, array $conversationHistory = []): array
    {
        $trimmed = trim($userMessage);
        $lower = Str::lower($trimmed);

        // 1. Vector Database Retrieval
        $retrievedChunks = $this->vectorSearch($trimmed, 4, 0.12);

        // 2. Language Detection: 'roman_urdu' | 'urdu_script' | 'english'
        $lang = 'english';
        if (preg_match('/[\x{0600}-\x{06FF}]/u', $trimmed)) {
            $lang = 'urdu_script';
        } elseif (preg_match('/\b(bhai|kya|hai|hein|chahiye|chahye|de do|dedo|kardo|kar do|batao|kitna|kitne|hoga|bhejo|thanda|thandi|garam|pani|shukriya|pe|aur|bhi|wala|wali|lagao|mein|konsa|konsi|kab)\b/i', $trimmed)) {
            $lang = 'roman_urdu';
        }

        // 3. Extract items if user wants to add to cart or order
        $extractedItems = $this->extractItemsFromText($trimmed);

        // 4. Construct Context from Retrieved Database Chunks
        $contextLines = [];
        foreach ($retrievedChunks as $chunk) {
            $contextLines[] = "• [{$chunk['title']}]: {$chunk['content']}";
        }
        $ragContext = implode("\n", $contextLines);

        // 5. Intelligent Generation grounded in database
        $reply = $this->generateGroundedResponse($trimmed, $retrievedChunks, $lang, $extractedItems);

        return [
            'reply' => $reply,
            'detected_language' => $lang,
            'retrieved_sources' => $retrievedChunks,
            'extracted_items' => $extractedItems,
            'context_used' => $ragContext,
            'has_retrieval' => count($retrievedChunks) > 0,
        ];
    }

    /**
     * Grounded generator respecting database facts
     */
    protected function generateGroundedResponse(string $query, array $chunks, string $lang, array $items): string
    {
        $q = Str::lower($query);

        // Case A: User is ordering / adding items to cart
        if (!empty($items)) {
            $itemSummaries = [];
            $totalEst = 0;
            foreach ($items as $it) {
                $itemSummaries[] = "{$it['quantity']}x {$it['name']} (Rs. {$it['price']})";
                $totalEst += $it['price'] * $it['quantity'];
            }
            $itemsListStr = implode(' + ', $itemSummaries);

            if ($lang === 'roman_urdu') {
                return "Zabardast! Main ne aapke cart mein {$itemsListStr} add kar diya hai (Subtotal: Rs. {$totalEst}). Kya sath koi chilled drink ya sauce shamil karna chahte hain, ya order confirm kar doon?";
            } elseif ($lang === 'urdu_script') {
                return "بہترین! آپ کی کارٹ میں {$itemsListStr} شامل کر دیا گیا ہے۔ کیا آرڈر کنفرم کر دیں؟";
            } else {
                return "Excellent! I have added {$itemsListStr} to your cart (Subtotal: Rs. {$totalEst}). Would you like to add extra sauce/drinks, or shall I proceed with confirming your delivery?";
            }
        }

        // Case B: Delivery timing / fee questions
        if (str_contains($q, 'delivery') || str_contains($q, 'charges') || str_contains($q, 'time') || str_contains($q, 'der') || str_contains($q, 'timing')) {
            if ($lang === 'roman_urdu') {
                return "Dastarkhwan ki delivery ka flat charge sirf Rs. 150 hai, aur hamara rider aam taur par 25 se 35 minutes ke andar garam khana deliver kar deta hai. Hamare delivery areas mein Gulberg, DHA, Johar Town, Model Town Lahore aur Rawalpindi/Islamabad branches shamil hain.";
            } elseif ($lang === 'urdu_script') {
                return "دستارخوان کے ڈلیوری چارجز صرف 150 روپے ہیں اور آرڈر 25 سے 35 منٹ میں آپ کے پتے پر پہنچ جاتا ہے۔";
            } else {
                return "Our delivery fee is a standard flat Rs. 150 per order, and our average hot delivery time is 25–35 minutes across all delivery zones in Lahore and Islamabad/Rawalpindi.";
            }
        }

        // Case C: Payment methods question
        if (str_contains($q, 'payment') || str_contains($q, 'cod') || str_contains($q, 'cash') || str_contains($q, 'card') || str_contains($q, 'jazzcash') || str_contains($q, 'easypaisa')) {
            if ($lang === 'roman_urdu') {
                return "Aap Cash on Delivery (COD) ke zariye rider ko cash de sakte hain, ya JazzCash, EasyPaisa, aur Debit/Credit Card ke zariye online pay kar sakte hain.";
            } elseif ($lang === 'urdu_script') {
                return "آپ کیش آن ڈیلیوری (COD) یا جاز کیش، ایزی پیسہ اور ڈیبٹ کارڈ کے ذریعے ادائیگی کر سکتے ہیں۔";
            } else {
                return "We accept Cash on Delivery (COD), JazzCash, EasyPaisa mobile wallets, and Visa/Mastercard Debit & Credit Cards.";
            }
        }

        // Case D: Restaurant address / hours question
        if (str_contains($q, 'address') || str_contains($q, 'location') || str_contains($q, 'kahan') || str_contains($q, 'branch') || str_contains($q, 'open') || str_contains($q, 'hours')) {
            if ($lang === 'roman_urdu') {
                return "Hamara main kitchen MM Alam Road, Gulberg III, Lahore mein waqea hai, aur hum rozana dopehar 12:00 PM se raat 3:00 AM tak fresh food serve aur deliver karte hain.";
            } elseif ($lang === 'urdu_script') {
                return "ہمارا مین کچن ایم ایم عالم روڈ گلبرگ لاہور میں واقع ہے۔ اوقات: دوپہر 12 بجے سے رات 3 بجے تک۔";
            } else {
                return "Our main headquarters and kitchen is situated on MM Alam Road, Gulberg III, Lahore. We operate daily from 12:00 PM to 03:00 AM.";
            }
        }

        // Case E: If we retrieved relevant menu item chunks from vector DB
        if (!empty($chunks)) {
            $top = $chunks[0];
            $title = $top['title'];
            $meta = $top['metadata'] ?? [];
            $price = $meta['price'] ?? null;
            $available = $meta['available'] ?? true;
            $spicy = !empty($meta['is_spicy']) ? 'Spicy' : 'Mild/Regular';

            // Check if user asked about ingredients
            if (str_contains($q, 'ingredient') || str_contains($q, 'dalta') || str_contains($q, 'recipe') || str_contains($q, 'bana')) {
                $ing = $meta['ingredients'] ?? $top['content'];
                if ($lang === 'roman_urdu') {
                    return "Database ke mutabiq {$title} mein yeh shamil hai: {$ing}. Is ki qeemat Rs. {$price} hai aur yeh bilkul fresh ready hota hai. Kya cart mein add karoon?";
                } else {
                    return "According to our kitchen records, {$title} contains: {$ing}. The price is Rs. {$price}. Would you like me to add it to your cart?";
                }
            }

            // Check if user asked about price
            if (str_contains($q, 'price') || str_contains($q, 'kitne') || str_contains($q, 'kitna') || str_contains($q, 'cost') || str_contains($q, 'rate')) {
                if ($lang === 'roman_urdu') {
                    return "{$title} ki qeemat Rs. {$price} hai. " . ($available ? "Aur yeh is waqt kitchen mein fresh available hai!" : "Lekin yeh is waqt 86'd sold out hai.");
                } else {
                    return "The price of {$title} is Rs. {$price}. " . ($available ? "It is currently fresh in stock and ready to order!" : "However, it is currently sold out.");
                }
            }

            // General question matching the dish
            if ($lang === 'roman_urdu') {
                return "Ji bilkul! Database records ke mutabiq: {$top['content']}. Is ki qeemat Rs. {$price} hai ({$spicy}). Kya main aap ke liye is ka order book kar doon?";
            } elseif ($lang === 'urdu_script') {
                return "جی بالکل! ڈیٹا بیس کے مطابق: {$top['content']}- قیمت: {$price} روپے۔ کیا آپ یہ آرڈر کرنا چاہیں گے؟";
            } else {
                return "According to our restaurant database: {$top['content']}. The current price is Rs. {$price} ({$spicy}). Would you like me to add this to your order?";
            }
        }

        // Case F: Fallback grounded helpful response
        if ($lang === 'roman_urdu') {
            return "Main Dastarkhwan ka AI Ordering Assistant hoon. Aap mujh se kisi bhi dish ki qeemat, ingredients, deals, delivery timings, ya direct order karne ke baray mein pooch sakte hain. Jaise ke: 'Zinger burger ki price kya hai?' ya '2 large fajita pizza bhej do'.";
        } elseif ($lang === 'urdu_script') {
            return "میں دستارخوان کا اے آئی اسسٹنٹ ہوں۔ آپ کسی بھی کھانے کی قیمت، اجزاء یا ڈیلیوری کے بارے میں پوچھ سکتے ہیں یا آرڈر دے سکتے ہیں۔";
        } else {
            return "I am your Dastarkhwan AI Assistant, grounded in our restaurant database. You can ask me about prices, ingredients, delivery fees, today's deals, or directly order any food by typing e.g. 'Add 2 Zinger Burgers' or 'What is in the Crown Crust Pizza?'.";
        }
    }

    /**
     * Extract menu items and quantities from natural language
     */
    protected function extractItemsFromText(string $text): array
    {
        $norm = Str::lower($text);
        $menuItems = MenuItem::where('available', true)->get();
        $matches = [];

        // Number words mapping
        $numMap = [
            'ek' => 1, 'aik' => 1, 'ak' => 1, 'one' => 1, '1' => 1,
            'do' => 2, 'doh' => 2, 'two' => 2, '2' => 2,
            'teen' => 3, 'tin' => 3, 'three' => 3, '3' => 3,
            'chaar' => 4, 'char' => 4, 'four' => 4, '4' => 4,
            'paanch' => 5, 'panch' => 5, 'five' => 5, '5' => 5,
            'chhe' => 6, 'che' => 6, 'six' => 6, '6' => 6,
        ];

        // Only parse as an order intent if action verbs or quantity words are present
        $isOrderingIntent = preg_match('/\b(bhej|de do|dedo|chahiye|chahye|kardo|kar do|order|add|mangwana|lagao|shamil)\b/i', $text);
        if (!$isOrderingIntent) {
            return [];
        }

        foreach ($menuItems as $item) {
            $matched = false;
            $nameLower = Str::lower($item->name);

            if (str_contains($norm, $nameLower)) {
                $matched = true;
            } else {
                $aliases = $item->aliases ?? [];
                foreach ($aliases as $alias) {
                    if (str_contains($norm, Str::lower($alias))) {
                        $matched = true;
                        break;
                    }
                }
            }

            if ($matched) {
                // Find quantity
                $qty = 1;
                foreach ($numMap as $word => $val) {
                    if (preg_match("/\b{$word}\b/i", $norm)) {
                        $qty = $val;
                        break;
                    }
                }

                $matches[] = [
                    'id' => $item->item_code ?? (string)$item->id,
                    'name' => $item->name,
                    'price' => (float)$item->price,
                    'quantity' => $qty,
                    'category' => $item->category,
                ];
            }
        }

        return $matches;
    }

    /**
     * Seed or Reindex Vector Knowledge Base from live Menu Items and Restaurant Policies
     */
    public function seedVectorStore(): int
    {
        VectorKnowledgeBase::truncate();

        $count = 0;

        // 1. Index All Menu Items from Database
        $menuItems = MenuItem::all();
        foreach ($menuItems as $item) {
            $content = "{$item->name} ({$item->name_ur}). Category: {$item->category}. Price: Rs. {$item->price}. Status: " . ($item->available ? "In Stock & Available" : "Out of Stock / Sold Out") . ". Description: {$item->description}. Ingredients: {$item->ingredients}. Spicy: " . ($item->is_spicy ? "Yes (Hot & Spicy)" : "No (Mild)");
            
            $embedding = $this->generateEmbedding($content . " " . implode(' ', $item->aliases ?? []));

            VectorKnowledgeBase::create([
                'document_type' => 'menu_item',
                'reference_id' => (string)$item->id,
                'title' => $item->name,
                'content' => $content,
                'metadata' => [
                    'item_code' => $item->item_code,
                    'name' => $item->name,
                    'category' => $item->category,
                    'price' => (float)$item->price,
                    'available' => (bool)$item->available,
                    'is_spicy' => (bool)$item->is_spicy,
                    'ingredients' => $item->ingredients,
                ],
                'embedding' => $embedding,
            ]);
            $count++;
        }

        // 2. Index Restaurant Operating Policies & FAQs
        $policies = [
            [
                'title' => 'Standard Delivery Charges & Coverage',
                'content' => 'Dastarkhwan charges a flat delivery fee of Rs. 150 across all operational delivery zones. Free delivery coupons may apply on special deals. Delivery areas cover Gulberg, DHA, Johar Town, Model Town in Lahore, and Blue Area, F-6, F-7, and Commercial Market in Islamabad/Rawalpindi.',
                'metadata' => ['delivery_fee' => 150, 'topic' => 'delivery'],
            ],
            [
                'title' => 'Delivery Time & Kitchen Preparation Speed',
                'content' => 'Standard food delivery arrival time is 25 to 35 minutes from the moment of order confirmation. During peak hours or severe weather, delivery may take up to 45 minutes.',
                'metadata' => ['average_delivery_time' => '25-35 mins', 'topic' => 'timing'],
            ],
            [
                'title' => 'Accepted Payment Methods',
                'content' => 'Dastarkhwan accepts Cash on Delivery (COD), JazzCash, EasyPaisa, and Visa/Mastercard Debit & Credit Cards upon delivery or online.',
                'metadata' => ['payment_methods' => ['Cash on Delivery', 'JazzCash', 'EasyPaisa', 'Cards'], 'topic' => 'payment'],
            ],
            [
                'title' => 'Restaurant Location & Main Headquarter',
                'content' => 'Dastarkhwan Restaurant main kitchen and head office is located on MM Alam Road, Block M, Gulberg III, Lahore, Pakistan. Dedicated branches also serve Islamabad F-7 and Rawalpindi Commercial Market.',
                'metadata' => ['address' => 'MM Alam Road, Gulberg III, Lahore', 'topic' => 'location'],
            ],
            [
                'title' => 'Operating Hours & Midnight Deliveries',
                'content' => 'Dastarkhwan operates daily from 12:00 PM afternoon to 03:00 AM midnight, 7 days a week including weekends and public holidays.',
                'metadata' => ['hours' => '12:00 PM - 03:00 AM', 'topic' => 'hours'],
            ],
            [
                'title' => '100% Halal Food & Kitchen Hygiene Standards',
                'content' => 'All meat used in our burgers, pizzas, and hot wings is strictly 100% Halal certified, sourced daily fresh from licensed poultry and prime beef vendors. Our kitchen operates under ISO food safety standards.',
                'metadata' => ['halal' => true, 'hygiene' => 'ISO Certified', 'topic' => 'hygiene'],
            ],
            [
                'title' => 'Order Cancellation & Refund Policy',
                'content' => 'Customers can cancel their order at any time while the status is in Pending or Kitchen Preparing. Once an order is Marked Ready and dispatched with the rider, cancellation cannot be processed.',
                'metadata' => ['cancellation' => 'Allowed prior to dispatch', 'topic' => 'cancellation'],
            ],
            [
                'title' => 'Special Customizations & Extra Sauces',
                'content' => 'Customers can customize spice levels (Mild, Medium, Extra Spicy) and request extra Garlic Mayo Dip, Spicy Buffalo Glaze, or Ranch for Rs. 80 each.',
                'metadata' => ['sauce_price' => 80, 'topic' => 'customization'],
            ],
        ];

        foreach ($policies as $pol) {
            $embedding = $this->generateEmbedding($pol['title'] . " " . $pol['content']);

            VectorKnowledgeBase::create([
                'document_type' => 'policy',
                'reference_id' => null,
                'title' => $pol['title'],
                'content' => $pol['content'],
                'metadata' => $pol['metadata'],
                'embedding' => $embedding,
            ]);
            $count++;
        }

        return $count;
    }
}
