# import requests
# from bs4 import BeautifulSoup
# import pandas as pd
# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service as ChromeService
# from webdriver_manager.chrome import ChromeDriverManager
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.common.exceptions import NoSuchElementException, TimeoutException
# from datetime import datetime
# import asyncio
# from amazoncaptcha import AmazonCaptcha
# import time
# import random
# from tqdm import tqdm
# from colorama import Fore, Style
# import os

# user_agents = [
#     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
#     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15',
#     'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
#     'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0',
#     'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
#     'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/73.0',
#     'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
#     'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0',
#     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
#     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9; rv:45.0) Gecko/20100101 Firefox/45.0',
#     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
#     'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
#     'Opera/9.60 (Windows NT 6.0; U; en) Presto/2.1.1',
#     'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534+ (KHTML, like Gecko) BingPreview/1.0b',
#     'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
#     'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',
#     'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
#     'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)',
#     'Mozilla/40.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)',
#     'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
#     'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
#     'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
#     'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
#     'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'
# ]

# options = Options()
# options.add_argument('--headless')
# options.add_argument('--no-sandbox')
# options.add_argument('--disable-dev-shm-usage')
# options.add_argument('--disable-gpu')
# options.add_argument('--disable-software-rasterizer')
# options.add_argument('--disable-extensions')
# user_agent = random.choice(user_agents)
# options.add_argument(f'user-agent={user_agent}')

# def solve_captcha(driver):
#     try:
#         WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.XPATH, "//div[@class='a-row a-text-center']//img"))
#         )
#         image_element = driver.find_element(By.XPATH, "//div[@class='a-row a-text-center']//img")
#         captcha_url = image_element.get_attribute('src')
#         captcha_solver = AmazonCaptcha.fromlink(captcha_url)
#         captcha_solution = captcha_solver.solve()
#         input_field = driver.find_element(By.ID, "captchacharacters")
#         input_field.send_keys(captcha_solution)
#         submit_button = driver.find_element(By.CLASS_NAME, "a-button-text")
#         submit_button.click()
#         WebDriverWait(driver, 10).until_not(
#             EC.presence_of_element_located((By.ID, "captchacharacters"))
#         )
#         print("CAPTCHA solved successfully.")
#     except NoSuchElementException as e:
#         print(f"Element not found in CAPTCHA page: {e}")
#     except TimeoutException as e:
#         print(f"Timeout while solving CAPTCHA: {e}")
#     except Exception as e:
#         print(f"An error occurred while solving CAPTCHA: {e}")

# def get_product_price_and_seller(asin, retries=3):
#     driver = None
#     for _ in range(retries):
#         try:
#             # driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
#             chrome_service = ChromeService(executable_path='/usr/local/bin/chrome-headless-shell-linux64/chrome-headless-shell')
#             driver = webdriver.Chrome(service=chrome_service, options=options)

#             url = f"https://www.amazon.eg/dp/{asin}?language=en_AE"
#             driver.get(url)
#             time.sleep(random.randint(5, 20))

#             # Check for CAPTCHA and solve if present
#             if "ap_captcha" in driver.page_source or "Enter the characters you see below" in driver.page_source:
#                 print("CAPTCHA detected. Attempting to solve.")
#                 solve_captcha(driver)

#             # Continue with the scraping process after CAPTCHA is solved or not present
            
#             full_price = 'CAPTCHA'
#             buy_box_winner = 'CAPTCHA'
#             product_title = 'CAPTCHA'
#             product_image_url = 'CAPTCHA'

#             try:
#                 price_container = driver.find_element(By.CSS_SELECTOR, 'span.a-price')
#                 price_whole = price_container.find_element(By.CSS_SELECTOR, 'span.a-price-whole').text
#                 price_fraction = price_container.find_element(By.CSS_SELECTOR, 'span.a-price-fraction').text
#                 full_price = f"{price_whole}.{price_fraction}"
#                 product_title = driver.find_element(By.ID, 'productTitle').text
#                 product_image_url = driver.find_element(By.ID, 'imgTagWrapperId').find_element(By.TAG_NAME, 'img').get_attribute('src')
#                 buy_box_winner = driver.find_element(By.ID, 'sellerProfileTriggerId').text

#             except NoSuchElementException:
#                 print("Price or buy box winner not found on main page. Trying 'See All Buying Options' for more details.")
#                 try:
#                     buying_options_link = driver.find_element(By.CSS_SELECTOR, '#buybox-see-all-buying-choices .a-button-text')
#                     buying_options_link.click()
#                     WebDriverWait(driver, 30).until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'div#buybox')))
#                     time.sleep(20)

#                     try:
#                         price_container = driver.find_element(By.CSS_SELECTOR, 'span.a-price')
#                         price_whole = price_container.find_element(By.CSS_SELECTOR, 'span.a-price-whole').text
#                         price_fraction = price_container.find_element(By.CSS_SELECTOR, 'span.a-price-fraction').text
#                         full_price = f"{price_whole}.{price_fraction}"
#                     except NoSuchElementException:
#                         print("Price still not found after clicking 'See All Buying Options'.")

#                     try:
#                         buy_box_winner = driver.find_element(By.CSS_SELECTOR, '#aod-offer-soldBy .a-link-normal').text
#                     except NoSuchElementException:
#                         print("Buy box winner still not found after clicking 'See All Buying Options'.")

#                 except (NoSuchElementException, TimeoutException):
#                     print("Failed to click on 'See All Buying Options' or timed out.")

#             finally:
#                 if driver:
#                     driver.quit()

#             return full_price, buy_box_winner, product_title, product_image_url
#         except Exception as e:
#             print(f"Error processing ASIN {asin}: {str(e)}")
#             time.sleep(random.randint(10, 30))
#         finally:
#             if driver:
#                 driver.quit()
#     return 'Error', 'Error', 'Error', 'Error'

# async def main():
#     input_excel = "scripts/Ourprice.xlsx"  # Make sure the file is in the 'scripts' directory
#     df = pd.read_excel(input_excel)
#     asins = df['ASIN'].tolist()

#     scraped_data = []

#     with tqdm(total=len(asins), desc=f"{Fore.GREEN}Total Progress", colour="green") as pbar_total:
#         for index, asin in enumerate(asins):
#             full_price, buy_box_winner, product_title, product_image_url = get_product_price_and_seller(asin)
#             Buybox_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#             product_url = f"https://www.amazon.eg/dp/{asin}?language=en_AE"

#             if full_price != "Not found" and full_price != "Error":
#                 try:
#                     Buybox_price = float(full_price.replace(',', ''))
#                     if buy_box_winner != "GLOBED" and buy_box_winner != "bareeq.home":
#                         print(f"Done for ASIN {asin} as the buy box winner is '{buy_box_winner}'.")

#                     else:
#                         print(f"Skipping message for ASIN {asin} as the buy box winner is '{buy_box_winner}'.")
#                 except ValueError:
#                     print(f"Error converting price for ASIN {asin}: {full_price}")

#             scraped_data.append({
#                 'ASIN': asin,
#                 'Price': full_price,
#                 'Seller': buy_box_winner,
#                 'Date': Buybox_time,
#                 'Product Title': product_title,
#                 'Product Image URL': product_image_url
#             })

#             pbar_total.update(1)

#     output_folder = "scripts/ScrapedData"
#     if not os.path.exists(output_folder):
#         os.makedirs(output_folder)

#     output_filename = f"{output_folder}/scraped_data.xlsx"
#     df_data = pd.DataFrame(scraped_data)
#     df_data.to_excel(output_filename, index=False)
#     print(f"Scraped data saved to {output_filename}")


# if __name__ == '__main__':
#     asyncio.run(main())


# import requests
# from bs4 import BeautifulSoup
# import pandas as pd
# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service as ChromeService
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.common.exceptions import NoSuchElementException, TimeoutException
# from datetime import datetime
# import asyncio
# from amazoncaptcha import AmazonCaptcha
# import time
# import random
# from tqdm import tqdm
# from colorama import Fore, Style
# import os

# user_agents = [
#     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
#     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15',
#     'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
#     'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0',
#     'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
#     'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/73.0',
#     'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
#     'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0',
#     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
#     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9; rv:45.0) Gecko/20100101 Firefox/45.0',
#     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
#     'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
#     'Opera/9.60 (Windows NT 6.0; U; en) Presto/2.1.1',
#     'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534+ (KHTML, like Gecko) BingPreview/1.0b',
#     'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
#     'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',
#     'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
#     'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)',
#     'Mozilla/40.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)',
#     'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
#     'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
#     'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
#     'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
#     'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'
# ]

# options = Options()
# options.add_argument('--headless')
# options.add_argument('--no-sandbox')
# options.add_argument('--disable-dev-shm-usage')
# options.add_argument('--disable-gpu')
# options.add_argument('--disable-software-rasterizer')
# options.add_argument('--disable-extensions')
# user_agent = random.choice(user_agents)
# options.add_argument(f'user-agent={user_agent}')

# def solve_captcha(driver):
#     try:
#         WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.XPATH, "//div[@class='a-row a-text-center']//img"))
#         )
#         image_element = driver.find_element(By.XPATH, "//div[@class='a-row a-text-center']//img")
#         captcha_url = image_element.get_attribute('src')
#         captcha_solver = AmazonCaptcha.fromlink(captcha_url)
#         captcha_solution = captcha_solver.solve()
#         input_field = driver.find_element(By.ID, "captchacharacters")
#         input_field.send_keys(captcha_solution)
#         submit_button = driver.find_element(By.CLASS_NAME, "a-button-text")
#         submit_button.click()
#         WebDriverWait(driver, 10).until_not(
#             EC.presence_of_element_located((By.ID, "captchacharacters"))
#         )
#         print("CAPTCHA solved successfully.")
#     except NoSuchElementException as e:
#         print(f"Element not found in CAPTCHA page: {e}")
#     except TimeoutException as e:
#         print(f"Timeout while solving CAPTCHA: {e}")
#     except Exception as e:
#         print(f"An error occurred while solving CAPTCHA: {e}")

# def get_product_price_and_seller(asin, retries=3):
#     driver = None
#     for _ in range(retries):
#         try:
#             driver = webdriver.Remote(
#                 command_executor='http://selenium:4444/wd/hub',
#                 options=options
#             )

#             url = f"https://www.amazon.eg/dp/{asin}?language=en_AE"
#             driver.get(url)
#             time.sleep(random.randint(5, 20))

#             # Check for CAPTCHA and solve if present
#             if "ap_captcha" in driver.page_source or "Enter the characters you see below" in driver.page_source:
#                 print("CAPTCHA detected. Attempting to solve.")
#                 solve_captcha(driver)

#             # Continue with the scraping process after CAPTCHA is solved or not present
            
#             full_price = 'CAPTCHA'
#             buy_box_winner = 'CAPTCHA'
#             product_title = 'CAPTCHA'
#             product_image_url = 'CAPTCHA'

#             try:
#                 price_container = driver.find_element(By.CSS_SELECTOR, 'span.a-price')
#                 price_whole = price_container.find_element(By.CSS_SELECTOR, 'span.a-price-whole').text
#                 price_fraction = price_container.find_element(By.CSS_SELECTOR, 'span.a-price-fraction').text
#                 full_price = f"{price_whole}.{price_fraction}"
#                 product_title = driver.find_element(By.ID, 'productTitle').text
#                 product_image_url = driver.find_element(By.ID, 'imgTagWrapperId').find_element(By.TAG_NAME, 'img').get_attribute('src')
#                 buy_box_winner = driver.find_element(By.ID, 'sellerProfileTriggerId').text

#             except NoSuchElementException:
#                 print("Price or buy box winner not found on main page. Trying 'See All Buying Options' for more details.")
#                 try:
#                     buying_options_link = driver.find_element(By.CSS_SELECTOR, '#buybox-see-all-buying-choices .a-button-text')
#                     buying_options_link.click()
#                     WebDriverWait(driver, 30).until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'div#buybox')))
#                     time.sleep(20)

#                     try:
#                         price_container = driver.find_element(By.CSS_SELECTOR, 'span.a-price')
#                         price_whole = price_container.find_element(By.CSS_SELECTOR, 'span.a-price-whole').text
#                         price_fraction = price_container.find_element(By.CSS_SELECTOR, 'span.a-price-fraction').text
#                         full_price = f"{price_whole}.{price_fraction}"
#                     except NoSuchElementException:
#                         print("Price still not found after clicking 'See All Buying Options'.")

#                     try:
#                         buy_box_winner = driver.find_element(By.CSS_SELECTOR, '#aod-offer-soldBy .a-link-normal').text
#                     except NoSuchElementException:
#                         print("Buy box winner still not found after clicking 'See All Buying Options'.")

#                 except (NoSuchElementException, TimeoutException):
#                     print("Failed to click on 'See All Buying Options' or timed out.")

#             finally:
#                 if driver:
#                     driver.quit()

#             return full_price, buy_box_winner, product_title, product_image_url
#         except Exception as e:
#             print(f"Error processing ASIN {asin}: {str(e)}")
#             time.sleep(random.randint(10, 30))
#         finally:
#             if driver:
#                 driver.quit()
#     return 'Error', 'Error', 'Error', 'Error'

# async def main():
#     input_excel = "scripts/Ourprice.xlsx"  # Make sure the file is in the 'scripts' directory
#     df = pd.read_excel(input_excel)
#     asins = df['ASIN'].tolist()

#     scraped_data = []

#     with tqdm(total=len(asins), desc=f"{Fore.GREEN}Total Progress", colour="green") as pbar_total:
#         for index, asin in enumerate(asins):
#             full_price, buy_box_winner, product_title, product_image_url = get_product_price_and_seller(asin)
#             Buybox_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#             product_url = f"https://www.amazon.eg/dp/{asin}?language=en_AE"

#             if full_price != "Not found" and full_price != "Error":
#                 try:
#                     Buybox_price = float(full_price.replace(',', ''))
#                     if buy_box_winner != "GLOBED" and buy_box_winner != "bareeq.home":
#                         print(f"Done for ASIN {asin} as the buy box winner is '{buy_box_winner}'.")

#                     else:
#                         print(f"Skipping message for ASIN {asin} as the buy box winner is '{buy_box_winner}'.")
#                 except ValueError:
#                     print(f"Error converting price for ASIN {asin}: {full_price}")

#             scraped_data.append({
#                 'ASIN': asin,
#                 'Price': full_price,
#                 'Seller': buy_box_winner,
#                 'Date': Buybox_time,
#                 'Product Title': product_title,
#                 'Product Image URL': product_image_url
#             })

#             pbar_total.update(1)

#     output_folder = "scripts/ScrapedData"
#     if not os.path.exists(output_folder):
#         os.makedirs(output_folder)

#     output_filename = f"{output_folder}/scraped_data.xlsx"
#     df_data = pd.DataFrame(scraped_data)
#     df_data.to_excel(output_filename, index=False)
#     print(f"Scraped data saved to {output_filename}")


# if __name__ == '__main__':
#     asyncio.run(main())
