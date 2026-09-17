const { processPointsExpiration } = require('../services/pointsService');

// @desc    Simulate time travel / run 90-day points expiration job
// @route   POST /clock or POST /api/clock
// @access  Public / Evaluation
const advanceClock = async (req, res, next) => {
  try {
    const { currentDate, advanceDays } = req.body || {};

    let targetDate = new Date();
    if (currentDate) {
      targetDate = new Date(currentDate);
    } else if (advanceDays) {
      targetDate = new Date(Date.now() + Number(advanceDays) * 24 * 60 * 60 * 1000);
    }

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for clock simulation',
      });
    }

    const expirationResult = await processPointsExpiration(targetDate);

    res.json({
      success: true,
      message: `Clock advanced to ${expirationResult.simulatedDate}. Processed 90-day points expiration.`,
      data: expirationResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  advanceClock,
};
