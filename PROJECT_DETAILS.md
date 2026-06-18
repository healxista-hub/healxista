# Healxista - Comprehensive Project Details

## 1. Project Overview
**Healxista** is an all-in-one, multi-role healthcare and wellness platform designed to bridge the gap between patients and various healthcare service providers. The platform seamlessly integrates doctors, pharmacies, ambulances, laboratories, physiotherapy centers, old age homes, and home care services into a unified ecosystem. It features real-time tracking, secure communications, role-specific dashboards, and a centralized health record system.

## 2. Technology Stack

### Frontend
The frontend is a modern Single Page Application (SPA) providing a highly interactive and responsive user experience.
- **Framework:** React 19, Vite
- **Styling:** Tailwind CSS, Framer Motion (for animations), Radix UI (for accessible components)
- **Routing:** React Router DOM
- **Maps & Real-time Tracking:** Leaflet, React-Leaflet
- **Data Visualization:** Recharts
- **Icons & UI Feedback:** Lucide React, Sonner (for toast notifications)
- **State/Context Management:** React Context API (Auth, Socket, ChatCall contexts)

### Backend
The backend serves as a robust RESTful API with real-time socket communication capabilities.
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (using `pg` library)
- **Real-time Communication:** Socket.io
- **Authentication:** JSON Web Tokens (JWT), bcryptjs (password hashing)
- **File Uploads:** Multer (handling document and profile picture uploads)
- **Security & Optimization:** Helmet, express-rate-limit, cors, compression

## 3. User Roles & Dashboards
The platform is built on a highly granular role-based access control (RBAC) system. Each role has a dedicated portal and dashboard:

1. **User / Patient:** Can search for services, book appointments, request ambulances, order medicines, and manage their personal health documents.
2. **Doctor:** Can manage patient appointments, view medical history, update settings, and manage availability.
3. **Driver (Ambulance):** Features real-time location sharing, ride requests, and ambulance fleet management.
4. **Medicine Store (Pharmacy):** Can manage medicine inventory, track orders, and handle deliveries.
5. **Physiotherapy:** Can manage therapy sessions, patient progress, and service schedules.
6. **Old Age Home:** Handles resident management, capacity tracking, and booking inquiries.
7. **Lab Test:** Manages diagnostic test appointments, patient records, and home sample collection.
8. **Home Care:** Manages caregivers, patient appointments, and home nursing services.
9. **Admin / Super Admin:** Oversees the entire platform, manages all entities, reviews activity logs, handles quick bookings, and configures global settings.

## 4. Key Features

- **Real-Time Location & Maps:** Integrated with Leaflet and Socket.io, allowing patients to track ambulances in real-time and drivers to share their live locations.
- **Centralized Document Management:** Secure upload, storage, and sharing of medical records, prescriptions, and lab reports between patients and providers.
- **Unified Booking System:** A central bookings architecture that handles various types of service requests (rides, appointments, inquiries) complete with payment status tracking.
- **Communication Module:** Real-time chat and potentially voice/video calls (via ChatCallContext) enabling secure provider-patient interactions.
- **Inventory & E-commerce:** Dedicated modules for medicine stores to track stock levels, base prices, and manage user orders.
- **Comprehensive Activity Logging:** Auditable tracking of actions performed across the system to ensure security and accountability.

## 5. Database Architecture Highlights
The PostgreSQL database uses a relational schema designed for scalability and data integrity:
- **Core Entities:** `accounts`, `profiles`, `roles`, `user_roles`, `addresses`
- **Providers:** A central `service_providers` table branches out into specialized tables (`doctors`, `drivers`, `medicine_stores`, `lab_tests`, etc.) to store domain-specific data while maintaining referential integrity.
- **Transactions:** `bookings`, `payments`, `quick_bookings`
- **Social / Interactive:** `messages`, `reviews`, `notifications`, `documents`, `document_shares`

## 6. Project Structure Overview
- `/backend/`: Contains all server-side logic including API routes (`/routes`), database configurations (`db.js`, `schema.sql`), middleware for auth/validation (`/middleware`), and file storage (`/uploads`).
- `/frontend/`: Contains the Vite+React application. The `src` directory is well-organized into:
  - `/pages/public/`: Landing pages, public service info, and authentication screens.
  - `/pages/protected/`: Dashboards and management screens restricted by role.
  - `/components/` & `/layout/`: Reusable UI elements, protected route wrappers, and structural layouts (Website vs. Dashboard).
  - `/context/`: Global state providers (AuthContext, SocketContext, etc.).
  - `/services/` & `/utils/`: API call wrappers and helper functions.

## 7. Development & Deployment
- The project is designed to be run concurrently in development mode using `npm run dev:full` from the frontend, which spins up both the Vite dev server and the Node.js backend.
- Environment variables (`.env`) are used strictly to manage database connections, JWT secrets, and port configurations across different deployment environments.
