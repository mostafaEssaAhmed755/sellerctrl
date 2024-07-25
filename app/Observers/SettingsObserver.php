<?php

namespace App\Observers;

use Outl1ne\NovaSettings\Models\Settings;

class SettingsObserver
{
    /**
     * Handle the Settings "created" event.
     */
    public function created(Settings $settings): void
    {
        //
    }

    /**
     * Handle the Settings "updating" event.
     */
    public function updating(Settings $settings): void
    {
        if ($settings->key === 'phone') {
            $settings->value =  preg_replace('/\s+/', '',  $settings->value);
        }
    }

    /**
     * Handle the Settings "deleted" event.
     */
    public function deleted(Settings $settings): void
    {
        //
    }

    /**
     * Handle the Settings "restored" event.
     */
    public function restored(Settings $settings): void
    {
        //
    }

    /**
     * Handle the Settings "force deleted" event.
     */
    public function forceDeleted(Settings $settings): void
    {
        //
    }
}
