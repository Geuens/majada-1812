from flask import Flask, request, jsonify
import yfinance as yf
import pandas as pd
import logging
from datetime import datetime, timedelta

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@app.route('/calculate-historical', methods=['POST'])
def calculate_historical_data():
    """
    Flask route to calculate historical portfolio data.
    """
    logger.info("Received request for /calculate-historical")
    try:
        # Extract JSON data from request
        data = request.json
        logger.debug(f"Request data: {data}")

        assets = data['assets']
        is_percentage = data['isPercentage']
        total_value = data['totalValue']
        updated_date = data['updatedDate']

        # Use start_date from the request or default to five years ago
        start_date = data.get('startDate')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=5 * 365)).strftime('%Y-%m-%d')
            logger.info(f"'startDate' not provided, defaulting to five years ago: {start_date}")

        logger.info("Starting calculations for portfolio historical performance")
        # Call the core calculation logic
        performance_history = perform_calculations(assets, is_percentage, total_value, updated_date, start_date)
        logger.info("Calculations completed successfully")

        return jsonify({'performanceHistory': performance_history}), 200
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


def perform_calculations(assets, is_percentage, total_value, updated_date, start_date):
    """
    Perform the core calculations for historical portfolio performance.
    """
    logger.debug("Performing core calculations")
    absolute_values = {}

    try:
        # Step 1: Calculate absolute values on the updated date
        logger.info("Calculating absolute values for each asset")
        for asset in assets:
            ticker = asset['ticker']
            quantity = float(asset['quantity'])
            price = float(asset['price'])
            logger.debug(f"Processing asset: {ticker}, quantity: {quantity}, price: {price}")

            # Determine absolute value
            if is_percentage:
                absolute_value = (quantity / 100) * total_value
            else:
                absolute_value = quantity

            absolute_values[ticker] = absolute_value
            logger.debug(f"Calculated absolute value for {ticker}: {absolute_value}")

        # Step 2: Fetch historical data
        logger.info("Fetching historical data for assets")
        portfolio_value_history = {}
        for asset in assets:
            ticker = asset['ticker']
            absolute_value = absolute_values[ticker]

            logger.debug(f"Fetching historical prices for {ticker} starting from {start_date}")
            stock_data = yf.download(ticker, start=start_date)

            if updated_date not in stock_data.index:
                closest_date = stock_data.index[stock_data.index <= pd.Timestamp(updated_date)].max()
                if pd.isna(closest_date):
                    error_msg = f"No data available for {ticker} on or before {updated_date}."
                    logger.error(error_msg)
                    raise ValueError(error_msg)

                logger.warning(f"Updated date {updated_date} not found for {ticker}. Using closest available date: {closest_date}")
                updated_date = closest_date.strftime('%Y-%m-%d')

            stock_data['Adjusted Value'] = (
                stock_data['Close'] / stock_data.loc[updated_date]['Close']
            ) * absolute_value

            for date, row in stock_data.iterrows():
                date_str = date.strftime('%Y-%m-%d')
                # Use .item() to ensure values are JSON serializable
                portfolio_value_history[date_str] = portfolio_value_history.get(date_str, 0) + row['Adjusted Value'].item()

            logger.debug(f"Historical data processed for {ticker}")

        # Step 3: Format results
        logger.info("Formatting performance history results")
        performance_history = [
            {'date': date, 'value': round(value, 2)}
            for date, value in sorted(portfolio_value_history.items())
        ]

        logger.debug(f"Formatted performance history: {performance_history}")
        return performance_history

    except Exception as e:
        logger.error(f"An error occurred during calculations: {str(e)}", exc_info=True)
        raise


if __name__ == '__main__':
    logger.info("Starting Flask app on port 5001")
    app.run(port=5001, debug=True)











