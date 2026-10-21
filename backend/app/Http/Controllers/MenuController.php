<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MenuController extends Controller
{
    /**
     * Get menu items with optional category and search filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::query();

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('available') && $request->available !== null) {
            $available = filter_var($request->available, FILTER_VALIDATE_BOOLEAN);
            $query->where('available', $available);
        }

        if ($request->filled('search')) {
            $term = trim($request->search);
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('name_ur', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('ingredients', 'like', "%{$term}%")
                  ->orWhere('category', 'like', "%{$term}%");
            });
        }

        $items = $query->orderBy('is_popular', 'desc')->orderBy('id', 'asc')->get();

        return response()->json([
            'items' => $items,
            'total' => $items->count(),
        ]);
    }

    /**
     * Get all categories with item counts
     */
    public function categories(): JsonResponse
    {
        $categories = Category::withCount('menuItems')->orderBy('sort_order', 'asc')->get();
        return response()->json(['categories' => $categories]);
    }

    /**
     * Get single menu item
     */
    public function show($id): JsonResponse
    {
        $item = MenuItem::findOrFail($id);
        return response()->json(['item' => $item]);
    }

    /**
     * Admin: Store new menu item
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ur' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'available' => 'boolean',
            'description' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'image' => 'nullable|url|max:500',
            'is_spicy' => 'boolean',
            'is_popular' => 'boolean',
            'stock_quantity' => 'integer|min:0',
        ]);

        $itemCode = 'item_' . Str::lower(Str::random(6));
        $validated['item_code'] = $itemCode;
        $validated['available'] = $validated['available'] ?? true;

        // Auto assign aliases
        $aliases = [
            Str::lower($validated['name']),
            $validated['category'],
        ];
        if (!empty($validated['name_ur'])) {
            $aliases[] = $validated['name_ur'];
        }
        $validated['aliases'] = $aliases;

        $item = MenuItem::create($validated);

        return response()->json([
            'message' => 'Menu item created successfully',
            'item' => $item
        ], 201);
    }

    /**
     * Admin: Update menu item
     */
    public function update(Request $request, $id): JsonResponse
    {
        $item = MenuItem::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'name_ur' => 'nullable|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'price' => 'sometimes|required|numeric|min:0',
            'available' => 'boolean',
            'description' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'image' => 'nullable|url|max:500',
            'is_spicy' => 'boolean',
            'is_popular' => 'boolean',
            'stock_quantity' => 'integer|min:0',
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Menu item updated successfully',
            'item' => $item
        ]);
    }

    /**
     * Admin: Quick toggle item availability (86 control)
     */
    public function toggleAvailability(Request $request, $id): JsonResponse
    {
        $item = MenuItem::findOrFail($id);
        $item->available = !$item->available;
        $item->save();

        return response()->json([
            'message' => $item->available ? "{$item->name} is now available" : "{$item->name} is marked as Sold Out (86'd)",
            'item' => $item,
        ]);
    }

    /**
     * Admin: Delete menu item
     */
    public function destroy($id): JsonResponse
    {
        $item = MenuItem::findOrFail($id);
        $name = $item->name;
        $item->delete();

        return response()->json([
            'message' => "Item '{$name}' has been deleted successfully",
        ]);
    }

    /**
     * Smart Food Recommendation & Natural Language Query Processor
     * E.g. "Mujhe spicy chicken burger chahiye", "kuch cheese wala khana hai", "thanda drink"
     */
    public function smartRecommend(Request $request): JsonResponse
    {
        $rawQuery = trim($request->input('query', ''));
        if (empty($rawQuery)) {
            $featured = MenuItem::where('is_popular', true)->where('available', true)->take(4)->get();
            return response()->json([
                'query' => '',
                'intent' => 'general_recommendation',
                'matches' => $featured,
                'alternatives' => [],
                'explanation' => 'Here are our most popular chef recommendations today.',
            ]);
        }

        $all = MenuItem::all();
        $q = Str::lower($rawQuery);

        // Trait keywords in Roman Urdu & English
        $traits = [
            'spicy' => ['spicy', 'mirch', 'masala', 'fiery', 'tez', 'chilli', 'chili', 'hot', 'tikka', 'buffalo'],
            'cheesy' => ['cheese', 'cheesy', 'paneer', 'cheddar', 'mozzarella', 'molten'],
            'chicken' => ['chicken', 'murgh', 'murgi', 'zinger', 'fillet', 'fajita', 'tikka', 'wings'],
            'beef' => ['beef', 'patty', 'bada gosht', 'meat', 'smash'],
            'drinks' => ['drink', 'pepsi', 'coke', 'thanda', 'thandi', 'beverage', 'water', 'pani', '7up', 'juice'],
            'pizza' => ['pizza', 'piza', 'crust', 'fajita', 'tikka pizza', 'crown crust'],
            'burger' => ['burger', 'zinger', 'bargur', 'bun', 'patty burger'],
            'deals' => ['deal', 'combo', 'saving', 'family', 'midnight', 'sasta', 'budget'],
        ];

        // Score each menu item against query and traits
        $scored = $all->map(function ($item) use ($q, $traits) {
            $score = 0;
            $reasons = [];

            $nameLower = Str::lower($item->name);
            $descLower = Str::lower($item->description ?? '');
            $ingLower = Str::lower($item->ingredients ?? '');
            $catLower = Str::lower($item->category);
            $aliases = array_map('strtolower', $item->aliases ?? []);

            // 1. Exact or partial name match
            if (str_contains($q, $nameLower)) {
                $score += 100;
                $reasons[] = 'Exact name match';
            } else {
                $nameWords = explode(' ', $nameLower);
                foreach ($nameWords as $w) {
                    if (strlen($w) > 2 && str_contains($q, $w)) {
                        $score += 25;
                        $reasons[] = "Matched '{$w}' in name";
                    }
                }
            }

            // 2. Aliases match
            foreach ($aliases as $alias) {
                if (str_contains($q, $alias)) {
                    $score += 50;
                    $reasons[] = "Matched keyword '{$alias}'";
                    break;
                }
            }

            // 3. Category match
            if (str_contains($q, $catLower)) {
                $score += 30;
                $reasons[] = "Matches category '{$item->category}'";
            }

            // 4. Description and ingredients match
            $queryTokens = explode(' ', preg_replace('/[^\w\s]/', ' ', $q));
            foreach ($queryTokens as $token) {
                if (strlen($token) < 3) continue;
                if (str_contains($descLower, $token)) {
                    $score += 15;
                    $reasons[] = "Mentions '{$token}'";
                }
                if (str_contains($ingLower, $token)) {
                    $score += 20;
                    $reasons[] = "Contains '{$token}'";
                }
            }

            // 5. Trait bonuses (e.g. user asked for spicy and item is spicy)
            foreach ($traits as $trait => $keywords) {
                $queryHasTrait = false;
                foreach ($keywords as $kw) {
                    if (str_contains($q, $kw)) {
                        $queryHasTrait = true;
                        break;
                    }
                }

                if ($queryHasTrait) {
                    if ($trait === 'spicy' && $item->is_spicy) {
                        $score += 35;
                        $reasons[] = 'Spicy preference match';
                    }
                    if ($trait === 'cheesy' && (str_contains($nameLower, 'cheese') || str_contains($descLower, 'cheese'))) {
                        $score += 35;
                        $reasons[] = 'Cheesy preference match';
                    }
                    if ($trait === 'drinks' && $item->category === 'drinks') {
                        $score += 40;
                        $reasons[] = 'Beverage category match';
                    }
                    if ($trait === 'burger' && $item->category === 'burgers') {
                        $score += 35;
                        $reasons[] = 'Burger category match';
                    }
                    if ($trait === 'pizza' && $item->category === 'pizza') {
                        $score += 35;
                        $reasons[] = 'Pizza category match';
                    }
                    if ($trait === 'deals' && $item->category === 'deals') {
                        $score += 40;
                        $reasons[] = 'Value deal match';
                    }
                }
            }

            return [
                'item' => $item,
                'score' => $score,
                'reasons' => array_unique($reasons),
            ];
        });

        // Filter items with score > 0 and sort by score descending
        $matching = $scored->filter(fn($s) => $s['score'] > 0)->sortByDesc('score')->values();

        // Separate into available matches and alternatives
        $availableMatches = $matching->filter(fn($m) => $m['item']->available)->values();
        $unavailableMatches = $matching->filter(fn($m) => !$m['item']->available)->values();

        $directMatches = $availableMatches->take(4)->pluck('item')->all();
        $reasons = $availableMatches->take(4)->pluck('reasons')->flatten()->unique()->values()->all();

        // If no direct matches, or if closest match is unavailable, find best alternatives
        $alternatives = [];
        if (count($directMatches) === 0 || $unavailableMatches->count() > 0) {
            // Pick popular items from closest categories
            $suggestedCategory = $matching->first()['item']->category ?? 'burgers';
            $alternatives = MenuItem::where('available', true)
                ->where('category', $suggestedCategory)
                ->take(3)
                ->get();

            if ($alternatives->isEmpty()) {
                $alternatives = MenuItem::where('available', true)->where('is_popular', true)->take(3)->get();
            }
        }

        $explanation = count($directMatches) > 0
            ? "Found " . count($directMatches) . " delicious match(es) for your craving: " . implode(', ', array_slice($reasons, 0, 3))
            : "We couldn't find an exact item matching your query, but here are our closest recommended favorites!";

        return response()->json([
            'query' => $rawQuery,
            'intent' => 'smart_search_match',
            'matches' => $directMatches,
            'alternatives' => $alternatives,
            'explanation' => $explanation,
        ]);
    }
}
