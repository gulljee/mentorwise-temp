const Task = require('../models/Task');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to verify participant
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

// GET /api/tasks/:connectionId
exports.getTasks = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userId = req.user.userId;

        const check = await verifyParticipant(connectionId, userId);
        if (check.error) return res.status(check.status).json({ success: false, message: check.error });

        const tasks = await Task.find({ connection: connectionId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Error fetching tasks' });
    }
};

// POST /api/tasks/:connectionId
exports.createTask = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { title, description, dueDate } = req.body;
        const userId = req.user.userId;

        const check = await verifyParticipant(connectionId, userId);
        if (check.error) return res.status(check.status).json({ success: false, message: check.error });

        // Ensure user is mentor
        if (check.connection.mentor.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Only mentors can create tasks' });
        }

        if (!title) return res.status(400).json({ success: false, message: 'Task title is required' });

        let mentorAttachment = undefined;
        if (req.file) {
            const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            let fileType = 'document';
            if (req.file.mimetype.startsWith('image/')) fileType = 'image';
            else if (req.file.mimetype.startsWith('video/')) fileType = 'video';

            mentorAttachment = {
                url: fileUrl,
                type: fileType,
                name: req.file.originalname
            };
        }

        const taskData = {
            connection: connectionId,
            title,
            description,
            dueDate: dueDate || undefined,
            mentorAttachment
        };

        const task = await Task.create(taskData);

        const mentorUser = await User.findById(userId);
        await Notification.create({
            user: check.connection.mentee,
            message: `New task assigned: "${title}" by ${mentorUser.firstName} ${mentorUser.lastName}`,
            type: 'info'
        });

        res.status(201).json({ success: true, task });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Error creating task' });
    }
};

// PUT /api/tasks/:id/submit
exports.submitTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user.userId;

        const task = await Task.findById(id).populate('connection');
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (task.connection.mentee.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Only mentees can submit work' });
        }

        let attachment = undefined;
        if (req.file) {
            const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            let fileType = 'document';
            if (req.file.mimetype.startsWith('image/')) fileType = 'image';
            else if (req.file.mimetype.startsWith('video/')) fileType = 'video';

            attachment = { url: fileUrl, type: fileType, name: req.file.originalname };
        }

        task.submission = {
            text: text || '',
            attachment,
            submittedAt: new Date()
        };
        task.status = 'submitted';

        await task.save();

        const menteeUser = await User.findById(userId);
        await Notification.create({
            user: task.connection.mentor,
            message: `${menteeUser.firstName} ${menteeUser.lastName} submitted their work for task: "${task.title}"`,
            type: 'success'
        });

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error('Error submitting task:', error);
        res.status(500).json({ success: false, message: 'Error submitting task' });
    }
};

// PUT /api/tasks/:id/grade
exports.gradeTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { grade, feedback } = req.body;
        const userId = req.user.userId;

        const task = await Task.findById(id).populate('connection');
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (task.connection.mentor.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Only mentors can grade tasks' });
        }

        task.grade = grade || task.grade;
        task.feedback = feedback || task.feedback;
        task.status = 'graded';

        await task.save();

        const mentorUser = await User.findById(userId);
        await Notification.create({
            user: task.connection.mentee,
            message: `Your task "${task.title}" has been graded by ${mentorUser.firstName} ${mentorUser.lastName}`,
            type: 'info'
        });

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error('Error grading task:', error);
        res.status(500).json({ success: false, message: 'Error grading task' });
    }
};
