const Test = require('../models/Test');
const TestSubmission = require('../models/TestSubmission');
const ConnectionRequest = require('../models/ConnectionRequest');
const mongoose = require('mongoose');

exports.createTest = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { title, description, durationMins, dueDate, questions } = req.body;

        const connection = await ConnectionRequest.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection not found' });
        }

        const test = await Test.create({
            connection: connectionId,
            title,
            description,
            durationMins,
            dueDate,
            questions
        });

        res.status(201).json({ success: true, test });
    } catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getTests = async (req, res) => {
    try {
        const { connectionId } = req.params;
        
        const tests = await Test.find({ connection: connectionId }).sort('-createdAt');
        const submissions = await TestSubmission.find({ connection: connectionId });

        // Merge submissions into tests for easy frontend parsing
        const testsWithSubmissions = tests.map(test => {
            const testObj = test.toObject();
            testObj.submission = submissions.find(sub => sub.test.toString() === test._id.toString());
            return testObj;
        });

        res.status(200).json({ success: true, tests: testsWithSubmissions });
    } catch (error) {
        console.error('Get tests error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.submitTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { connectionId, answers } = req.body;

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        const formattedAnswers = answers.map(ans => {
            let isCorrect = null;
            const question = test.questions.id(ans.questionId);
            if (question && question.questionType === 'mcq') {
                isCorrect = question.correctAnswer === ans.answerText;
            }
            return {
                questionId: ans.questionId,
                answerText: ans.answerText,
                isCorrect
            };
        });

        const submission = await TestSubmission.create({
            test: testId,
            mentee: req.user.userId,
            connection: connectionId,
            answers: formattedAnswers,
            status: 'submitted'
        });

        res.status(201).json({ success: true, submission });
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.gradeTest = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { score, feedback } = req.body;

        const submission = await TestSubmission.findByIdAndUpdate(
            submissionId,
            { score, feedback, status: 'graded' },
            { new: true }
        );

        res.status(200).json({ success: true, submission });
    } catch (error) {
        console.error('Grade test error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
