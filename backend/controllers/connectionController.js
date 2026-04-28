const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
const Transcript = require('../models/Transcript');
const Notification = require('../models/Notification');

exports.sendRequest = async (req, res) => {
    try {
        const { mentorId, message } = req.body;
        const menteeId = req.user.userId;

        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        if (mentor.role !== 'Mentor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a mentor'
            });
        }

        const existingRequest = await ConnectionRequest.findOne({
            mentee: menteeId,
            mentor: mentorId,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Request already sent to this mentor'
            });
        }

        const connectionRequest = await ConnectionRequest.create({
            mentee: menteeId,
            mentor: mentorId,
            message: message || ''
        });

        const menteeUser = await User.findById(menteeId);
        await Notification.create({
            user: mentorId,
            message: `New connection request from ${menteeUser.firstName} ${menteeUser.lastName}`,
            type: 'info'
        });

        res.status(201).json({
            success: true,
            message: 'Connection request sent successfully',
            request: connectionRequest
        });

    } catch (error) {
        console.error('Error sending connection request:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending connection request',
            error: error.message
        });
    }
};

exports.getReceivedRequests = async (req, res) => {
    try {
        const mentorId = req.user.userId;

        const requests = await ConnectionRequest.find({
            mentor: mentorId,
            status: 'pending'
        })
            .populate('mentee', 'firstName lastName email department batch cgpa subjects')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error('Error fetching connection requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching connection requests',
            error: error.message
        });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;
        const mentorId = req.user.userId;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "accepted" or "rejected"'
            });
        }

        const request = await ConnectionRequest.findOne({
            _id: requestId,
            mentor: mentorId
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Connection request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed'
            });
        }

        request.status = status;
        await request.save();

        const mentorUser = await User.findById(mentorId);
        await Notification.create({
            user: request.mentee,
            message: `Your connection request was ${status} by ${mentorUser.firstName} ${mentorUser.lastName}`,
            type: status === 'accepted' ? 'success' : 'error'
        });

        res.status(200).json({
            success: true,
            message: `Request ${status} successfully`,
            request
        });

    } catch (error) {
        console.error('Error updating connection request:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating connection request',
            error: error.message
        });
    }
};

exports.getSentRequests = async (req, res) => {
    try {
        const menteeId = req.user.userId;

        const requests = await ConnectionRequest.find({
            mentee: menteeId
        })
            .populate('mentor', 'firstName lastName email department batch cgpa subjects')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error('Error fetching sent requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sent requests',
            error: error.message
        });
    }
};

exports.getMyStudents = async (req, res) => {
    try {
        const mentorId = req.user.userId;

        const connections = await ConnectionRequest.find({
            mentor: mentorId,
            status: 'accepted'
        })
        .populate('mentee', 'firstName lastName email department batch cgpa subjects phoneNumber')
        .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: connections.length,
            students: connections
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

exports.getMyMentors = async (req, res) => {
    try {
        const menteeId = req.user.userId;

        const connections = await ConnectionRequest.find({
            mentee: menteeId,
            status: 'accepted'
        })
        .populate('mentor', 'firstName lastName email department batch cgpa subjects phoneNumber')
        .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: connections.length,
            mentors: connections
        });

    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mentors',
            error: error.message
        });
    }
};

exports.completeMentorship = async (req, res) => {
    try {
        const { connectionId, academicGrade, behaviorRating, punctualityRating, remarks } = req.body;
        const mentorId = req.user.userId;

        const connection = await ConnectionRequest.findOne({
            _id: connectionId,
            mentor: mentorId,
            status: 'accepted'
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Active connection not found'
            });
        }

        // Create Transcript
        const transcript = await Transcript.create({
            mentee: connection.mentee,
            mentor: mentorId,
            connection: connectionId,
            academicGrade,
            behaviorRating,
            punctualityRating,
            remarks
        });

        // Update Connection Status
        connection.status = 'completed';
        await connection.save();

        // Create Notification for Mentee
        await Notification.create({
            user: connection.mentee,
            message: 'Your Mentorship is Completed! Check your transcripts tab.',
            type: 'success'
        });

        res.status(200).json({
            success: true,
            message: 'Mentorship completed and transcript generated successfully',
            transcript
        });

    } catch (error) {
        console.error('Error completing mentorship:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing mentorship',
            error: error.message
        });
    }
};

exports.getMyTranscripts = async (req, res) => {
    try {
        const menteeId = req.user.userId;

        const transcripts = await Transcript.find({ mentee: menteeId })
            .populate('mentor', 'firstName lastName email department batch subjects')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transcripts.length,
            transcripts
        });

    } catch (error) {
        console.error('Error fetching transcripts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transcripts',
            error: error.message
        });
    }
};

exports.getPublicTranscripts = async (req, res) => {
    try {
        const { userId } = req.params;

        const transcripts = await Transcript.find({ mentee: userId })
            .populate('mentor', 'firstName lastName department batch')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transcripts.length,
            transcripts
        });

    } catch (error) {
        console.error('Error fetching public transcripts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching public transcripts',
            error: error.message
        });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { read: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating notification' });
    }
};
