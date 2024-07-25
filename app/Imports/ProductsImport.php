<?php

namespace App\Imports;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductsImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        Log::info($row);
        // Find or create the brand
        $brand = Brand::firstOrCreate(['name' => $row['brand']]);

        // Find or create the category
        $category = Category::firstOrCreate(['name' => $row['category']]);
        Log::info($brand);
        Log::info($category);


        // Find the product by ASIN
        $product = Product::where('asin', $row['asin'])->first();

        if ($product) {
            // Update the product if it exists
            $product->update([
                'title'       => $row['product_title'],
                'image_url'   => $row['product_image_url'],
                'cost'        => $row['cost'],
                'stock'       => $row['stock'],
                'brand_id'    => $brand->id,
                'category_id' => $category->id,
            ]);
        } else {
            // Create a new product if it doesn't exist
            $product = new Product([
                'asin'        => $row['asin'],
                'title'       => $row['product_title'],
                'image_url'   => $row['product_image_url'],
                'cost'        => $row['cost'],
                'stock'       => $row['stock'],
                'brand_id'    => $brand->id,
                'category_id' => $category->id,
            ]);
        }

        return $product;
    }
}
