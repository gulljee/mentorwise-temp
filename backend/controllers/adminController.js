const User = require('../models/User');
const Rating = require('../models/Rating');
const Transcript = require('../models/Transcript');
const ConnectionRequest = require('../models/ConnectionRequest');
const Session = require('../models/Session');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Material = require('../models/Material');
const Task = require('../models/Task');
const Test = require('../models/Test');
const TestSubmission = require('../models/TestSubmission');
const AIChat = require('../models/AIChat');

// @desc    Get all users with their average ratings
// @route   GET /api/admin/users
// @access  Admin only
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -otpCode -otpExpires -resetPasswordToken -resetPasswordExpires');

        // Calculate average ratings for mentors
        const usersWithRatings = await Promise.all(users.map(async (user) => {
            const userData = user.toObject();
            if (user.role === 'Mentor') {
                const ratings = await Rating.find({ ratee: user._id });
                if (ratings.length > 0) {
                    const sum = ratings.reduce((acc, curr) => acc + curr.stars, 0);
                    userData.averageRating = (sum / ratings.length).toFixed(1);
                    userData.totalRatings = ratings.length;
                } else {
                    userData.averageRating = 0;
                    userData.totalRatings = 0;
                }
            }
            return userData;
        }));

        res.status(200).json({
            success: true,
            count: users.length,
            data: usersWithRatings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 1. Find all connection requests where user is mentor or mentee
        const connections = await ConnectionRequest.find({
            $or: [{ mentor: userId }, { mentee: userId }]
        });
        const connectionIds = connections.map(c => c._id);

        // 2. Delete data associated with these connections
        if (connectionIds.length > 0) {
            await Rating.deleteMany({ connection: { $in: connectionIds } });
            await Session.deleteMany({ connection: { $in: connectionIds } });
            await Transcript.deleteMany({ connection: { $in: connectionIds } });
            await Task.deleteMany({ connection: { $in: connectionIds } });
            
            // Delete tests and their submissions
            const tests = await Test.find({ connection: { $in: connectionIds } });
            const testIds = tests.map(t => t._id);
            if (testIds.length > 0) {
                await TestSubmission.deleteMany({ test: { $in: testIds } });
                await Test.deleteMany({ _id: { $in: testIds } });
            }

            // Finally delete the connections themselves
            await ConnectionRequest.deleteMany({ _id: { $in: connectionIds } });
        }

        // 3. Delete user-specific data not tied to a specific connection
        await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
        await Notification.deleteMany({ user: userId });
        await Material.deleteMany({ uploadedBy: userId });
        await AIChat.deleteMany({ user: userId });
        await Rating.deleteMany({ $or: [{ rater: userId }, { ratee: userId }] }); // Catch-all for any ratings not tied to connections if any

        // 4. Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get transcripts for a mentee
// @route   GET /api/admin/transcripts/:menteeId
// @access  Admin only
exports.getUserTranscripts = async (req, res) => {
    try {
        const transcripts = await Transcript.find({ mentee: req.params.menteeId })
            .populate('mentor', 'firstName lastName')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: transcripts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
// @desc    Approve or reject a mentor
// @route   PUT /api/admin/users/:id/approve
// @access  Admin only
exports.approveUser = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isApproved = isApproved;
        await user.save({ validateBeforeSave: false });

        // If approved, send a notification or just success
        if (isApproved) {
            await Notification.create({
                user: user._id,
                message: 'Your mentor profile has been approved! You can now log in and access all mentor features.',
                type: 'success'
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${isApproved ? 'approved' : 'unapproved'} successfully`,
            data: user
        });
    } catch (error) {
        console.error('Error in approveUser:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
