import puppeteer from 'puppeteer';

// Function to solve CAPTCHA (dummy function, replace with actual CAPTCHA solving if needed)
async function solveCaptcha(page) {
    console.log('Solving CAPTCHA...');
    // Add your CAPTCHA solving code here
}

async function scrapeProductDetails(asin, browser) {
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        const url = `https://www.amazon.eg/dp/${asin}?language=en_AE`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Check for CAPTCHA
        if (await page.$('#captchacharacters')) {
            await solveCaptcha(page);
        }

        const productDetails = await page.evaluate(() => {
            const priceElement = document.querySelector('span.a-price');
            const priceWhole = priceElement ? priceElement.querySelector('span.a-price-whole').innerText : 'N/A';
            const priceFraction = priceElement ? priceElement.querySelector('span.a-price-fraction').innerText : 'N/A';
            const price = priceElement ? `${priceWhole}.${priceFraction}` : 'N/A';
            const title = document.querySelector('#productTitle') ? document.querySelector('#productTitle').innerText.trim() : 'N/A';
            const seller = document.querySelector('#sellerProfileTriggerId') ? document.querySelector('#sellerProfileTriggerId').innerText.trim() : 'N/A';
            const imageUrl = document.querySelector('#imgTagWrapperId img') ? document.querySelector('#imgTagWrapperId img').src : 'N/A';

            return {
                price,
                title,
                seller,
                imageUrl
            };
        });

        if (productDetails.price === 'N/A') {
            // Try clicking 'See All Buying Options' if price not found
            const buyingOptionsButton = await page.$('#buybox-see-all-buying-choices .a-button-text');
            if (buyingOptionsButton) {
                await buyingOptionsButton.click();
                await page.waitForSelector('div#buybox');

                productDetails = await page.evaluate(() => {
                    const priceElement = document.querySelector('span.a-price');
                    const priceWhole = priceElement ? priceElement.querySelector('span.a-price-whole').innerText : 'N/A';
                    const priceFraction = priceElement ? priceElement.querySelector('span.a-price-fraction').innerText : 'N/A';
                    const price = priceElement ? `${priceWhole}.${priceFraction}` : 'N/A';
                    const title = document.querySelector('#productTitle') ? document.querySelector('#productTitle').innerText.trim() : 'N/A';
                    const seller = document.querySelector('#aod-offer-soldBy .a-link-normal') ? document.querySelector('#aod-offer-soldBy .a-link-normal').innerText.trim() : 'N/A';
                    const imageUrl = document.querySelector('#imgTagWrapperId img') ? document.querySelector('#imgTagWrapperId img').src : 'N/A';

                    return {
                        price,
                        title,
                        seller,
                        imageUrl
                    };
                });
            }
        }


        return {
            asin,
            price: productDetails.price,
            title: productDetails.title,
            seller: productDetails.seller,
            imageUrl: productDetails.imageUrl,
            date: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error scraping ASIN ${asin}:`, error);
        return { asin, price: 'Error', title: 'Error', seller: 'Error', imageUrl: 'Error', date: new Date().toISOString() };
    } finally {
        await page.close();
    }
}

(async () => {
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

    const browser = await puppeteer.connect({
        browserWSEndpoint: 'ws://chrome:3000',
    });

    for (const asin of asins) {
        const productDetails = await scrapeProductDetails(asin, browser);
        console.log(productDetails);
    }
    await browser.disconnect();
})();
