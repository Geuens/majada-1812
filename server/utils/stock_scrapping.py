import requests
from bs4 import BeautifulSoup
import pandas as pd
import os
import json
import yfinance as yf  # Import the yfinance library

# URL for the S&P 500 Constituents page on SlickCharts
url = "https://www.slickcharts.com/sp500"

# Define headers to simulate a real browser request
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Send a GET request to fetch the webpage content with the headers
response = requests.get(url, headers=headers)

# Check if the page was fetched successfully
if response.status_code == 200:
    print("Page loaded successfully.")
else:
    print(f"Failed to load page. Status code: {response.status_code}")

# Parse the webpage using BeautifulSoup
soup = BeautifulSoup(response.text, 'html.parser')

# Check if the table is found
table = soup.find('table', {'class': 'table-hover'})  # Modify this if necessary

# Ensure the table is found
if table:
    print("Table found, proceeding to scrape tickers...")

    tickers = []
    companies = []
    symbols = []
    last_prices = []

    # Loop through each row in the table (skip the header row)
    for row in table.find_all('tr')[1:]:  # Skip the header row
        cells = row.find_all('td')
        if len(cells) > 0:
            ticker = cells[0].get_text(strip=True)
            company = cells[1].get_text(strip=True)
            symbol = cells[2].get_text(strip=True)  # Ticker is usually the symbol itself
            tickers.append(ticker)
            companies.append(company)
            symbols.append(symbol)

            # Fetch the last price using yfinance
            try:
                stock = yf.Ticker(symbol)
                last_price = stock.history(period="1d")['Close'].iloc[-1]  # Get the most recent closing price
                last_prices.append(last_price)
            except Exception as e:
                print(f"Error fetching last price for {symbol}: {e}")
                last_prices.append(None)

    # Create a DataFrame from the scraped data
    sp500_df = pd.DataFrame({
        'Ticker': tickers,
        'Company': companies,
        'Symbol': symbols,
        'LastPrice': last_prices  # Add LastPrice column
    })

    # Filter out rows with NaN or None values in the LastPrice column
    sp500_df = sp500_df.dropna(subset=['LastPrice'])

    # Save the data to a JSON file
    save_dir = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'public',
                            'data', 'stocks', 'index_tickers')
    os.makedirs(save_dir, exist_ok=True)  # Ensure the directory exists

    file_path = os.path.join(save_dir, 'tickers_gspc.json')

    # Save as JSON
    sp500_data = sp500_df.to_dict(orient='records')  # Convert to a list of dictionaries
    with open(file_path, 'w') as json_file:
        json.dump(sp500_data, json_file, indent=4)

    print(f"Data saved to {file_path}")

else:
    print("No table found. Please check the webpage structure.")







