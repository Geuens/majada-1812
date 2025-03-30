import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Portfolio.css';
import AssetManager from './AssetManager';

const Portfolio = ({ userId }) => {
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPercentage, setIsPercentage] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/portfolio/user/${userId}`);
        setPortfolios(response.data.portfolios || []);
      } catch (err) {
        console.error('Error fetching portfolios:', err.message);
        setError('Failed to load portfolios.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, [userId]);

  const handlePortfolioSelect = (e) => {
    setSelectedPortfolio(e.target.value);
    if (e.target.value === 'new') {
      setPortfolioName('');
      setAssets([]);
      setPortfolioValue('');
    } else {
      const selected = portfolios.find((p) => p.portfolioId === e.target.value);
      if (selected) {
        setPortfolioName(selected.name);
        setAssets(selected.assets);
        setPortfolioValue(selected.totalValue || '');
        setIsPercentage(selected.isPercentage || false);
      }
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (window.confirm("Are you sure you want to delete this portfolio?")) {
      try {
        await axios.delete(`http://localhost:5000/api/portfolio/delete/${portfolioId}`);
        setSuccess('Portfolio deleted successfully!');
        setError('');
        setPortfolios(portfolios.filter((p) => p.portfolioId !== portfolioId));
      } catch (err) {
        console.error('Error deleting portfolio:', err.message);
        setError('Failed to delete portfolio.');
        setSuccess('');
      }
    }
  };

const handleSavePortfolio = async () => {
  if (!portfolioName) {
    setError('Portfolio name is required.');
    return;
  }

  if (isPercentage && (!portfolioValue || portfolioValue <= 0)) {
    setError('A valid portfolio value is required for percentage-based allocations.');
    return;
  }

  if (assets.length === 0) {
    setError('Assets cannot be empty.');
    return;
  }

  try {
    const portfolioId = portfolioName.toLowerCase().replace(/\s+/g, '-');
    const existingPortfolio = portfolios.find((p) => p.portfolioId === portfolioId);

    console.log(`Saving Portfolio: ${portfolioName}`);
    console.log('Formatted Assets:', JSON.stringify(assets, null, 2));

    // Format assets to include all necessary fields
    const formattedAssets = assets.map((asset) => ({
      ticker: asset.ticker,
      quantity: parseFloat(asset.quantity),
      price: parseFloat(asset.price),
      type: asset.type || 'Stock', // Default type to 'Stock'
    }));

    // Calculate the total value based on allocation type
    const calculateTotalValue = () => {
      if (isPercentage) {
        return parseFloat(portfolioValue || 0).toFixed(2);
      } else {
        return assets.reduce((total, asset) => {
          const price = parseFloat(asset.price || 0);
          const quantity = parseFloat(asset.quantity || 0);
          return isNaN(price) || isNaN(quantity) ? total : total + price * quantity;
        }, 0).toFixed(2);
      }
    };

    // Prepare the payload
    const payload = {
      userId,
      portfolioId, // Include the portfolio ID for both create and update
      name: portfolioName,
      isPercentage,
      totalValue: isPercentage ? parseFloat(portfolioValue) : parseFloat(calculateTotalValue()),
      assets: formattedAssets,
    };

    if (existingPortfolio) {
      // Update an existing portfolio
      console.log(`Updating existing portfolio with ID: ${existingPortfolio.portfolioId}`);
      const response = await axios.put(
        `http://localhost:5000/api/portfolio/update/${existingPortfolio.portfolioId}`,
        payload
      );
      console.log('Portfolio updated successfully. Server response:', response.data);

      // Update the state with the updated portfolio
      setPortfolios((prevPortfolios) =>
        prevPortfolios.map((p) =>
          p.portfolioId === existingPortfolio.portfolioId ? response.data.portfolio : p
        )
      );
      setSuccess('Portfolio updated successfully!');
    } else {
      // Create a new portfolio
      console.log('Creating a new portfolio...');
      const response = await axios.post('http://localhost:5000/api/portfolio/create', payload);
      console.log('Portfolio created successfully. Server response:', response.data);

      // Add the new portfolio to the state
      setPortfolios((prevPortfolios) => [...prevPortfolios, response.data.portfolio]);
      setSuccess('Portfolio saved successfully!');
    }

    setError('');
    setSelectedPortfolio(portfolioId); // Set the newly saved/updated portfolio in the dropdown
  } catch (err) {
    console.error('Error saving/updating portfolio:', err.response?.data || err.message);
    setError(`Failed to save/update portfolio: ${err.response?.data?.error || err.message}`);
    setSuccess('');
  }
};




  return (
    <div className="portfolio-container section-container">
      <div className="portfolio-select">
        <select
          value={selectedPortfolio}
          onChange={handlePortfolioSelect}
          className="select-field"
        >
          <option value="">Select Portfolio</option>
          {portfolios.map((portfolio) => (
            <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
              {portfolio.portfolioId}
            </option>
          ))}
          <option value="new">Add New Portfolio</option>
        </select>
      </div>

      {selectedPortfolio === 'new' && (
        <>
          <div className="portfolio-name-container">
            <input
              type="text"
              placeholder="Enter Portfolio Name"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              className="input-field"
            />
            {isPercentage && (
              <input
                type="number"
                placeholder="Enter Total Portfolio Value"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(e.target.value)}
                className="input-field"
              />
            )}
          </div>
          <div className="portfolio-type">
            <label>
              <input
                type="radio"
                name="allocationType"
                value="percentage"
                checked={isPercentage}
                onChange={() => setIsPercentage(true)}
              />
              Allocate by Percentage
            </label>
            <label>
              <input
                type="radio"
                name="allocationType"
                value="quantity"
                checked={!isPercentage}
                onChange={() => setIsPercentage(false)}
              />
              Allocate by Quantity
            </label>
          </div>
        </>
      )}

      <AssetManager
        assets={assets}
        setAssets={setAssets}
        isPercentage={isPercentage}
        portfolioValue = {portfolioValue}
      />

      {loading && <p>Loading...</p>}

      <div className="button-container">
        {selectedPortfolio !== 'new' && (
          <button
            onClick={() => handleDeletePortfolio(selectedPortfolio)}
            className="delete-button"
          >
            Delete Portfolio
          </button>
        )}
        <button onClick={handleSavePortfolio} className="save-button">
          Save Portfolio
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default Portfolio;
