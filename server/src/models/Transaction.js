const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['PURCHASE', 'REDEMPTION', 'EXPIRATION'],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      required: true,
    },
    remainingPoints: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
    },
    description: {
      type: String,
      default: '',
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
