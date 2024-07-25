import express from 'express';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import util from 'util';
import NetworkSpeed from 'network-speed';
import axios from 'axios';
import Queue from 'bull';
import Redis from 'ioredis';

const execPromise = util.promisify(exec);
const testNetworkSpeed = new NetworkSpeed();
const app = express();
const port = 4000;

// Use environment variables for Redis connection
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || 6379;

const redis = new Redis({
    host: redisHost,
    port: redisPort,
});

const scrapeQueue = new Queue('scrapeQueue', { redis: { host: redisHost, port: redisPort } });

// Endpoint to check network speed
app.get('/check-network-speed', async (req, res) => {
    try {
        const speedMbps = await checkNetworkSpeed();
        res.json({ speedMbps });
    } catch (error) {
        console.error('Error checking network speed:', error.message);
        console.error(error.stack); // Print the stack trace
        res.status(500).json({ error: 'Failed to check network speed' });
    }
});

// Endpoint to scrape product details and add the job to the queue
app.get('/scrape-product', async (req, res) => {
    try {
        // // Get ASINs from the Laravel backend
        // const response = await axios.get('http://your-laravel-backend-api/endpoint-for-asins');
        // const asins = response.data; // Assuming the ASINs are returned as an array

        // if (!Array.isArray(asins) || asins.length === 0) {
        //     return res.status(400).json({ error: 'No ASINs found' });
        // }

       // Manually defined array of ASINs
       const asins = [
            'B000ZM34MO',
            'B077572GG8',
            'B0949ND2CK',
            'B08GG7VBJ8',
            'B07DNJ3L4D',
            'B08539S62Q',
            'B0CJLX82YH',
            'B07BF47D9D',
            'B0BQ7172D9',
        ];
        
        // Add job to the queue
        const job = await scrapeQueue.add({ asins });

        // Respond quickly with job ID
        res.json({ jobId: job.id });
    } catch (error) {
        console.error('Error adding job to the queue:', error.message);
        console.error(error.stack); // Print the stack trace
        res.status(500).json({ error: 'Failed to add job to the queue' });
    }
});

// Endpoint to get job status and result
app.get('/job-status/:id', async (req, res) => {
    try {
        const job = await scrapeQueue.getJob(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();
        const result = job.returnvalue;

        res.json({ id: job.id, state, result });
    } catch (error) {
        console.error('Error getting job status:', error.message);
        console.error(error.stack); // Print the stack trace
        res.status(500).json({ error: 'Failed to get job status' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Worker to process the scrape queue
scrapeQueue.process(async (job, done) => {
    try {
        const { asins } = job.data;
        const browser = await connectToBrowser();
        const results = [];

        for (const asin of asins) {
            try {
                const productDetails = await scrapeProductDetails(asin, browser);
                results.push(productDetails);
            } catch (error) {
                console.error(`Error processing ASIN ${asin}:`, error.message);
                console.error(error.stack);
                results.push({ asin, error: error.message });
            }
        }

        await browser.close();
        done(null, results);
    } catch (error) {
        console.error('Error in worker process:', error.message);
        console.error(error.stack);
        done(error);
    }
});

// Function to solve CAPTCHA using Python script
async function solveCaptcha(captchaUrl) {
    try {
        const { stdout, stderr } = await execPromise(`python solve_captcha.py "${captchaUrl}"`);
        if (stderr) {
            console.error('Error solving CAPTCHA:', stderr);
            throw new Error(stderr);
        }
        return stdout.trim();
    } catch (error) {
        console.error('Error executing CAPTCHA solver script:', error);
        throw error;
    }
}

// Function to check network speed
async function checkNetworkSpeed() {
    try {
        const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
        const fileSizeInBytes = 500000;
        const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
        return speed.mbps;
    } catch (error) {
        console.error('Error checking network speed:', error);
        return 0;
    }
}

async function scrapeProductDetails(asin, browser) {
    const page = await browser.newPage();
    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let productDetails;

    while (attempt < maxRetries && !success) {
        attempt++;
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            const url = `https://www.amazon.eg/dp/${asin}?language=en_AE`;
            console.log(`Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

            // Check for CAPTCHA
            if (await page.$('#captchacharacters')) {
                const captchaImageElement = await page.$("div.a-row.a-text-center img");
                if (captchaImageElement) {
                    const captchaUrl = await captchaImageElement.evaluate(img => img.src);
                    console.log(`Solving CAPTCHA from URL: ${captchaUrl}`);
                    const captchaSolution = await solveCaptcha(captchaUrl);
                    console.log(`CAPTCHA solution: ${captchaSolution}`);
                    await page.type('#captchacharacters', captchaSolution);
                    await page.click('button[type="submit"]');
                    await page.waitForNavigation({ waitUntil: 'networkidle2' });
                }
            }

            // // Scrape product details
            // productDetails = await page.evaluate(() => {
            //     const title = document.querySelector('#productTitle')?.innerText.trim();
            //     const price = document.querySelector('#priceblock_ourprice, #priceblock_dealprice')?.innerText.trim();
            //     const brand = document.querySelector('#bylineInfo')?.innerText.trim();
            //     const buyBoxWinner = document.querySelector('#merchant-info')?.innerText.trim();
            //     const imageUrl = document.querySelector('#imgTagWrapperId img')?.src;
            //     const category = document.querySelector('span.zg_hrsr_ladder a')?.innerText.trim();
            //     const categoryRank = document.querySelector('span.zg_hrsr_rank')?.innerText.trim();
            //     const subCategoryRank = document.querySelector('span.zg_hrsr_rank+span')?.innerText.trim();

            //     return {
            //         title,
            //         price,
            //         brand,
            //         buyBoxWinner,
            //         imageUrl,
            //         category,
            //         categoryRank,
            //         subCategoryRank,
            //         date: new Date().toISOString()
            //     };
            // });


            productDetails = await page.evaluate(() => {
                const getText = (selector) => document.querySelector(selector) ? document.querySelector(selector).innerText.trim() : 'Not found';
                const getAttribute = (selector, attribute) => document.querySelector(selector) ? document.querySelector(selector).getAttribute(attribute) : 'Not found';
            
                const priceElement = document.querySelector('div.a-section.a-spacing-micro span.a-price span.a-offscreen');
                let price = priceElement ? priceElement.innerText : 'Not found';
                if (price !== 'Not found') {
                    // Remove currency symbol and convert to float
                    price = parseFloat(price.replace(/[^\d.-]/g, ''));
                }
            
                const title = getText('#productTitle');
                const imageUrl = getAttribute('#landingImage', 'src');
                const brandText = getText('#bylineInfo');
                const brand = brandText.includes('Brand:') ? brandText.split('Brand:')[1].trim() : brandText.trim();
            
                const buyBoxWinner = getText('#sellerProfileTriggerId');
            
                const Category = getText('ul.a-unordered-list.a-horizontal.a-size-small li span.a-list-item a.a-link-normal.a-color-tertiary');
            
                const rankElements = document.querySelectorAll('tr');
                let categoryRank = 'Not found';
                let subCategoryRank = 'Not found';
                
                rankElements.forEach((element) => {
                    const th = element.querySelector('th');
                    if (th && th.innerText.includes('Best Sellers Rank')) {
                        const spans = element.querySelectorAll('td span span');
                        if (spans.length > 0) {
                            categoryRank = spans[0] ? spans[0].innerText.split('(')[0].trim() : 'Not found';
                            subCategoryRank = spans[1] ? spans[1].innerText.split('(')[0].trim() : 'Not found';
                        }
                    }
                });
            
                if (categoryRank !== 'Not found') {
                    // Extract just the rank number
                    categoryRank = categoryRank.match(/#\d+(,\d{3})*/)[0];
                }
                
                if (subCategoryRank !== 'Not found') {
                    // Extract just the rank number
                    subCategoryRank = subCategoryRank.match(/#\d+(,\d{3})*/)[0];
                }
                
                return {
                    price,
                    title,
                    imageUrl,
                    brand,
                    buyBoxWinner,
                    Category,
                    categoryRank,
                    subCategoryRank
                };
            });
            
            // Check if we need to click 'See All Buying Options'
            if (productDetails.price === 'Not found' || productDetails.buyBoxWinner === 'Not found') {
                const buyingOptionsButton = await page.$('span#buybox-see-all-buying-choices a.a-button-text');
                if (buyingOptionsButton) {
                    console.log('Clicking "See All Buying Options" to retrieve price and buy box winner.');
                    await buyingOptionsButton.click();
                    await page.waitForSelector('div#aod-offer-price span.a-price span.a-offscreen', { timeout: 60000 });
            
                    productDetails = await page.evaluate(() => {
                        const getText = (selector) => document.querySelector(selector) ? document.querySelector(selector).innerText.trim() : 'Not found';
                        const getAttribute = (selector, attribute) => document.querySelector(selector) ? document.querySelector(selector).getAttribute(attribute) : 'Not found';
            
                        const priceElement = document.querySelector('div#aod-offer-price span.a-price span.a-offscreen');
                        let price = priceElement ? priceElement.innerText : 'Not found';
                        if (price !== 'Not found') {
                            // Remove currency symbol and convert to float
                            price = parseFloat(price.replace(/[^\d.-]/g, ''));
                        }
            
                        const title = getText('#productTitle');
                        const imageUrl = getAttribute('#landingImage', 'src');
                        const brandText = getText('#bylineInfo');
                        const brand = brandText.includes('Brand:') ? brandText.split('Brand:')[1].trim() : brandText.trim();
            
                        const buyBoxWinner = getText('div#aod-offer-soldBy a');
            
                        const Category = getText('ul.a-unordered-list.a-horizontal.a-size-small li span.a-list-item a.a-link-normal.a-color-tertiary');                        
            
                        const rankElements = document.querySelectorAll('tr');
                        let categoryRank = 'Not found';
                        let subCategoryRank = 'Not found';
                        
                        rankElements.forEach((element) => {
                            const th = element.querySelector('th');
                            if (th && th.innerText.includes('Best Sellers Rank')) {
                                const spans = element.querySelectorAll('td span span');
                                if (spans.length > 0) {
                                    categoryRank = spans[0] ? spans[0].innerText.split('(')[0].trim() : 'Not found';
                                    subCategoryRank = spans[1] ? spans[1].innerText.split('(')[0].trim() : 'Not found';
                                }
                            }
                        });
            
                        if (categoryRank !== 'Not found') {
                            // Extract just the rank number
                            categoryRank = categoryRank.match(/#\d+(,\d{3})*/)[0];
                        }
                        
                        if (subCategoryRank !== 'Not found') {
                            // Extract just the rank number
                            subCategoryRank = subCategoryRank.match(/#\d+(,\d{3})*/)[0];
                        }

                        return {
                            price,
                            title,
                            imageUrl,
                            brand,
                            buyBoxWinner,
                            Category,
                            categoryRank,
                            subCategoryRank
                        };
                    });
                }
            }

            success = true;
        } catch (error) {
            console.error(`Error scraping ASIN ${asin}, attempt ${attempt} of ${maxRetries}:`, error.message);
            console.error(error.stack);
        }
    }

    if (!success) {
        productDetails = {
            asin,
            price: 'Error',
            title: 'Error',
            brand: 'Error',
            buyBoxWinner: 'Error',
            imageUrl: 'Error',
            category: 'Error',
            categoryRank: 'Error',
            subCategoryRank: 'Error',
            date: new Date().toISOString()
        };
    }

    await page.close();
    return productDetails;
}

async function connectToBrowser() {
    const maxRetries = 5;
    let attempt = 0;
    let browser = null;
    while (attempt < maxRetries && !browser) {
        attempt++;
        try {
            browser = await puppeteer.connect({ browserWSEndpoint: 'ws://chrome:3000', timeout: 120000 });
            console.log('Successfully connected to Puppeteer browser');
        } catch (error) {
            console.error(`Error connecting to browser, attempt ${attempt} of ${maxRetries}:`, error.message);
            console.error(error.stack);
            if (attempt >= maxRetries) {
                throw new Error('Failed to connect to browser after multiple attempts');
            }
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }
    }
    return browser;
}
