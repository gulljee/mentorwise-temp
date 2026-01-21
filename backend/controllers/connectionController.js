const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');

exports.sendRequest = async (req, res) => {
    try {
        const { mentorId, message } = req.body;
        const menteeId = req.user.userId;

        // Validate mentor exists and is actually a mentor
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

        // Check if request already exists
        const existingRequest = await ConnectionRequest.findOne({
            mentee: menteeId,
            mentor: mentorId
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Request already sent to this mentor'
            });
        }

        // Create new connection request
        const connectionRequest = await ConnectionRequest.create({
            mentee: menteeId,
            mentor: mentorId,
            message: message || ''
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
