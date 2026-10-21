<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',
        'name',
        'name_ur',
        'category',
        'category_id',
        'price',
        'available',
        'description',
        'ingredients',
        'image',
        'is_spicy',
        'is_popular',
        'aliases',
        'stock_quantity',
    ];

    protected $casts = [
        'price' => 'float',
        'available' => 'boolean',
        'is_spicy' => 'boolean',
        'is_popular' => 'boolean',
        'aliases' => 'array',
        'stock_quantity' => 'integer',
    ];

    public function categoryRel()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
