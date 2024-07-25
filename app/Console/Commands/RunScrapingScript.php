<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class RunScrapingScript extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scrape:run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run the scraping script';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Run the Python script within the Laravel container
        $process = new Process(['python3', '/var/www/html/scripts/sellerctrl.py']);
        $process->run(function ($type, $buffer) {
            echo $buffer;
        });

        if (!$process->isSuccessful()) {
            $this->error('Scraping script failed!');
            return 1;
        }

        $this->info('Scraping script ran successfully!');
        return 0;
    }
}
