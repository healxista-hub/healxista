import nodemailer from 'nodemailer';

/**
 * Creates a reusable transporter object using the default SMTP transport.
 * You should configure these environment variables in your .env file.
 */
const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Sends a password reset email to the user.
 * 
 * @param {string} to - The recipient's email address
 * @param {string} resetUrl - The link containing the reset token
 */
export const sendPasswordResetEmail = async (to, resetUrl) => {
    const transporter = getTransporter();

    const mailOptions = {
        from: `"Healxista Support" <${process.env.SMTP_USER || 'noreply@healxista.com'}>`,
        to: to,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2b6cb0; text-align: center;">Healxista Password Reset</h2>
                <p style="font-size: 16px; color: #333;">Hello,</p>
                <p style="font-size: 16px; color: #333;">You requested to reset your password. Click the button below to set a new password. This link is valid for 1 hour.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2b6cb0; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Reset Password</a>
                </div>
                <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">&copy; ${new Date().getFullYear()} Healxista. All rights reserved.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

/**
 * Sends a welcome email to a newly registered user or provider.
 * 
 * @param {string} to - The recipient's email address
 * @param {string} name - The recipient's name
 * @param {string} role - The recipient's role
 */
export const sendWelcomeEmail = async (to, name, role) => {
    const transporter = getTransporter();

    let roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
    if (role === 'medicine') roleDisplay = 'Medicine Store Partner';
    if (role === 'homecare') roleDisplay = 'Home Care Provider';
    if (role === 'oldage') roleDisplay = 'Old Age Home Partner';

    const mailOptions = {
        from: `"Healxista Welcome" <${process.env.SMTP_USER || 'noreply@healxista.com'}>`,
        to: to,
        subject: 'Welcome to Healxista!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2b6cb0; text-align: center;">Welcome to Healxista!</h2>
                <p style="font-size: 16px; color: #333;">Hello ${name},</p>
                <p style="font-size: 16px; color: #333;">Thank you for registering on Healxista as a <strong>${roleDisplay}</strong>!</p>
                <p style="font-size: 16px; color: #333;">We are thrilled to have you join our digital healthcare platform. You can now log in to your dashboard to manage your profile and services.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #2b6cb0; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Log in to your Account</a>
                </div>
                <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">&copy; ${new Date().getFullYear()} Healxista. All rights reserved.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

/**
 * Sends a registration OTP to the user.
 * 
 * @param {string} to - The recipient's email address
 * @param {string} otp - The 6-digit OTP
 */
export const sendRegistrationOtp = async (to, otp) => {
    const transporter = getTransporter();

    const mailOptions = {
        from: `"Healxista Verification" <${process.env.SMTP_USER || 'noreply@healxista.com'}>`,
        to: to,
        subject: 'Your Healxista Registration OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2b6cb0; text-align: center;">Verify Your Email</h2>
                <p style="font-size: 16px; color: #333;">Hello,</p>
                <p style="font-size: 16px; color: #333;">Thank you for starting your registration with Healxista. Please use the following One-Time Password (OTP) to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="background-color: #f4f4f4; color: #2b6cb0; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; display: inline-block; letter-spacing: 5px;">${otp}</span>
                </div>
                <p style="font-size: 16px; color: #333;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
                <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">&copy; ${new Date().getFullYear()} Healxista. All rights reserved.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Registration OTP sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending registration OTP:', error);
        return false;
    }
};
