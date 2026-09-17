const express = require('express');
const router = express.Router();
const { advanceClock } = require('../controllers/clockController');

router.post('/', advanceClock);

module.exports = router;
