import os
import yfinance as yf
import json


# Function to fetch data for any index based on the given period and interval
def fetch_index_data(index_symbol, period='5y', interval='1d'):
    """
    Fetch historical data for the specified index using Yahoo Finance.

    :param index_symbol: The ticker symbol of the index (e.g., '^GSPC' for S&P 500, '^IBEX' for IBEX 35)
    :param period: The period for the data (e.g., '1d', '5d', '1mo', '1y', etc.)
    :param interval: The interval for the data (e.g., '1m', '5m', '1d', '1wk', '1mo', etc.)
    :return: DataFrame containing the index data
    """
    try:
        data = yf.download(index_symbol, period=period, interval=interval)
        if data.empty:
            print(f"No data found for {index_symbol} with period {period}.")
            return None
        return data
    except Exception as e:
        print(f"Error fetching data for {index_symbol}: {e}")
        return None


# Function to save data to a JSON file in the specified directory
def save_data_to_json(data, filename, save_dir=None):
    """
    Save the fetched index data to a JSON file in the specified directory.

    :param data: The data to be saved (DataFrame)
    :param filename: The name of the file to save the data
    :param save_dir: The directory where the data should be saved (default is relative to the project)
    """
    if save_dir is None:
        save_dir = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'public', 'data',
                                'stocks')

    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, filename)

    if data is not None:
        try:
            data.reset_index().to_json(file_path, orient='records', lines=False)
            print(f"Data saved to {file_path}")
        except Exception as e:
            print(f"Error saving data to {file_path}: {e}")
    else:
        print(f"No data to save for {filename}")


# Function to fetch and save data for all indices with error handling
def save_all_data():
    indices = ['^GSPC', '^DAX', '^FCHI', '^FTSE', '^IBEX', '^FTSEMIB', '^N225', '^KS11', '^TSX', '^AXJO', '^NZ50', 'VT']
    periods = ['5y', '3y', '1y']  # Define different periods to try (5 years, 3 years, 1 year)

    for index in indices:
        print(f"Fetching data for {index}...")
        data = None
        # Try different periods in case the 5-year data is not available
        for period in periods:
            data = fetch_index_data(index, period=period)
            if data is not None:
                break  # If data is successfully fetched, exit the loop

        if data is not None:
            filename = f"{index.replace('^', '').lower()}.json"
            save_data_to_json(data, filename)
        else:
            print(f"Skipping {index}: No data found for the available periods.")

# Function to get the list of stock symbols from the index tickers JSON files
def get_stocks_list(indexes, index_tickers_dir=None):
    """
    Given a list of index names, fetch the stock symbols from the corresponding JSON files.

    :param indexes: List of index names (e.g., ['gspc', 'dax', 'fchi'])
    :param index_tickers_dir: Directory where index tickers JSON files are stored
    :return: A list of stock symbols
    """
    if index_tickers_dir is None:
        # Construct the absolute path based on the current script's directory
        index_tickers_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'data', 'stocks', 'index_tickers')

    stocks = []
    for index in indexes:
        # Adjust the file name based on the provided directory and file naming convention
        index_file = os.path.join(index_tickers_dir, f"tickers_{index.replace('^', '').lower()}.json")
        print(index_file)

        if os.path.exists(index_file):
            with open(index_file, 'r') as file:
                tickers_data = json.load(file)

            # Extract the symbols for each stock in the index
            for ticker_info in tickers_data:
                stocks.append(ticker_info["Symbol"])
        else:
            print(f"Index file for {index} not found.")

    return stocks



# Function to fetch and save stock data
def save_stock_data(stock_symbols, save_dir=None, period='5y', interval='1d'):
    """
    Fetches stock data for a list of stock symbols and saves each stock's data in a separate file.

    :param stock_symbols: List of stock symbols (e.g., ['AAPL', 'NVDA'])
    :param save_dir: Directory to save the individual stock data
    :param period: The period of data (default is '5y')
    :param interval: The interval of data (default is '1d')
    """
    if save_dir is None:
        # Construct the absolute path based on the current script's directory
        save_dir = os.path.join(os.path.dirname(__file__), '..', '..','..', '..', 'public', 'data', 'stocks', 'individual_stocks')


    os.makedirs(save_dir, exist_ok=True)

    for symbol in stock_symbols:
        print(f"Fetching data for {symbol}...")
        try:
            stock_data = yf.download(symbol, period=period, interval=interval)
            if not stock_data.empty:
                # Save the stock data as a JSON file
                file_path = os.path.join(save_dir, f"{symbol}.json")
                stock_data.reset_index().to_json(file_path, orient='records', lines=False)
                print(f"Data for {symbol} saved to {file_path}")
            else:
                print(f"No data found for {symbol}")
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")


# Main function to run the process and print data info
if __name__ == '__main__':
    # Save all data using the save_all_data function
    save_all_data()

    # After saving data, now print the info dump for all saved files
    indices = ['^GSPC', '^DAX', '^FCHI', '^FTSE', '^IBEX', '^FTSEMIB', '^N225', '^KS11', '^TSX', '^AXJO', '^NZ50', 'VT']
    for index in indices:
        filename = f"{index.replace('^', '').lower()}_data.json"
        file_path = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'public', 'data',
                                 'stocks', filename)
        if os.path.exists(file_path):
            # Load the saved JSON file
            with open(file_path, 'r') as file:
                data = json.load(file)

            # Info Dump: concise summary of the data
            print(f"\n{index} Data Summary:")
            print(f"Rows: {len(data)}, Columns: {len(data[0])}")
            print(f"Sample data: {data[:3]}")  # Show first 3 rows
        else:
            print(f"No data found for {index}.")

    # 1. Get the list of stock symbols for these indexes
    stock_symbols = get_stocks_list(indices)
    print(f"Retrieved {len(stock_symbols)} stock symbols.")

    # 2. Fetch and save data for each stock symbol
    save_stock_data(stock_symbols)


