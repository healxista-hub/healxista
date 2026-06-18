import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';

// Global Exception and Rejection Hardening
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception thrown:', err);
});
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import publicRoutes from './routes/public.js';
import bookingRoutes from './routes/bookings.js';
import inventoryRoutes from './routes/inventory.js';
import supportRoutes from './routes/support.js';
import activityRoutes from './routes/activity.js';
import quickBookingRoutes from './routes/quick_bookings.js';
import recordsRoutes from './routes/records.js';
import chatRoutes from './routes/chat.js';
import documentRoutes from './routes/documents.js';
import residentsRoutes from './routes/residents.js';
import superadminRoutes from './routes/superadmin.js';
import db from './db.js';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
    console.error("❌ FATAL ERROR: JWT_SECRET environment variable is missing. Cannot start server securely.");
    process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
// or individual vars
const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

const app = express();
const PORT = process.env.PORT || 5050;

// Trust Proxy for rate limiter behind Cloudflare/Railway
app.set('trust proxy', 1);

// Security Middleware
app.use(compression());
app.use(helmet());
app.use(cookieParser());

// Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Increased limit: allow 2000 requests per 15 mins to support local network clinic setups and 30s polling
    message: { message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Local network / Private IP matching utility (Class A/B/C private network segments)
const isLocalNetwork = (origin) => {
    if (!origin) return false;
    // Matches localhost, 127.0.0.1, [::1], 10.x.x.x, 172.16-31.x.x, 192.168.x.x with any port (supports http and https)
    const localRegex = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/;
    return localRegex.test(origin);
};

// Strict CORS Strategy
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://healxista.com',
    'https://www.healxista.com',
    'http://healxista.com',
    'http://www.healxista.com',
    'http://103.127.28.169',
    'https://103.127.28.169',
    'https://healxista-production.up.railway.app', // User's reported URL
    'https://hebackend-production.up.railway.app', // Old reference
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://localhost:5173',
    'https://localhost:5174',
    'https://127.0.0.1:5173',
    'https://127.0.0.1:5174',
    'http://[::1]:5173',
    'http://[::1]:5174',
    'https://[::1]:5173',
    'https://[::1]:5174'
].map(url => url ? url.trim().toLowerCase().replace(/\/$/, '') : '').filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow same-origin requests (origin is undefined)
        if (!origin) return callback(null, true);

        const reqOrigin = origin.trim().toLowerCase().replace(/\/$/, '');

        // Check if origin is in the allowed list
        const isAllowed = allowedOrigins.some(ao => 
            ao === reqOrigin || 
            (ao.startsWith('http') && reqOrigin.startsWith(ao))
        );

        const isIPAddress = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(reqOrigin);

        if (
            isAllowed ||
            isLocalNetwork(reqOrigin) ||
            reqOrigin.endsWith('.trycloudflare.com') ||
            isIPAddress
        ) {
            callback(null, true);
        } else {
            console.warn(`CORS Rejected: ${origin}`);
            callback(new Error(`Not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// Serve Static UI Assets (like uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend Static Files (Production)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const roleFolders = ['patients', 'doctors', 'drivers', 'pharmacies', 'physiotherapists', 'old_age_homes', 'lab_tests', 'admins', 'documents', 'quick_bookings', 'residents'];

[uploadsDir, ...roleFolders.map(rf => path.join(uploadsDir, rf))].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Prevent caching for all API routes so data loads freshly every time
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/quick-bookings', quickBookingRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/residents', residentsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/superadmin', superadminRoutes);

app.get('/api-status', (req, res) => {
    res.send('Healxista API is running...');
});

// Catch-all route for SPA (MUST be after API routes)
app.get('*', (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend build not found. Please run "npm run build" in the frontend directory.');
    }
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            const reqOrigin = origin.trim().toLowerCase().replace(/\/$/, '');
            const isAllowed = allowedOrigins.some(ao => 
                ao === reqOrigin || 
                (ao.startsWith('http') && reqOrigin.startsWith(ao))
            );

            const isIPAddress = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(reqOrigin);

            if (
                isAllowed ||
                isLocalNetwork(reqOrigin) ||
                reqOrigin.endsWith('.trycloudflare.com') ||
                isIPAddress
            ) {
                callback(null, true);
            } else {
                console.warn(`Socket CORS Rejected: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ["GET", "POST"]
    }
});

// Attach io to the Express app so routes can emit events
app.set('io', io);

// Socket Logic
io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join Room based on Role
    socket.on('join_role', (role) => {
        const normalizedRole = String(role).toLowerCase();
        socket.join(normalizedRole);
        console.log(`Socket ${socket.id} joined room: ${normalizedRole}`);
    });

    // Join Room based on Personal User Account ID
    socket.on('join_user', (userId) => {
        if (!userId) return;
        const userRoom = `user_${userId}`;
        socket.join(userRoom);
        console.log(`Socket ${socket.id} joined personal room: ${userRoom}`);
    });

    // Join specific chat room for a booking
    socket.on('join_chat', (bookingId) => {
        const roomName = `booking_${bookingId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined chat room: ${roomName}`);
    });

    // Leave a specific chat room
    socket.on('leave_chat', (bookingId) => {
        const roomName = `booking_${bookingId}`;
        socket.leave(roomName);
        console.log(`Socket ${socket.id} left chat room: ${roomName}`);
    });

    // Helper to query booking participants securely from DB
    const getBookingParticipants = async (bookingId) => {
        try {
            const cleanBookingId = Number(bookingId);
            if (isNaN(cleanBookingId)) return null;

            const bRes = await db.query(`
                SELECT b.user_id, sp.account_id as provider_account_id 
                FROM bookings b
                LEFT JOIN service_providers sp ON b.provider_id = sp.provider_id
                WHERE b.booking_id = $1
            `, [cleanBookingId]);
            if (bRes.rows.length > 0) {
                return {
                    userId: bRes.rows[0].user_id,
                    providerAccountId: bRes.rows[0].provider_account_id
                };
            }
        } catch (err) {
            console.error("Failed to query booking participants:", err);
        }
        return null;
    };

    // --- Video Call / Consultation Signaling ---
    socket.on('initiate_call', async (data) => {
        try {
            if (!data || !data.bookingId) return;
            const roomName = `booking_${data.bookingId}`;
            socket.to(roomName).emit('incoming_call', data);
            
            // Push directly to targeted participants' personal rooms
            const participants = await getBookingParticipants(data.bookingId);
            if (participants) {
                if (participants.userId) socket.to(`user_${participants.userId}`).emit('incoming_call', data);
                if (participants.providerAccountId) socket.to(`user_${participants.providerAccountId}`).emit('incoming_call', data);
            }
            console.log(`📞 Call initiated for booking ${data.bookingId} by ${data.callerName}`);
        } catch (err) {
            console.error("Error in initiate_call handler:", err);
        }
    });

    socket.on('decline_call', async (data) => {
        try {
            if (!data || !data.bookingId) return;
            const roomName = `booking_${data.bookingId}`;
            socket.to(roomName).emit('call_declined', data);

            const participants = await getBookingParticipants(data.bookingId);
            if (participants) {
                if (participants.userId) socket.to(`user_${participants.userId}`).emit('call_declined', data);
                if (participants.providerAccountId) socket.to(`user_${participants.providerAccountId}`).emit('call_declined', data);
            }
            console.log(`❌ Call declined for booking ${data.bookingId}`);
        } catch (err) {
            console.error("Error in decline_call handler:", err);
        }
    });

    socket.on('cancel_call', async (data) => {
        try {
            if (!data || !data.bookingId) return;
            const roomName = `booking_${data.bookingId}`;
            socket.to(roomName).emit('call_cancelled', data);

            const participants = await getBookingParticipants(data.bookingId);
            if (participants) {
                if (participants.userId) socket.to(`user_${participants.userId}`).emit('call_cancelled', data);
                if (participants.providerAccountId) socket.to(`user_${participants.providerAccountId}`).emit('call_cancelled', data);
            }
            console.log(`⚠️ Call cancelled for booking ${data.bookingId}`);
        } catch (err) {
            console.error("Error in cancel_call handler:", err);
        }
    });

    socket.on('accept_call', async (data) => {
        try {
            if (!data || !data.bookingId) return;
            const roomName = `booking_${data.bookingId}`;
            socket.to(roomName).emit('call_accepted', data);

            const participants = await getBookingParticipants(data.bookingId);
            if (participants) {
                if (participants.userId) socket.to(`user_${participants.userId}`).emit('call_accepted', data);
                if (participants.providerAccountId) socket.to(`user_${participants.providerAccountId}`).emit('call_accepted', data);
            }
            console.log(`✅ Call accepted for booking ${data.bookingId}`);
        } catch (err) {
            console.error("Error in accept_call handler:", err);
        }
    });

    socket.on('webrtc_signal', (data) => {
        if (!data || !data.bookingId) return;
        // High-frequency ICE/SDP handshakes are routed directly over fast memory-mapped socket rooms
        const roomName = `booking_${data.bookingId}`;
        socket.to(roomName).emit('webrtc_signal', data);
    });

    socket.on('end_call', async (data) => {
        try {
            if (!data || !data.bookingId) return;
            const roomName = `booking_${data.bookingId}`;
            socket.to(roomName).emit('call_ended', data);

            const participants = await getBookingParticipants(data.bookingId);
            if (participants) {
                if (participants.userId) socket.to(`user_${participants.userId}`).emit('call_ended', data);
                if (participants.providerAccountId) socket.to(`user_${participants.providerAccountId}`).emit('call_ended', data);
            }
            console.log(`🏁 Call ended for booking ${data.bookingId}`);
        } catch (err) {
            console.error("Error in end_call handler:", err);
        }
    });

    // Subscribe to specific booking location tracking rooms
    socket.on('join_location_tracking', (activeBookingIds) => {
        if (!activeBookingIds) return;
        const ids = Array.isArray(activeBookingIds) ? activeBookingIds : [activeBookingIds];
        ids.forEach(id => {
            const locRoom = `loc_booking_${id}`;
            socket.join(locRoom);
            console.log(`Socket ${socket.id} joined location tracking for booking ${id}`);
        });
    });

    // Targeted Location Update
    socket.on('update_location', (data) => {
        // data: { id, position: [lat, lng], name, status, role, activeBookings: [id1, id2...] }
        const role = String(data.role).toLowerCase();

        // 1. Always send to Admin room (standardized to lowercase)
        socket.to('admin').emit('location_update', data);

        // 2. If it's an available ambulance, broadcast to all users looking for ambulances
        if (role === 'driver' && (data.status === 'Available' || data.status === 'Online')) {
            socket.to('patient').emit('location_update', data);
            socket.to('user').emit('location_update', data);
            socket.to('available_drivers').emit('location_update', data);
        }

        // 3. Send to specific booking rooms so user/ambulance can see each other
        if (data.activeBookings && Array.isArray(data.activeBookings)) {
            data.activeBookings.forEach(id => {
                socket.to(`loc_booking_${id}`).emit('location_update', data);
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(`❌ Global Error:`, err.message);
    const isDev = process.env.NODE_ENV === 'development';
    
    // Handle Multer File Size Limit
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File is too large. Maximum allowed size is 2MB.' });
    }

    res.status(err.status || 500).json({ 
        message: err.message || 'Internal Server Error',
        ...(isDev && { stack: err.stack })
    });
});

// Start the server
const startServer = async () => {
    try {
        // Initialize Database & Schema
        await db.initDB();
        
        // Run Migrations (supplemental tables)
        console.log('🚀 Running supplemental migrations...');
        const { runMigrations } = await import('./scripts/migrate.js');
        await runMigrations();

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Healxista Server is running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📂 Frontend Static Path: ${frontendPath}`);
            console.log(`🔍 Static Path Exists: ${fs.existsSync(frontendPath)}`);
            console.log(`🔒 Security: Helmet active, Dynamic CORS enabled.`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please free the port or use a different one.`);
        process.exit(1);
    } else {
        throw err;
    }
});

// Graceful Shutdown
const shutdown = () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed. Port released.');
        process.exit(0);
    });
    // Force close if it takes too long
    setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
