<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'delivery_address',
        'subtotal',
        'delivery_fee',
        'discount',
        'grand_total',
        'status',
        'channel',
        'payment_method',
        'payment_status',
        'notes',
        'risk_flag',
        'risk_reason',
        'transcript',
        'estimated_delivery_time',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'delivery_fee' => 'float',
        'discount' => 'float',
        'grand_total' => 'float',
        'risk_flag' => 'boolean',
        'transcript' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
