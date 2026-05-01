const Material = require('../models/Material');

exports.uploadMaterial = async (req, res) => {
    try {
        const { title, subject } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        if (!title || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title and subject'
            });
        }

        const material = await Material.create({
            title,
            subject,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            uploadedBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Material uploaded successfully',
            data: material
        });

    } catch (error) {
        console.error('Upload material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.getMaterials = async (req, res) => {
    try {
        const { subject } = req.query;
        let query = {};
        
        if (subject && subject !== 'All') {
            query.subject = subject;
        }

        const materials = await Material.find(query)
            .populate('uploadedBy', 'firstName lastName role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: materials.length,
            data: materials
        });

    } catch (error) {
        console.error('Get materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};
