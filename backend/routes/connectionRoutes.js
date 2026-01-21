const express = require('express');
const router = express.Router();
const {
    sendRequest,
    getReceivedRequests,
    updateRequestStatus,
    getSentRequests
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

// Send connection request (mentee)
router.post('/request', protect, sendRequest);

// Get received requests (mentor)
router.get('/requests/received', protect, getReceivedRequests);

// Get sent requests (mentee)
router.get('/requests/sent', protect, getSentRequests);

// Update request status (mentor - accept/reject)
router.patch('/requests/:requestId', protect, updateRequestStatus);

module.exports = router;
