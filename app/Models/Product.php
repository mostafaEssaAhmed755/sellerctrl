<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'asin',
        'title',
        'image_url',
        'cost',
        'stock',
        'category_id',
        'brand_id',
    ];

    public function prices()
    {
        return $this->hasMany(Price::class)
            ->join(DB::raw('(SELECT MAX(id) as id FROM prices WHERE product_id = ' . $this->id . ' GROUP BY seller_id) as latest_prices'), 'latest_prices.id', '=', 'prices.id')
            ->select('prices.*');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
