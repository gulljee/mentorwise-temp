const Session = require('../models/Session');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new session (Book a session)
// @route   POST /api/sessions
// @access  Private (Mentee)
const createSession = async (req, res) => {
    try {
        const { mentorId, date, time } = req.body;
        const menteeId = req.user.userId;

        // Verify connection exists and is accepted
        const connection = await ConnectionRequest.findOne({
            mentee: menteeId,
            mentor: mentorId,
            status: 'accepted'
        });

        if (!connection) {
            return res.status(403).json({ message: 'You must be connected with this mentor to book a session.' });
        }

        const newSession = new Session({
            mentee: menteeId,
            mentor: mentorId,
            connection: connection._id,
            date,
            time
        });

        await newSession.save();

        const menteeUser = await User.findById(menteeId);
        await Notification.create({
            user: mentorId,
            message: `${menteeUser.firstName} ${menteeUser.lastName} booked a session for ${date} at ${time}.`,
            type: 'info'
        });

        res.status(201).json({ message: 'Session booked successfully.', session: newSession });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ message: 'Server error while booking session.' });
    }
};

// @desc    Get all sessions for logged-in user
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role; // 'Mentor' or 'Mentee'

        let sessions;

        if (userRole === 'Mentor') {
            sessions = await Session.find({ mentor: userId })
                .populate('mentee', 'firstName lastName email department batch profilePicture')
                .sort({ date: 1, time: 1 });
            // Filter out orphans
            sessions = sessions.filter(s => s.mentee !== null);
        } else {
            sessions = await Session.find({ mentee: userId })
                .populate('mentor', 'firstName lastName email department subjects profilePicture')
                .sort({ date: 1, time: 1 });
            // Filter out orphans
            sessions = sessions.filter(s => s.mentor !== null);
        }

        res.status(200).json({ sessions });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Server error while fetching sessions.' });
    }
};

// @desc    Update a session status/link
// @route   PATCH /api/sessions/:id
// @access  Private
const updateSession = async (req, res) => {
    try {
        const { status, meetingLink } = req.body;
        const sessionId = req.params.id;
        const userId = req.user.userId;

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        // Verify authorization
        if (session.mentor.toString() !== userId.toString() && session.mentee.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this session.' });
        }

        // Only mentors can confirm and add link
        if (status === 'Confirmed' && req.user.role === 'Mentor') {
            session.status = status;
            if (meetingLink) session.meetingLink = meetingLink;
        } 
        // Both can mark as completed or cancelled
        else if (status === 'Completed' || status === 'Cancelled') {
            session.status = status;
        }

        await session.save();

        if (status === 'Confirmed') {
            const mentorUser = await User.findById(session.mentor);
            await Notification.create({
                user: session.mentee,
                message: `Your session was confirmed by ${mentorUser.firstName} ${mentorUser.lastName}! Meeting link has been added.`,
                type: 'success'
            });
        }

        res.status(200).json({ message: 'Session updated successfully.', session });
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ message: 'Server error while updating session.' });
    }
};

module.exports = {
    createSession,
    getSessions,
    updateSession
};
