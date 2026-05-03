const express = require('express');
const router = express.Router();
const { createSession, getSessions, updateSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSession)
    .get(protect, getSessions);

router.route('/:id')
    .patch(protect, updateSession);

module.exports = router;
