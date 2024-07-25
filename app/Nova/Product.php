<?php

namespace App\Nova;

use App\Nova\Actions\ImportProducts;
use Illuminate\Http\Request;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Http\Requests\NovaRequest;
use Chaseconey\ExternalImage\ExternalImage;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Illuminate\Support\Str;
use Maatwebsite\LaravelNovaExcel\Actions\DownloadExcel;

class Product extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<\App\Models\Product>
     */
    public static $model = \App\Models\Product::class;

    /**
     * Get the value that should be displayed to represent the resource.
     *
     * @return string
     */
    public function title()
    {
        return $this->asin . ' - ' . Str::limit($this->title, 70);
    }

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id', 'asin', 'title',
    ];

    /**
     * Indicates whether the resource should automatically poll for new resources.
     *
     * @var bool
     */
    public static $polling = false;

    /**
     * The interval at which Nova should poll for new resources.
     *
     * @var int
     */
    public static $pollingInterval = 25;

    /**
     * Indicates whether to show the polling toggle button inside Nova.
     *
     * @var bool
     */
    public static $showPollingToggle = true;

    /**
     * Get the fields displayed by the resource.
     *
     * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
     * @return array
     */
    public function fields(NovaRequest $request)
    {
        return [
            ID::make()->sortable(),
            Text::make(__('ASIN'), 'asin')->copyable()->required(),
            Text::make(__('Title'), 'title')->displayUsing(function () {
                return Str::limit($this->title, 40);
            })->copyable()->required(),
            Number::make(__('Stock'), 'stock')->default(0)->required(),
            Number::make(__('Cost'), 'cost')->default(0)->required(),
            ExternalImage::make(__('Image'), 'image_url')
                ->width(100)
                ->height(100)
                ->nullable(),
            HasMany::make(__('Prices'), 'prices', Price::class),
            BelongsTo::make(__('Brand'), 'brand', Brand::class)->nullable()->showCreateRelationButton()->sortable(),
            BelongsTo::make(__('Category'), 'category', Category::class)->nullable()->showCreateRelationButton()->sortable(),
            DateTime::make(__('Created At'), 'created_at')->exceptOnForms(),
        ];
    }

    /**
     * Get the cards available for the request.
     *
     * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
     * @return array
     */
    public function cards(NovaRequest $request)
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
     * @return array
     */
    public function filters(NovaRequest $request)
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
     * @return array
     */
    public function lenses(NovaRequest $request)
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
     * @return array
     */
    public function actions(NovaRequest $request)
    {
        return [
            ImportProducts::make()->standalone(),
            (new DownloadExcel)->withHeadings()->except('id'),
        ];
    }
}
