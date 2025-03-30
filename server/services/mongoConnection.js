const mongoose = require('mongoose');

const connectWithRetry = (logger) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/userdb';

  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      logger.info('Connected to MongoDB');
    })
    .catch((err) => {
      logger.error(`Failed to connect to MongoDB: ${err.message}`);
      setTimeout(() => connectWithRetry(logger), 5000); // Retry after 5 seconds
    });
};

module.exports = connectWithRetry;
