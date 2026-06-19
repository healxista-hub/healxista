import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testMail() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        debug: true,
        logger: true
    });

    try {
        console.log("Sending test email...");
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: 'thisisafakeemailthatdoesnotexist12345@google.com',
            subject: 'Test',
            text: 'Test message'
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Send error:", error);
    }
}

testMail();
