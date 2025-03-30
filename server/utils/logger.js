const { createLogger, format, transports } = require('winston');

// Create the logger with transports
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: [
    // Add Console Transport
    new transports.Console({
      handleExceptions: true,
    }),
    // Add File Transport
    new transports.File({ filename: 'application.log', handleExceptions: true }),
  ],
  exitOnError: false, // Prevent Winston from exiting after handling an error
});

// Export logger
module.exports = logger;

