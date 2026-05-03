const Rating = require('../models/Rating');
const ConnectionRequest = require('../models/ConnectionRequest');
const mongoose = require('mongoose');

exports.submitRating = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { stars, comment } = req.body;
        const raterId = req.user.userId;

        if (!raterId) {
            return res.status(401).json({ success: false, message: 'Unauthorised.' });
        }

        const starsNum = Number(stars);
        if (!starsNum || starsNum < 1 || starsNum > 5) {
            return res.status(400).json({ success: false, message: 'Stars must be between 1 and 5.' });
        }

        if (!mongoose.Types.ObjectId.isValid(connectionId)) {
            return res.status(400).json({ success: false, message: 'Invalid connection ID.' });
        }

        const connection = await ConnectionRequest.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection not found.' });
        }

        if (!connection.mentor || !connection.mentee) {
            return res.status(400).json({ success: false, message: 'Malformed connection document.' });
        }

        const mentorId = connection.mentor.toString();
        const menteeId = connection.mentee.toString();
        const raterStr = raterId.toString();

        if (menteeId !== raterStr) {
            return res.status(403).json({ success: false, message: 'Only mentees are authorised to rate mentors.' });
        }

        const rateeId = mentorId;

        const rating = await Rating.findOneAndUpdate(
            { connection: connectionId, rater: raterId },
            { stars: starsNum, comment: comment || '', ratee: rateeId },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.json({ success: true, rating });
    } catch (err) {
        console.error('submitRating error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

exports.getMyRating = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const raterId = req.user.userId;

        if (!raterId || !mongoose.Types.ObjectId.isValid(connectionId)) {
            return res.json({ success: true, rating: null });
        }

        const rating = await Rating.findOne({ connection: connectionId, rater: raterId });
        return res.json({ success: true, rating: rating || null });
    } catch (err) {
        console.error('getMyRating error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

exports.getUserRating = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({ success: true, average: null, count: 0 });
        }

        const ratings = await Rating.find({ ratee: userId });

        if (ratings.length === 0) {
            return res.json({ success: true, average: null, count: 0 });
        }

        const average = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
        return res.json({ success: true, average: Math.round(average * 10) / 10, count: ratings.length });
    } catch (err) {
        console.error('getUserRating error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};
