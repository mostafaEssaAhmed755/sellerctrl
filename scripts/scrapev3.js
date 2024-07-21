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

        const scrapeDetails = async () => {
            const productDetails = await page.evaluate(() => {
                const getText = (selector) => document.querySelector(selector) ? document.querySelector(selector).innerText.trim() : 'Not found';
                const getAttribute = (selector, attribute) => document.querySelector(selector) ? document.querySelector(selector).getAttribute(attribute) : 'Not found';

                const priceElement = document.querySelector('span.a-price span.a-offscreen');
                const price = priceElement ? priceElement.innerText : 'Not found';

                const title = getText('#productTitle');
                const imageUrl = getAttribute('#landingImage', 'src');
                const brand = getText('#bylineInfo');

                const buyBoxWinner = getText('#sellerProfileTriggerId');

                const categoryElements = document.querySelectorAll('ul.a-unordered-list.a-horizontal.a-size-small li');
                const category = categoryElements.length ? Array.from(categoryElements).map(el => el.innerText.trim()).join(' > ') : 'Not found';

                const rankElement = document.querySelector('#SalesRank');
                const categoryRank = rankElement ? rankElement.innerText.split('#')[1].split(' in ')[0].trim() : 'Not found';

                return {
                    price,
                    title,
                    imageUrl,
                    brand,
                    buyBoxWinner,
                    category,
                    categoryRank
                };
            });
            return productDetails;
        };

        let productDetails = await scrapeDetails();

        console.log('---------------------')
        console.log(productDetails)

        if (productDetails.price === 'Not found' || productDetails.buyBoxWinner === 'Not found') {
            // Try clicking 'See All Buying Options' if price or buyBoxWinner not found
            const buyingOptionsButton = await page.$('#buybox-see-all-buying-choices .a-button-text');
            if (buyingOptionsButton) {
                await buyingOptionsButton.click();
                await page.waitForSelector('div#all-offers-display');

                productDetails = await page.evaluate(() => {
                    const getText = (selector) => document.querySelector(selector) ? document.querySelector(selector).innerText.trim() : 'Not found';
                    const getAttribute = (selector, attribute) => document.querySelector(selector) ? document.querySelector(selector).getAttribute(attribute) : 'Not found';

                    const priceElement = document.querySelector('span.a-price span.a-offscreen');
                    const price = priceElement ? priceElement.innerText : 'Not found';

                    const title = getText('#productTitle');
                    const imageUrl = getAttribute('#landingImage', 'src');
                    const brand = getText('#bylineInfo');

                    const buyBoxWinner = getText('#aod-offer-soldBy .a-link-normal') !== 'Not found' ? getText('#aod-offer-soldBy .a-link-normal') : getText('#aod-offer-list #aod-price-1 .a-offscreen');

                    const categoryElements = document.querySelectorAll('ul.a-unordered-list.a-horizontal.a-size-small li');
                    const category = categoryElements.length ? Array.from(categoryElements).map(el => el.innerText.trim()).join(' > ') : 'Not found';

                    const rankElement = document.querySelector('#SalesRank');
                    const categoryRank = rankElement ? rankElement.innerText.split('#')[1].split(' in ')[0].trim() : 'Not found';

                    return {
                        price,
                        title,
                        imageUrl,
                        brand,
                        buyBoxWinner,
                        category,
                        categoryRank
                    };
                });
            }
        }

        return {
            asin,
            price: productDetails.price,
            title: productDetails.title,
            brand: productDetails.brand,
            buyBoxWinner: productDetails.buyBoxWinner,
            imageUrl: productDetails.imageUrl,
            category: productDetails.category,
            categoryRank: productDetails.categoryRank,
            date: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error scraping ASIN ${asin}:`, error);
        return { asin, price: 'Error', title: 'Error', brand: 'Error', buyBoxWinner: 'Error', imageUrl: 'Error', category: 'Error', categoryRank: 'Error', date: new Date().toISOString() };
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
        // 'B08GG7VBJ8',
        // 'B07DNJ3L4D',
        // 'B08539S62Q',
        // 'B0CJLX82YH',
        // 'B07BF47D9D',
        // 'B0BQ7172D9',
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
