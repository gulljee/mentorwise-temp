const express = require('express');
const router = express.Router();
const { createTest, getTests, submitTest, gradeTest } = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:connectionId', protect, createTest);
router.get('/:connectionId', protect, getTests);
router.post('/:testId/submit', protect, submitTest);
router.put('/grade/:submissionId', protect, gradeTest);

module.exports = router;
