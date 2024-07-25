import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import util from 'util';
import NetworkSpeed from 'network-speed';

const execPromise = util.promisify(exec);
const testNetworkSpeed = new NetworkSpeed();

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
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });  // Increased timeout to 60 seconds

            // Check for CAPTCHA
            if (await page.$('#captchacharacters')) {
                const captchaImageElement = await page.$("div.a-row.a-text-center img");
                const captchaUrl = await (await captchaImageElement.getProperty('src')).jsonValue();

                // Solve CAPTCHA
                console.log('Solving CAPTCHA...');
                const captchaSolution = await solveCaptcha(captchaUrl);
                await page.type('#captchacharacters', captchaSolution);
                await page.click('.a-button-text');
                await page.waitForNavigation({ waitUntil: 'networkidle2' });

                console.log("CAPTCHA solved successfully.");
            }

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
            
            success = true;  // Set success flag to true if no errors
        } catch (error) {
            console.error(`Error scraping ASIN ${asin}, attempt ${attempt} of ${maxRetries}:`, error);
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
            Category: 'Error',
            categoryRank: 'Error',
            subCategoryRank: 'Error',
            date: new Date().toISOString()
        };
    }

    await page.close();
    return productDetails;
}

(async () => {
    try {
        // // Check network speed
        // const speedMbps = await checkNetworkSpeed();
        // console.log(`Network speed: ${speedMbps} Mbps`);

        // if (speedMbps < 5) {  // Define a threshold for network speed
        //     console.error('Network speed is too slow. Please try again later.');
        //     process.exit(1);
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

        const browser = await puppeteer.connect({ browserWSEndpoint: 'ws://chrome:3000', timeout: 120000 });

        for (const asin of asins) {
            try {
                const productDetails = await scrapeProductDetails(asin, browser);
                console.log(productDetails);
            } catch (error) {
                console.error(`Error processing ASIN ${asin}:`, error);
            }
        }

        await browser.close();
    } catch (error) {
        console.error('Error in main function:', error);
    }
})();
