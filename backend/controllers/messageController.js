const Message           = require('../models/Message');
const ConnectionRequest = require('../models/ConnectionRequest');

async function verifyParticipant(connectionId, userId) {
    const connection = await ConnectionRequest.findById(connectionId);
    if (!connection) return { error: 'Connection not found', status: 404 };
    if (connection.status !== 'accepted') return { error: 'Connection is not active', status: 400 };

    const isParticipant =
        connection.mentee.toString() === userId ||
        connection.mentor.toString() === userId;

    if (!isParticipant) return { error: 'Access denied', status: 403 };
    return { connection };
}

exports.getMessages = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userId           = req.user.userId;

        const check = await verifyParticipant(connectionId, userId);
        if (check.error) {
            return res.status(check.status).json({ success: false, message: check.error });
        }

        const messages = await Message.find({ connection: connectionId })
            .populate('sender', 'firstName lastName')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, messages });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { text }         = req.body;
        const userId           = req.user.userId;

        if (!text && !req.file) {
            return res.status(400).json({ success: false, message: 'Message text or file is required' });
        }

        const check = await verifyParticipant(connectionId, userId);
        if (check.error) {
            return res.status(check.status).json({ success: false, message: check.error });
        }

        let attachment = undefined;
        if (req.file) {
            const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            let fileType = 'document';
            if (req.file.mimetype.startsWith('image/')) fileType = 'image';
            else if (req.file.mimetype.startsWith('video/')) fileType = 'video';

            attachment = {
                url: fileUrl,
                type: fileType,
                name: req.file.originalname
            };
        }

        const messageData = {
            connection: connectionId,
            sender:     userId,
        };
        if (text && text.trim()) messageData.text = text.trim();
        if (attachment) messageData.attachment = attachment;

        const message = await Message.create(messageData);

        const populated = await message.populate('sender', 'firstName lastName');

        res.status(201).json({ success: true, message: populated });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
};
