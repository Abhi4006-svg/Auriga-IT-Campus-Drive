const Outbox = require('../models/Outbox');

// @desc    Get notification outbox events (Level 3 Twist Evaluation)
// @route   GET /outbox or GET /api/outbox
// @access  Public / Evaluation
const getOutboxEvents = async (req, res, next) => {
  try {
    const { status, event } = req.query;

    let query = {};
    if (status) query.status = status;
    if (event) query.event = event;

    const events = await Outbox.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOutboxEvents,
};
