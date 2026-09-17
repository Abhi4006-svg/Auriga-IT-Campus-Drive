const express = require('express');
const router = express.Router();
const { getRewards, createReward } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getRewards);
router.post('/', protect, createReward);

module.exports = router;
