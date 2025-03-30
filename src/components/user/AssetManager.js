import React, { useState, useEffect } from 'react';
import './AssetManager.css';

const AssetManager = ({ assets, setAssets, isPercentage, portfolioValue }) => {
  const [newAsset, setNewAsset] = useState({ ticker: '', price: '', quantity: '' });
  const [tickerData, setTickerData] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const response = await fetch('/data/stocks/index_tickers/tickers_all.json');
        const data = await response.json();

        if (Array.isArray(data)) {
          setTickerData(data);
        } else {
          console.error('Error: Ticker data is not an array', data);
        }
      } catch (err) {
        console.error('Error loading ticker data:', err);
      }
    };

    fetchTickerData();
  }, []);

  const handleTickerChange = (e) => {
    const value = e.target.value;
    setNewAsset({ ...newAsset, ticker: value });

    if (value.length > 0) {
      const suggestions = tickerData.filter(
        (item) =>
          item.Company.toLowerCase().includes(value.toLowerCase()) ||
          item.Symbol.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(suggestions);
      setShowDropdown(true);
    } else {
      setFilteredSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    if (!suggestion || !suggestion.Symbol || !suggestion.LastPrice) {
      alert("Invalid suggestion selected.");
      return;
    }

    const existingAsset = assets.find((asset) => asset.ticker === suggestion.Symbol);

    if (existingAsset) {
      // Prefill quantity and price fields with the existing asset's values
      setNewAsset({
        ticker: existingAsset.ticker,
        price: existingAsset.price.toFixed(2),
        quantity: existingAsset.quantity.toString(),
      });
    } else {
      // Prefill with the selected ticker's last price and clear quantity
      setNewAsset({
        ticker: suggestion.Symbol,
        price: parseFloat(suggestion.LastPrice).toFixed(2),
        quantity: '',
      });
    }

    setFilteredSuggestions([]);
    setShowDropdown(false);
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    const quantity = parseFloat(newAsset.quantity);
    const price = parseFloat(newAsset.price);

    if (!newAsset.ticker || isNaN(price) || isNaN(quantity) || quantity <= 0) {
      alert("Please enter valid asset details.");
      return;
    }

    if (isPercentage) {
      const totalPercentage = assets.reduce(
        (sum, asset) => sum + parseFloat(asset.quantity || 0),
        0
      );
      if (totalPercentage + quantity > 100) {
        alert("Total allocation exceeds 100%.");
        return;
      }
    }

    const existingAssetIndex = assets.findIndex(
      (asset) => asset.ticker === newAsset.ticker
    );

    if (existingAssetIndex !== -1) {
      const updatedAssets = [...assets];
      const existingAsset = updatedAssets[existingAssetIndex];
      const updatedQuantity = isPercentage
        ? parseFloat(existingAsset.quantity) + quantity
        : quantity;

      updatedAssets[existingAssetIndex] = {
        ...existingAsset,
        price: price,
        quantity: updatedQuantity,
      };
      setAssets(updatedAssets);
    } else {
      setAssets([...assets, { ...newAsset, price, quantity }]);
    }

    setNewAsset({ ticker: '', price: '', quantity: '' });
  };

  const calculateTotalValue = () => {
    if (isPercentage) {
      return parseFloat(portfolioValue || 0).toFixed(2);
    } else {
      const total = assets.reduce((total, asset) => {
        const price = parseFloat(asset.price || 0);
        const quantity = parseFloat(asset.quantity || 0);
        if (isNaN(price) || isNaN(quantity)) return total;

        return total + quantity;
      }, 0);

      return total.toFixed(2);
    }
  };

  return (
    <div>
      <div className="asset-management">
        <form onSubmit={handleAddAsset} className="asset-form">
          <div className="input-group">
            <input
              type="text"
              name="ticker"
              placeholder="Search for a company or ticker"
              value={newAsset.ticker}
              onChange={handleTickerChange}
              required
              className="input-field"
              autoComplete="off"
            />
            {showDropdown && (
              <ul className="dropdown">
                {filteredSuggestions.map((item, index) => (
                  <li
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleSuggestionSelect(item)}
                  >
                    {item.Company} ({item.Symbol})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="number"
            name="quantity"
            placeholder={isPercentage ? 'Percentage' : 'Quantity'}
            value={newAsset.quantity}
            onChange={(e) =>
              setNewAsset({ ...newAsset, quantity: e.target.value })
            }
            required
            className="input-field"
          />
          <button type="submit" className="add-button">
            Add Asset
          </button>
        </form>

        <div className="asset-list">
          <h3>Your Assets</h3>
          {assets.length === 0 ? (
            <p>No assets added to the portfolio yet.</p>
          ) : (
            <ul>
              {assets.map((asset, index) => (
                <li key={index} className="asset-item">
                  <span>
                    {asset.ticker} - {isPercentage
                      ? `$${(asset.price * (asset.quantity / 100)).toFixed(2)} (${asset.quantity}%)`
                      : `${asset.quantity} $`}
                  </span>
                  <button
                    onClick={() =>
                      setAssets(assets.filter((_, i) => i !== index))
                    }
                    className="remove-button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="portfolio-value">
        <h3>Total Portfolio Value: ${calculateTotalValue()}</h3>
      </div>
    </div>
  );
};

export default AssetManager;






















