<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Price;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        try {
            Log::info($request);


            // 'price' => 4250,
            // 'title' => 'RawChemistry Raw A Pheromone Infused Cologne - A Cologne with Pheromones for Men 1 oz.',
            // 'imageUrl' => 'https://m.media-amazon.com/images/I/71SmGAyKrHL._AC_SX425_.jpg',
            // 'brand' => 'RawChemistry',
            // 'buyBoxWinner' => 'bareeq.home',
            // 'Category' => 'Beauty',
            // 'categoryRank' => '#39,944',
            // 'subCategoryRank' => '#85',

            foreach ($request->input('products') as $product) {

                if ($product['price'] !== 'Not found' && is_numeric($product['price'])) {
                    $createBrand = Brand::firstOrCreate([
                        'name' => $product['brand'],
                    ]);

                    $createCategory = Category::firstOrCreate([
                        'name' => $product['Category'],
                    ]);

                    $createSeller = Seller::firstOrCreate([
                        'name' => $product['buyBoxWinner'],
                    ]);

                    $createProduct = Product::firstOrCreate([
                        'asin' => $product['asin'],
                    ], [
                        'title' => $product['title'],
                        'image_url' => $product['imageUrl'],
                        'brand_id' => $createBrand->id,
                        'category_id' => $createCategory->id,
                    ]);

                    Price::create([
                        'product_id' => $createProduct->id,
                        'seller_id' => $createSeller->id,
                        'price' => $product['price'],
                        'is_buy_box' => true,
                    ]);
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $ex) {
            Log::info($ex);
            return response()->json(['error' => $ex->getMessage()], 500);
        }
    }
}
