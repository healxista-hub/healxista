import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const portsToTest = [
    { port: 465, secure: true },
    { port: 587, secure: false },
    { port: 25, secure: false },
    { port: 80, secure: false },
    { port: 3535, secure: false }
];

async function testPorts() {
    console.log("Starting SMTP Port Diagnostics for GoDaddy...");
    console.log(`Using email: ${process.env.SMTP_USER}\n`);

    for (const config of portsToTest) {
        console.log(`=========================================`);
        console.log(`Testing Port: ${config.port} (Secure: ${config.secure})`);
        
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
            port: config.port,
            secure: config.secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
            tls: {
                rejectUnauthorized: false
            }
        });

        try {
            await transporter.verify();
            console.log(`✅ SUCCESS! Port ${config.port} is OPEN and successfully authenticated!`);
            console.log(`👉 You should set SMTP_PORT=${config.port} in your server's .env file.`);
            // Once we find a working port, we can stop testing
            break; 
        } catch (error) {
            console.log(`❌ FAILED on Port ${config.port}`);
            if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
                console.log(`   Reason: Blocked by firewall/cloud provider (${error.code})`);
            } else {
                console.log(`   Reason: ${error.message}`);
            }
        }
        console.log(`\n`);
    }
    
    console.log(`=========================================`);
    console.log("Diagnostic complete.");
}

testPorts();
