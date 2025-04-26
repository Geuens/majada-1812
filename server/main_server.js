const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');
const logger = require('./utils/logger');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const commentRoutes = require('./routes/commentRoutes'); // Import comment routes

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',  // Development
  'https://majada1812.com', // Production
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the origin
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the origin
    }
  }
}));

app.use(bodyParser.json());


// Routes
app.use('/auth', userRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/comments', commentRoutes); // Use comment routes

// Health Check
app.get('/health', (req, res) => {
  logger.info('Health check endpoint hit');
  res.status(200).send('Server is healthy');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  logger.error(`Error [${status}]: ${err.message}`);
  res.status(status).json({ error: err.message || 'Something went wrong' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});








