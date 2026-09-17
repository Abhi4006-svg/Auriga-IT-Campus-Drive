const mongoose = require('mongoose');

const outboxSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    memberName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      default: 'TIER_UPGRADE',
    },
    oldTier: {
      type: String,
      required: true,
    },
    newTier: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'DELIVERED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

outboxSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Outbox', outboxSchema);
