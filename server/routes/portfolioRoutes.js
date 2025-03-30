const express = require('express');
const Portfolio = require('../models/portfolioModel');
const logger = require('winston').loggers.get('default');
const Joi = require('joi');
const axios = require('axios');

const router = express.Router();

// Validation Schemas
const createPortfolioSchema = Joi.object({
  userId: Joi.string().required(),
  portfolioId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  isPercentage: Joi.boolean().required(),
  totalValue: Joi.number().required(),
  assets: Joi.array().items(
    Joi.object({
      ticker: Joi.string().required(),
      quantity: Joi.number().required(),
      price: Joi.number().required(),
      type: Joi.string().valid('Stock', 'Bond', 'Crypto', 'Real Estate', 'Other').required(),
    })
  ).required(),
});

// Helper function to log detailed errors
const logError = (route, error, additionalInfo = {}) => {
  logger.error(`${route} - Error: ${error.message}`, { additionalInfo, stack: error.stack });
};

// Create a portfolio
router.post('/create', async (req, res) => {
  logger.info('POST /create - Received request to create a portfolio', { payload: req.body });

  const { error } = createPortfolioSchema.validate(req.body);
  if (error) {
    logger.warn('POST /create - Validation failed', {
      validationErrors: error.details.map((detail) => detail.message),
    });
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const pythonPayload = {
      assets: req.body.assets,
      isPercentage: req.body.isPercentage,
      totalValue: req.body.totalValue,
      updatedDate: new Date().toISOString().split('T')[0],
      startDate: req.body.startDate,
    };

    logger.info('POST /create - Preparing to call Python service for historical data', { pythonPayload });

    const pythonResponse = await axios.post('http://localhost:5001/calculate-historical', pythonPayload, {
      timeout: 10000,
    });

    logger.info('POST /create - Received response from Python service', {
      statusCode: pythonResponse.status,
      responseData: pythonResponse.data,
    });

    const performanceHistory = pythonResponse.data.performanceHistory;

    logger.info('POST /create - Historical data successfully retrieved from Python service', {
      performanceHistoryPreview: performanceHistory.slice(0, 5), // Log a preview of the data
    });

    const portfolioData = {
      ...req.body,
      performanceHistory,
    };

    const portfolio = new Portfolio(portfolioData);
    await portfolio.save();

    logger.info('POST /create - Portfolio created successfully', {
      portfolioId: portfolio.portfolioId,
      userId: req.body.userId,
    });

    res.status(201).json({ message: 'Portfolio created successfully', portfolio });
  } catch (err) {
    if (err.response) {
      logger.error('POST /create - Python service responded with an error', {
        statusCode: err.response.status,
        responseData: err.response.data,
      });
    } else if (err.request) {
      logger.error('POST /create - No response received from Python service', {
        request: err.request,
      });
    } else {
      logger.error('POST /create - Unexpected error occurred', { error: err.message });
    }

    res.status(500).json({ error: 'Error creating portfolio' });
  }
});

// Get all portfolios for a user with pagination
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.info(`GET /user/${userId} - Fetching portfolios`, { page, limit });

  try {
    const portfolios = await Portfolio.find({ userId, isDeleted: false })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (portfolios.length === 0) {
      logger.info(`GET /user/${userId} - No portfolios found`);
      return res.status(200).json({ portfolios: [], total: 0, page: 1, pages: 1 });
    }

    const total = await Portfolio.countDocuments({ userId, isDeleted: false });

    logger.info(`GET /user/${userId} - Portfolios fetched successfully`, { total, page });
    res.status(200).json({ portfolios, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    logError(`GET /user/${userId}`, err);
    res.status(500).json({ error: 'Error fetching portfolios' });
  }
});

router.put('/update/:portfolioId', async (req, res) => {
  const { portfolioId } = req.params;
  const updates = req.body;

  const requestTimestamp = new Date().toISOString();
  logger.info(`[START] PUT /update/${portfolioId} - Portfolio update initiated`, {
    portfolioId,
    updatesReceived: updates,
    timestamp: requestTimestamp,
  });

  try {
    // Step 1: Fetch Existing Portfolio
    const existingPortfolio = await Portfolio.findOne({ portfolioId });
    if (!existingPortfolio) {
      const notFoundLog = `[WARN] PUT /update/${portfolioId} - Portfolio not found`;
      logger.warn(notFoundLog, { portfolioId, timestamp: requestTimestamp });
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    logger.debug(`[DETAIL] PUT /update/${portfolioId} - Existing portfolio fetched`, {
      portfolioId,
      existingPortfolio,
      timestamp: new Date().toISOString(),
    });

    // Step 2: Sanitize and Format Dates
    const sanitizeDate = (date) => date.split('T')[0]; // Removes time and timezone
    const updatedDate = sanitizeDate(new Date().toISOString());
    const startDate = updates.startDate
      ? sanitizeDate(updates.startDate)
      : sanitizeDate(existingPortfolio.performanceHistory[0]?.date || new Date().toISOString());

    logger.info(`[INFO] PUT /update/${portfolioId} - Dates sanitized`, {
      portfolioId,
      updatedDate,
      startDate,
    });

    // Step 3: Construct Payload for Python Service
    const pythonPayload = {
      assets: updates.assets || existingPortfolio.assets,
      isPercentage: updates.isPercentage ?? existingPortfolio.isPercentage,
      totalValue: updates.totalValue || existingPortfolio.totalValue,
      updatedDate,
      startDate,
    };

    logger.info(`[INFO] PUT /update/${portfolioId} - Python payload prepared`, {
      portfolioId,
      pythonPayload,
    });

    // Step 4: Call Python Service
    let performanceHistory;
    try {
      const pythonResponse = await axios.post('http://localhost:5001/calculate-historical', pythonPayload, {
        timeout: 10000,
      });
      performanceHistory = pythonResponse.data.performanceHistory;

      if (!performanceHistory || !Array.isArray(performanceHistory) || performanceHistory.length === 0) {
        const invalidHistoryLog = `[ERROR] PUT /update/${portfolioId} - Invalid performance history from Python service`;
        logger.error(invalidHistoryLog, {
          portfolioId,
          performanceHistory,
          responseMetadata: pythonResponse.data,
        });
        return res.status(500).json({ error: 'Invalid performance history received from Python service' });
      }

      logger.info(`[INFO] PUT /update/${portfolioId} - Python service response received`, {
        portfolioId,
        performanceHistoryPreview: performanceHistory.slice(0, 5),
        totalEntries: performanceHistory.length,
      });
    } catch (pythonError) {
      if (pythonError.response) {
        logger.error(`[ERROR] PUT /update/${portfolioId} - Python service error`, {
          portfolioId,
          statusCode: pythonError.response.status,
          errorResponse: pythonError.response.data,
        });
      } else if (pythonError.request) {
        logger.error(`[ERROR] PUT /update/${portfolioId} - No response from Python service`, {
          portfolioId,
          requestDetails: pythonError.request,
        });
      } else {
        logger.error(`[ERROR] PUT /update/${portfolioId} - Unexpected Python service error`, {
          portfolioId,
          errorMessage: pythonError.message,
        });
      }
      return res.status(500).json({ error: 'Error updating performance history' });
    }

    // Step 5: Prepare Updated Data for Database
    const updatedData = {
      ...updates,
      performanceHistory,
      updatedAt: Date.now(),
    };

    logger.debug(`[DETAIL] PUT /update/${portfolioId} - Data prepared for database update`, {
      portfolioId,
      updatedData,
    });

    // Step 6: Update Portfolio in Database
    const updatedPortfolio = await Portfolio.findOneAndUpdate({ portfolioId }, updatedData, { new: true });

    if (!updatedPortfolio) {
      const dbUpdateFailLog = `[ERROR] PUT /update/${portfolioId} - Database update failed`;
      logger.error(dbUpdateFailLog, { portfolioId });
      return res.status(500).json({ error: 'Failed to update portfolio' });
    }

    logger.info(`[SUCCESS] PUT /update/${portfolioId} - Portfolio updated successfully`, {
      portfolioId,
      updatedPortfolio,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Portfolio updated successfully', portfolio: updatedPortfolio });
  } catch (error) {
    logger.error(`[ERROR] PUT /update/${portfolioId} - Unexpected error during update process`, {
      portfolioId,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: 'Error updating portfolio here mate' });
  }
});

// Hard delete a portfolio
router.delete('/delete/:portfolioId', async (req, res) => {
  const { portfolioId } = req.params;

  logger.info(`DELETE /delete/${portfolioId} - Deleting portfolio`);

  try {
    const result = await Portfolio.findOneAndDelete({ portfolioId });
    if (!result) {
      logger.warn(`DELETE /delete/${portfolioId} - Portfolio not found`);
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    logger.info(`DELETE /delete/${portfolioId} - Portfolio deleted successfully`, { portfolioId });
    res.status(200).json({ message: 'Portfolio deleted successfully' });
  } catch (err) {
    logError(`DELETE /delete/${portfolioId}`, err);
    res.status(500).json({ error: 'Error deleting portfolio' });
  }
});


module.exports = router;






