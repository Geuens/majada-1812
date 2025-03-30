const mongoose = require('mongoose');

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Reference to User ID
  portfolioId: { type: String, required: true, unique: true }, // Unique Portfolio ID
  name: { type: String, required: true }, // Portfolio Name
  description: { type: String, required: false }, // Portfolio Description
  isPercentage: { type: Boolean, required: true }, // Indicates percentage allocation
  totalValue: { type: Number, required: true, default: 0 }, // Total portfolio value
  currency: { type: String, required: true, default: 'USD' }, // Currency of the portfolio
  performanceHistory: [
    {
      date: { type: Date, default: Date.now },
      value: { type: Number, required: true },
    },
  ], // Historical performance
  assets: [
    {
      ticker: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      type: { type: String, enum: ['Stock', 'Bond', 'Crypto', 'Real Estate', 'Other'], required: true }, // Asset type
    },
  ],
  isDeleted: { type: Boolean, default: false }, // For soft delete
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` field automatically
portfolioSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;

