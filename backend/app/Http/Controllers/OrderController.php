<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Get list of orders
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');

        $query = Order::with('items')->latest();

        // If authenticated customer (not admin), only show their orders
        if ($user && $user->role === 'customer') {
            $query->where('user_id', $user->id);
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search filter (order number, customer name, phone)
        if ($request->filled('search')) {
            $term = trim($request->search);
            $query->where(function ($q) use ($term) {
                $q->where('order_number', 'like', "%{$term}%")
                  ->orWhere('customer_name', 'like', "%{$term}%")
                  ->orWhere('customer_phone', 'like', "%{$term}%")
                  ->orWhere('delivery_address', 'like', "%{$term}%");
            });
        }

        $orders = $query->get();

        return response()->json([
            'orders' => $orders,
            'total' => $orders->count(),
        ]);
    }

    /**
     * Create / Place a new Order
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:30',
            'customer_email' => 'nullable|email',
            'delivery_address' => 'required|string|max:500',
            'channel' => 'nullable|string|in:Web Order,AI Chatbot,Voice Agent',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.item_code' => 'nullable|string',
            'items.*.modifiers' => 'nullable|array',
            'transcript' => 'nullable|array',
        ]);

        $user = $request->user('sanctum');

        return DB::transaction(function () use ($validated, $user) {
            // Calculate subtotal from validated items
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $lineSubtotal = floatval($item['price']) * intval($item['quantity']);
                $subtotal += $lineSubtotal;

                // Lookup menuItem by item_code or name if available
                $menuItem = null;
                if (!empty($item['item_code'])) {
                    $menuItem = MenuItem::where('item_code', $item['item_code'])->first();
                }
                if (!$menuItem) {
                    $menuItem = MenuItem::where('name', $item['name'])->first();
                }

                $orderItemsData[] = [
                    'menu_item_id' => $menuItem?->id,
                    'item_code' => $menuItem?->item_code ?? ($item['item_code'] ?? null),
                    'name' => $item['name'],
                    'price' => floatval($item['price']),
                    'quantity' => intval($item['quantity']),
                    'modifiers' => $item['modifiers'] ?? null,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $deliveryFee = 150.00;
            $discount = 0.00;
            $grandTotal = $subtotal + $deliveryFee - $discount;

            // Generate order number #PK-(latest ID + 100)
            $lastId = Order::max('id') ?? 0;
            $orderNumber = '#PK-' . (100 + $lastId + 1);

            // Automated Risk and Fraud Detection
            $riskFlag = false;
            $riskReason = null;

            // Check if phone or user has past cancellations
            if ($user && $user->risk_level === 'High') {
                $riskFlag = true;
                $riskReason = 'Customer flagged for past delivery cancellations';
            } elseif ($grandTotal > 5000 && ($validated['payment_method'] ?? 'Cash on Delivery (COD)') === 'Cash on Delivery (COD)') {
                $riskFlag = true;
                $riskReason = 'High value Cash on Delivery (COD) order requires kitchen phone confirmation';
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user?->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'] ?? $user?->email,
                'delivery_address' => $validated['delivery_address'],
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount' => $discount,
                'grand_total' => $grandTotal,
                'status' => 'Pending',
                'channel' => $validated['channel'] ?? 'Web Order',
                'payment_method' => $validated['payment_method'] ?? 'Cash on Delivery (COD)',
                'payment_status' => 'Pending',
                'notes' => $validated['notes'] ?? null,
                'risk_flag' => $riskFlag,
                'risk_reason' => $riskReason,
                'estimated_delivery_time' => '30-40 mins',
                'transcript' => $validated['transcript'] ?? null,
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            $order->load('items');

            return response()->json([
                'message' => 'Order placed successfully! Kitchen has received your ticket.',
                'order' => $order,
            ], 201);
        });
    }

    /**
     * Get single order
     */
    public function show($id): JsonResponse
    {
        $order = Order::with('items')->findOrFail($id);
        return response()->json(['order' => $order]);
    }

    /**
     * Customer Track Order by Order Number (e.g. PK-101 or #PK-101)
     */
    public function track($orderNumber): JsonResponse
    {
        $cleanNumber = '#' . ltrim(trim($orderNumber), '#');
        $order = Order::with('items')
            ->where('order_number', $cleanNumber)
            ->orWhere('order_number', trim($orderNumber))
            ->first();

        if (!$order) {
            return response()->json([
                'message' => "Order {$orderNumber} could not be found. Please double-check your order number.",
            ], 404);
        }

        // Calculate progress percentage and steps based on status
        $statusMap = [
            'Pending' => ['step' => 1, 'percent' => 20, 'text' => 'Order Received & Awaiting Kitchen Confirmation'],
            'Preparing' => ['step' => 2, 'percent' => 50, 'text' => 'Chef is currently preparing your meal hot & fresh'],
            'Ready' => ['step' => 3, 'percent' => 75, 'text' => 'Packed & Waiting for Delivery Rider Dispatch'],
            'Delivered' => ['step' => 4, 'percent' => 100, 'text' => 'Order Delivered! Enjoy your delicious meal.'],
            'Cancelled' => ['step' => 0, 'percent' => 0, 'text' => 'This order was cancelled.'],
        ];

        $trackingInfo = $statusMap[$order->status] ?? $statusMap['Pending'];

        return response()->json([
            'order' => $order,
            'tracking' => [
                'current_step' => $trackingInfo['step'],
                'progress_percent' => $trackingInfo['percent'],
                'status_message' => $trackingInfo['text'],
                'estimated_time' => $order->estimated_delivery_time ?? '30-40 mins',
                'timeline' => [
                    ['title' => 'Order Placed', 'done' => true, 'time' => $order->created_at->format('h:i A')],
                    ['title' => 'Kitchen Preparing', 'done' => in_array($order->status, ['Preparing', 'Ready', 'Delivered'])],
                    ['title' => 'Ready for Dispatch', 'done' => in_array($order->status, ['Ready', 'Delivered'])],
                    ['title' => 'Delivered to Address', 'done' => $order->status === 'Delivered'],
                ]
            ]
        ]);
    }

    /**
     * Admin: Update Order Status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Pending,Preparing,Ready,Delivered,Cancelled',
        ]);

        $order = Order::with('items')->findOrFail($id);
        $order->status = $validated['status'];

        if ($validated['status'] === 'Delivered') {
            $order->payment_status = 'Paid';
        }

        $order->save();

        return response()->json([
            'message' => "Order {$order->order_number} status updated to {$order->status}",
            'order' => $order,
        ]);
    }

    /**
     * Cancel an Order (Customer or Admin)
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        if ($order->status === 'Delivered') {
            return response()->json([
                'message' => 'Cannot cancel an order that has already been delivered.',
            ], 422);
        }

        $reason = $request->input('reason', 'Cancelled by user/restaurant');
        $order->status = 'Cancelled';
        $order->notes = ($order->notes ? $order->notes . "\n" : '') . "Cancellation note: " . $reason;
        $order->save();

        return response()->json([
            'message' => "Order {$order->order_number} has been cancelled.",
            'order' => $order,
        ]);
    }

    /**
     * Admin: Statistics & KPI Summary for Kitchen Operations
     */
    public function stats(Request $request): JsonResponse
    {
        $totalOrders = Order::count();
        $validOrders = Order::where('status', '!=', 'Cancelled');
        $totalRevenue = $validOrders->sum('grand_total');

        $pendingCount = Order::whereIn('status', ['Pending', 'Preparing'])->count();
        $readyCount = Order::where('status', 'Ready')->count();
        $deliveredCount = Order::where('status', 'Delivered')->count();
        $cancelledCount = Order::where('status', 'Cancelled')->count();

        $avgOrderValue = $validOrders->count() > 0 ? round($totalRevenue / $validOrders->count(), 0) : 0;

        // Top 5 selling items
        $topItems = OrderItem::select('name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('name')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        // Orders by channel
        $byChannel = Order::select('channel', DB::raw('count(*) as count'))
            ->groupBy('channel')
            ->get();

        // Recent orders
        $recentOrders = Order::with('items')->latest()->take(6)->get();

        return response()->json([
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'pending_orders' => $pendingCount,
            'ready_orders' => $readyCount,
            'delivered_orders' => $deliveredCount,
            'cancelled_orders' => $cancelledCount,
            'avg_order_value' => $avgOrderValue,
            'top_items' => $topItems,
            'channel_breakdown' => $byChannel,
            'recent_orders' => $recentOrders,
        ]);
    }
}
