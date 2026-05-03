const express = require('express');
const router = express.Router();
const {
    sendRequest,
    getReceivedRequests,
    updateRequestStatus,
    getSentRequests,
    getMyStudents,
    getMyMentors,
    completeMentorship,
    getMyTranscripts,
    getPublicTranscripts,
    getNotifications,
    markNotificationRead
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, sendRequest);
router.get('/requests/received', protect, getReceivedRequests);
router.get('/requests/sent', protect, getSentRequests);
router.patch('/requests/:requestId', protect, updateRequestStatus);
router.get('/students', protect, getMyStudents);
router.get('/mentors', protect, getMyMentors);
router.post('/complete', protect, completeMentorship);
router.get('/transcripts', protect, getMyTranscripts);
router.get('/transcripts/public/:userId', getPublicTranscripts);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
