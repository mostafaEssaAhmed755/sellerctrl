<?php

namespace App\Nova\Tools;

use Laravel\Nova\Fields\Email;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Devloops\PhoneNumber\PhoneNumber;


class Settings
{
    public static function setup()
    {

        \Outl1ne\NovaSettings\NovaSettings::addSettingsFields([
            Text::make(__('Company name'), 'company_name'),
            PhoneNumber::make(__('Phone'), 'phone')->withInputOptionsShowDialCode(true),
            Email::make(__('Email'), 'email'),
        ], [], 'Account');

        \Outl1ne\NovaSettings\NovaSettings::addSettingsFields([
            Text::make(__('Company name'), 'company_name'),
        ], [], 'Sellers');
    }
}
