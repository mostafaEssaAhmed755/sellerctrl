<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Laravel\Nova\Actions\Actionable;

class Seller extends Model
{
    use HasFactory, Actionable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    public function prices()
    {
        return $this->hasMany(Price::class);
    }

    public function products()
    {
        return $this->hasManyThrough(Product::class, Price::class, 'seller_id', 'id', 'id', 'product_id')
            ->distinct();
    }
}
