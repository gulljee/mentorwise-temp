const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getUserTranscripts, approveUser } = require('../controllers/adminController');

// Admin endpoints
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/transcripts/:menteeId', getUserTranscripts);
router.put('/users/:id/approve', approveUser);

module.exports = router;
