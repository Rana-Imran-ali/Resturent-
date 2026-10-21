<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Admin: List all customers with their order stats
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'customer')
            ->withCount('orders')
            ->with(['orders' => function ($q) {
                $q->latest()->take(3);
            }]);

        if ($request->filled('search')) {
            $term = trim($request->search);
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('phone', 'like', "%{$term}%");
            });
        }

        $customers = $query->get()->map(function ($customer) {
            $totalSpent = $customer->orders()->where('status', '!=', 'Cancelled')->sum('grand_total');
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone ?? 'Not specified',
                'address' => $customer->address ?? 'Not specified',
                'risk_level' => $customer->risk_level ?? 'Low',
                'orders_count' => $customer->orders_count,
                'total_spent' => $totalSpent,
                'created_at' => $customer->created_at->format('M d, Y'),
            ];
        });

        return response()->json([
            'customers' => $customers,
            'total' => $customers->count(),
        ]);
    }

    /**
     * Admin: Update customer risk level
     */
    public function updateRiskLevel(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'risk_level' => 'required|string|in:Low,Medium,High',
        ]);

        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->risk_level = $validated['risk_level'];
        $customer->save();

        return response()->json([
            'message' => "Customer {$customer->name} risk level updated to {$customer->risk_level}",
            'customer' => $customer,
        ]);
    }
}
