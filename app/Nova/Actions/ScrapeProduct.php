<?php

namespace App\Nova\Actions;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Http\Requests\NovaRequest;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class ScrapeProduct extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * Perform the action on the given models.
     *
     * @param  \Laravel\Nova\Fields\ActionFields  $fields
     * @param  \Illuminate\Support\Collection  $models
     * @return mixed
     */
    public function handle(ActionFields $fields, Collection $models)
    {
        $client = new Client();
        $data = ['asins' => Product::pluck('asin')->toArray()];  // Ensure the data matches the expected structure
        // foreach ($models as $model) {
        //     // Add model data to the array
        //     $data[] = $model->pluck('asin')->toArray();
        // }

        try {
            $response = $client->post('http://localhost:4000/scrape', [
                'json' => $data,
            ]);

            Log::info($data);

            if ($response->getStatusCode() == 200) {
                return Action::message('Data processed successfully.');
            } else {
                return Action::danger('Failed to process data.');
            }
        } catch (RequestException $e) {
            return Action::danger('Error: ' . $e->getMessage());
        }
    }

    /**
     * Get the fields available on the action.
     *
     * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
     * @return array
     */
    public function fields(NovaRequest $request)
    {
        return [];
    }
}
