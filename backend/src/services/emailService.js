import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter
// For development, we use Ethereal if no real SMTP credentials are provided
const createTransporter = async () => {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Use Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        console.log('📧 Using Ethereal Email for testing');
        console.log(`   User: ${testAccount.user}`);
        console.log(`   Pass: ${testAccount.pass}`);

        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

let transporter = null;

export const sendWelcomeEmail = async (email, role, tempPassword) => {
    try {
        if (!transporter) {
            transporter = await createTransporter();
        }

        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const info = await transporter.sendMail({
            from: '"Beautex College" <admin@beautex.edu>',
            to: email,
            subject: 'Welcome to Beautex College - Your Login Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a154b;">Welcome to Beautex College</h2>
                    <p>Hello,</p>
                    <p>Your account has been created successfully. You can now access the ${role} portal.</p>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 10px 0 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                    </div>
                    <p>Please log in and change your password immediately.</p>
                    <a href="${loginUrl}" style="display: inline-block; background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Portal</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this account, please ignore this email.</p>
                </div>
            `,
        });

        console.log(`📧 Email sent to ${email}: ${info.messageId}`);
        // Preview only available when using Ethereal account
        if (nodemailer.getTestMessageUrl(info)) {
            console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        if (!transporter) {
            transporter = await createTransporter();
        }

        const info = await transporter.sendMail({
            from: '"Beautex College" <admin@beautex.edu>',
            to: email,
            subject: 'Reset Your Password - Beautex College',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a154b;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: #4a154b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #4a154b; word-break: break-all;">${resetUrl}</a>
                    </p>
                </div>
            `,
        });

        console.log(`📧 Password reset email sent to ${email}: ${info.messageId}`);
        if (nodemailer.getTestMessageUrl(info)) {
            console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return true;
    } catch (error) {
        console.error('❌ Failed to send password reset email:', error);
        return false;
    }
};

