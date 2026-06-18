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
