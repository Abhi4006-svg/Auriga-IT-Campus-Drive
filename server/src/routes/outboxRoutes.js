const express = require('express');
const router = express.Router();
const { getOutboxEvents } = require('../controllers/outboxController');

router.get('/', getOutboxEvents);

module.exports = router;
