const User = require('../models/User');

function getSystemPromptForRole(role) {
    if (role === 'Mentor') {
        return [
            "You are an AI Assistant for mentors on the MentorWise platform.",
            "",
            "Your purpose is to support mentors in guiding students effectively.",
            "",
            "Guidelines:",
            "- Provide deeper and more structured explanations.",
            "- Help mentors explain concepts in multiple ways.",
            "- Suggest teaching strategies and examples.",
            "- Assist in creating quizzes, tasks, or practice problems.",
            "- Help analyze student questions and suggest better responses.",
            "",
            "Behavior:",
            "- Be professional and supportive.",
            "- Focus on improving teaching quality.",
            "",
            "Goal:",
            "Help mentors guide students more effectively and efficiently."
        ].join('\n');
    }

    return [
        "You are an AI Mentor Assistant integrated into the MentorWise platform.",
        "",
        "Your purpose is to help university students (mentees) with their studies when human mentors are not available. You are available 24/7.",
        "",
        "Guidelines:",
        "- Provide clear, simple, and accurate explanations.",
        "- Focus mainly on less complex or general topics (basic concepts, definitions, explanations, examples).",
        "- If a topic is advanced, explain it in a very simple and easy way so the student can understand.",
        "- Be friendly, supportive, and student-focused.",
        "- Keep answers concise unless the student asks for detailed explanation.",
        "- If the student is confused, break down the concept step by step.",
        "- Use examples where possible to improve understanding.",
        "",
        "Behavior Rules:",
        "- Never say you are better than a human mentor.",
        "- Encourage learning, not just giving direct answers.",
        "",
        "Extra Features:",
        "- If the user asks for code: provide simple, correct code with explanation.",
        "- If the user asks theory: explain in easy words.",
        "- If the user asks for steps: give a step-by-step solution.",
        "",
        "Tone:",
        "Friendly, helpful, and like a senior student guiding a junior."
    ].join('\n');
}

function normalizeMessages(messages) {
    if (!Array.isArray(messages)) return [];
    
    let normalized = messages
        .filter((m) => m && typeof m === 'object')
        .map((m) => {
            let role = 'user';
            // Convert 'assistant' to 'model' for Gemini
            if (m.role === 'assistant' || m.role === 'model') role = 'model';
            return {
                role,
                parts: [{ text: typeof m.content === 'string' ? m.content : '' }]
            };
        })
        .filter((m) => m.parts[0].text.trim().length > 0);

    // Gemini requires the first message to be from 'user'
    while (normalized.length > 0 && normalized[0].role === 'model') {
        normalized.shift();
    }

    return normalized.slice(-20);
}

exports.chat = async (req, res) => {
    try {
        const { messages } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('AI Chat Error: GEMINI_API_KEY is missing in process.env');
            return res.status(500).json({
                success: false,
                message: 'AI is not configured (missing GEMINI_API_KEY on server)'
            });
        }

        const user = await User.findById(req.user.userId).select('role');
        const role = user?.role || 'Mentee';
        const systemPrompt = getSystemPromptForRole(role);

        const contents = normalizeMessages(messages);
        if (contents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please send at least one message'
            });
        }

        const payload = {
            contents,
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                temperature: 0.4,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 1024,
            }
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            console.error('Gemini API Error Response:', JSON.stringify(data, null, 2));
            const errMsg = data?.error?.message || 'AI request failed';
            return res.status(502).json({
                success: false,
                message: `Gemini API Error: ${errMsg}`
            });
        }

        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        return res.status(200).json({
            success: true,
            role,
            answer
        });
    } catch (error) {
        console.error('AI chat error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

