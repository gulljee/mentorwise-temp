// Email service for sending password reset emails using Nodemailer and Gmail

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `MentorWise <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your MentorWise Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 30px;
                        border-radius: 10px;
                        color: white;
                    }
                    .content {
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        margin-top: 20px;
                        color: #333;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #999;
                        text-align: center;
                    }
                    .warning {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 10px;
                        margin: 15px 0;
                        color: #856404;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 style="margin: 0;">🔐 MentorWise</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Password Reset Request</p>
                </div>
                
                <div class="content">
                    <h2>Hi there,</h2>
                    <p>You requested to reset your password for your MentorWise account.</p>
                    
                    <p>Click the button below to reset your password:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                    </div>
                    
                    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                    
                    <p>Thanks,<br><strong>The MentorWise Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>&copy; ${new Date().getFullYear()} MentorWise. All rights reserved.</p>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

const sendOtpEmail = async (email, otpCode) => {
    const mailOptions = {
        from: `MentorWise <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your MentorWise Verification Code',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 30px;
                        border-radius: 10px;
                        color: white;
                    }
                    .content {
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        margin-top: 20px;
                        color: #333;
                    }
                    .otp-code {
                        display: inline-block;
                        padding: 15px 30px;
                        background: #f8f9fa;
                        border: 2px dashed #667eea;
                        color: #667eea;
                        font-size: 28px;
                        letter-spacing: 5px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #999;
                        text-align: center;
                    }
                    .warning {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 10px;
                        margin: 15px 0;
                        color: #856404;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 style="margin: 0;">🔐 MentorWise</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Verification Code</p>
                </div>
                
                <div class="content">
                    <h2>Hello,</h2>
                    <p>Here is your verification code to access your MentorWise account. Please enter this code to securely confirm your identity.</p>
                    
                    <div style="text-align: center;">
                        <div class="otp-code">${otpCode}</div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This code will expire in 15 minutes for security reasons.
                    </div>
                    
                    <p>If you didn't request this code, please ignore this email and make sure your account is secure.</p>
                    
                    <p>Thanks,<br><strong>The MentorWise Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>&copy; ${new Date().getFullYear()} MentorWise. All rights reserved.</p>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendOtpEmail
};
