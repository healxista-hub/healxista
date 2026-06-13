import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatCallProvider } from './context/ChatCallContext';
import { HelmetProvider } from 'react-helmet-async';
import Preloader from './components/Preloader';
import { AnimatePresence } from 'framer-motion';

// Public Pages
const Landing = lazy(() => import('./pages/public/Landing'));
const Register = lazy(() => import('./pages/public/Register'));
const ProviderPortal = lazy(() => import('./pages/public/ProviderPortal'));
const About = lazy(() => import('./pages/public/About'));
const Services = lazy(() => import('./pages/public/Services'));
const Contact = lazy(() => import('./pages/public/Contact'));
const NewsUpdates = lazy(() => import('./pages/public/NewsUpdates'));
const Ambulance = lazy(() => import('./pages/public/Ambulance'));
const Doctors = lazy(() => import('./pages/public/Doctors'));
const Medicines = lazy(() => import('./pages/public/Medicines'));
const UserLogin = lazy(() => import('./pages/public/UserLogin'));
const UserRegister = lazy(() => import('./pages/public/UserRegister'));
const DriverLogin = lazy(() => import('./pages/public/DriverLogin'));
const DriverRegister = lazy(() => import('./pages/public/DriverRegister'));
const DoctorLogin = lazy(() => import('./pages/public/DoctorLogin'));
const DoctorRegister = lazy(() => import('./pages/public/DoctorRegister'));
const MedicineStoreLogin = lazy(() => import('./pages/public/MedicineStoreLogin'));
const MedicineStoreRegister = lazy(() => import('./pages/public/MedicineStoreRegister'));
const PhysiotherapyLogin = lazy(() => import('./pages/public/PhysiotherapyLogin'));
const PhysiotherapyRegister = lazy(() => import('./pages/public/PhysiotherapyRegister'));
const OldAgeHomeLogin = lazy(() => import('./pages/public/OldAgeHomeLogin'));
const OldAgeHomeRegister = lazy(() => import('./pages/public/OldAgeHomeRegister'));
const LabTestLogin = lazy(() => import('./pages/public/LabTestLogin'));
const LabTestRegister = lazy(() => import('./pages/public/LabTestRegister'));
const HomeCareLogin = lazy(() => import('./pages/public/HomeCareLogin'));
const HomeCareRegister = lazy(() => import('./pages/public/HomeCareRegister'));
const AdminLogin = lazy(() => import('./pages/public/AdminLogin'));
const AdminRegister = lazy(() => import('./pages/public/AdminRegister'));
const SuperAdminLogin = lazy(() => import('./pages/public/SuperAdminLogin'));
const LabTest = lazy(() => import('./pages/public/LabTest'));
const HomeCare = lazy(() => import('./pages/public/HomeCare'));
const PhysiotherapyPage = lazy(() => import('./pages/public/Physiotherapy'));
const Publication = lazy(() => import('./pages/public/Publication'));
const Careers = lazy(() => import('./pages/public/Careers'));
const Terms = lazy(() => import('./pages/public/Terms'));
const Privacy = lazy(() => import('./pages/public/Privacy'));

// Protected Pages (Dashboards)
const Dashboard = lazy(() => import('./pages/protected/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/protected/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/protected/SuperAdminDashboard'));
const SuperAdminDirectory = lazy(() => import('./pages/protected/SuperAdminDirectory'));
const SuperAdminSettings = lazy(() => import('./pages/protected/SuperAdminSettings'));
const DriverDashboard = lazy(() => import('./pages/protected/DriverDashboard'));
const DoctorDashboard = lazy(() => import('./pages/protected/DoctorDashboard'));
const MedicineStoreDashboard = lazy(() => import('./pages/protected/MedicineStoreDashboard'));
const PhysiotherapyDashboard = lazy(() => import('./pages/protected/PhysiotherapyDashboard'));
const OldAgeHomeDashboard = lazy(() => import('./pages/protected/OldAgeHomeDashboard'));
const LabTestDashboard = lazy(() => import('./pages/protected/LabTestDashboard'));
const HomeCareDashboard = lazy(() => import('./pages/protected/HomeCareDashboard'));
const HomeCareAppointments = lazy(() => import('./pages/protected/HomeCareAppointments'));
const HomeCarePatients = lazy(() => import('./pages/protected/HomeCarePatients'));
const HomeCareSettings = lazy(() => import('./pages/protected/HomeCareSettings'));
const LabTestSettings = lazy(() => import('./pages/protected/LabTestSettings'));
const LabTestAppointments = lazy(() => import('./pages/protected/LabTestAppointments'));
const LabTestPatients = lazy(() => import('./pages/protected/LabTestPatients'));

// Protected Pages (Driver)
const DriverAmbulances = lazy(() => import('./pages/protected/DriverAmbulances'));
const DriverSettings = lazy(() => import('./pages/protected/DriverSettings'));

// Protected Pages (Doctor)
const DoctorAppointments = lazy(() => import('./pages/protected/DoctorAppointments'));
const DoctorPatients = lazy(() => import('./pages/protected/DoctorPatients'));
const DoctorSettings = lazy(() => import('./pages/protected/DoctorSettings'));

// Protected Pages (Medicine Store)
const MedicineInventory = lazy(() => import('./pages/protected/MedicineInventory'));
const MedicineOrders = lazy(() => import('./pages/protected/MedicineOrders'));
const MedicineSettings = lazy(() => import('./pages/protected/MedicineSettings'));

// Protected Pages (Physiotherapy)
const PhysioSessions = lazy(() => import('./pages/protected/PhysioSessions'));
const PhysioPatients = lazy(() => import('./pages/protected/PhysioPatients'));
const PhysioSettings = lazy(() => import('./pages/protected/PhysioSettings'));

// Protected Pages (Old Age Home)
const OldAgeResidents = lazy(() => import('./pages/protected/OldAgeResidents'));
const OldAgeInquiries = lazy(() => import('./pages/protected/OldAgeInquiries'));
const OldAgeSettings = lazy(() => import('./pages/protected/OldAgeSettings'));

// Protected Pages (User Dashboard Actions)
const UserAmbulances = lazy(() => import('./pages/protected/UserAmbulances'));
const UserDoctors = lazy(() => import('./pages/protected/UserDoctors'));
const UserMedicines = lazy(() => import('./pages/protected/UserMedicines'));
const UserPhysiotherapy = lazy(() => import('./pages/protected/UserPhysiotherapy'));
const UserOldAgeHomes = lazy(() => import('./pages/protected/UserOldAgeHomes'));
const UserLabTests = lazy(() => import('./pages/protected/UserLabTests'));
const UserHomeCares = lazy(() => import('./pages/protected/UserHomeCares'));
const UserRecords = lazy(() => import('./pages/protected/UserRecords'));
const UserActivity = lazy(() => import('./pages/protected/UserActivity'));
const UserSettings = lazy(() => import('./pages/protected/UserSettings'));
const UserBookings = lazy(() => import('./pages/protected/UserBookings'));

// Protected Pages (Admin Actions)
const AmbulanceManagement = lazy(() => import('./pages/protected/AmbulanceManagement'));
const PatientRecords = lazy(() => import('./pages/protected/PatientRecords'));
const ActivityLogs = lazy(() => import('./pages/protected/ActivityLogs'));
const Settings = lazy(() => import('./pages/protected/Settings'));
const AdminDoctors = lazy(() => import('./pages/protected/AdminDoctors'));
const AdminMedicines = lazy(() => import('./pages/protected/AdminMedicines'));
const AdminPhysiotherapy = lazy(() => import('./pages/protected/AdminPhysiotherapy'));
const AdminOldAgeHomes = lazy(() => import('./pages/protected/AdminOldAgeHomes'));
const AdminLabTests = lazy(() => import('./pages/protected/AdminLabTests'));
const AdminHomeCares = lazy(() => import('./pages/protected/AdminHomeCares'));
const AdminPatients = lazy(() => import('./pages/protected/AdminPatients'));
const AdminBookings = lazy(() => import('./pages/protected/AdminBookings'));
const AdminContactMessages = lazy(() => import('./pages/protected/AdminContactMessages'));
const AdminQuickBookings = lazy(() => import('./pages/protected/AdminQuickBookings'));
const AdminResidents = lazy(() => import('./pages/protected/AdminResidents'));

// Shared Protected
const Documents = lazy(() => import('./pages/protected/Documents'));

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import DashboardLayout from './layout/DashboardLayout';
import WebsiteLayout from './layout/WebsiteLayout';
import LiveMapComponent from './components/LiveMapComponent';

const LiveMapRouteWrapper = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    const normalizedRole = user.role?.toLowerCase();
    let mode = 'user';
    if (normalizedRole === 'admin' || normalizedRole === 'super admin' || normalizedRole === 'super_admin') mode = 'admin';
    else if (normalizedRole === 'driver') mode = 'driver';
    return <LiveMapComponent viewMode={mode} />;
};

const App = () => {
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('hasSeenPreloader');
  });

  useEffect(() => {
    if (loading) {
      // Simulate loading time
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('hasSeenPreloader', 'true');
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <HelmetProvider>
      <AuthProvider>
        <SocketProvider>
          <ChatCallProvider>
            <Router>
            <Toaster position="top-right" richColors />
            <AnimatePresence mode="wait">
              {loading ? (
                <Preloader key="preloader" isLoading={loading} />
              ) : (
              <div className="min-h-screen bg-background font-sans antialiased">
                <Suspense fallback={<Preloader isLoading={true} />}>
                  <Routes>
                  {/* Public Routes Wrapped in WebsiteLayout */}
                  <Route element={<WebsiteLayout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/news" element={<NewsUpdates />} />
                    <Route path="/publication" element={<Publication />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/ambulance" element={<Ambulance />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/medicines" element={<Medicines />} />

                    {/* Sub-pages */}
                    <Route path="/lab-test" element={<LabTest />} />
                    <Route path="/home-care" element={<HomeCare />} />
                    <Route path="/physiotherapy" element={<PhysiotherapyPage />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                  </Route>

                  {/* Auth & Other Standalone Routes */}
                  <Route path="/login" element={<Navigate to="/login/user" replace />} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/provider-portal" element={<ProviderPortal />} />

                  {/* Role-Specific Login Routes */}
                  <Route path="/login/user" element={<PublicRoute><UserLogin /></PublicRoute>} />
                  <Route path="/login/driver" element={<PublicRoute><DriverLogin /></PublicRoute>} />
                  <Route path="/login/doctor" element={<PublicRoute><DoctorLogin /></PublicRoute>} />
                  <Route path="/login/medicine-store" element={<PublicRoute><MedicineStoreLogin /></PublicRoute>} />
                  <Route path="/login/physiotherapy" element={<PublicRoute><PhysiotherapyLogin /></PublicRoute>} />
                  <Route path="/login/old-age-home" element={<PublicRoute><OldAgeHomeLogin /></PublicRoute>} />
                  <Route path="/login/lab-test" element={<PublicRoute><LabTestLogin /></PublicRoute>} />
                  <Route path="/login/home-care" element={<PublicRoute><HomeCareLogin /></PublicRoute>} />
                  <Route path="/login/admin" element={<PublicRoute><AdminLogin /></PublicRoute>} />
                  <Route path="/login/super-admin" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminLogin /></ProtectedRoute>} />

                  {/* Role-Specific Register Routes */}
                  <Route path="/register/user" element={<PublicRoute><UserRegister /></PublicRoute>} />
                  <Route path="/register/driver" element={<PublicRoute><DriverRegister /></PublicRoute>} />
                  <Route path="/register/doctor" element={<PublicRoute><DoctorRegister /></PublicRoute>} />
                  <Route path="/register/medicine-store" element={<PublicRoute><MedicineStoreRegister /></PublicRoute>} />
                  <Route path="/register/physiotherapy" element={<PublicRoute><PhysiotherapyRegister /></PublicRoute>} />
                  <Route path="/register/old-age-home" element={<PublicRoute><OldAgeHomeRegister /></PublicRoute>} />
                  <Route path="/register/lab-test" element={<PublicRoute><LabTestRegister /></PublicRoute>} />
                  <Route path="/register/home-care" element={<PublicRoute><HomeCareRegister /></PublicRoute>} />
                  <Route path="/register/admin" element={<PublicRoute><AdminRegister /></PublicRoute>} />

                  {/* Protected Dashboard Routes - Wrapped in DashboardLayout */}
                  <Route element={<DashboardLayout />}>
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['user', 'patient']}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/super-admin-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'super_admin']}>
                          <SuperAdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/super-admin/directory"
                      element={
                        <ProtectedRoute allowedRoles={['super_admin', 'super admin']}>
                          <SuperAdminDirectory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/super-admin/settings"
                      element={
                        <ProtectedRoute allowedRoles={['super_admin', 'super admin']}>
                          <SuperAdminSettings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/driver-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['driver']}>
                          <DriverDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                          <DoctorDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/medicine-store-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['medicine_store']}>
                          <MedicineStoreDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/physiotherapy-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['physiotherapy']}>
                          <PhysiotherapyDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/old-age-home-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['old_age_home']}>
                          <OldAgeHomeDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/home-care-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['home_care']}>
                          <HomeCareDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/lab-test-dashboard" element={
                       <ProtectedRoute allowedRoles={['lab_test']}>
                         <LabTestDashboard />
                       </ProtectedRoute>
                     } />
                     <Route path="/lab-test/appointments" element={
                       <ProtectedRoute allowedRoles={['lab_test']}>
                         <LabTestAppointments />
                       </ProtectedRoute>
                     } />
                     <Route path="/lab-test/patients" element={
                       <ProtectedRoute allowedRoles={['lab_test']}>
                         <LabTestPatients />
                       </ProtectedRoute>
                     } />
                     <Route path="/lab-test/settings" element={
                       <ProtectedRoute allowedRoles={['lab_test']}>
                         <LabTestSettings />
                       </ProtectedRoute>
                     } />

                    <Route path="/home-care/appointments" element={
                       <ProtectedRoute allowedRoles={['home_care']}>
                         <HomeCareAppointments />
                       </ProtectedRoute>
                     } />
                     <Route path="/home-care/patients" element={
                       <ProtectedRoute allowedRoles={['home_care']}>
                         <HomeCarePatients />
                       </ProtectedRoute>
                     } />
                     <Route path="/home-care/settings" element={
                       <ProtectedRoute allowedRoles={['home_care']}>
                         <HomeCareSettings />
                       </ProtectedRoute>
                     } />

                    {/* Driver Routes */}
                    <Route path="/driver/ambulances" element={
                      <ProtectedRoute allowedRoles={['driver']}>
                        <DriverAmbulances />
                      </ProtectedRoute>
                    } />
                    <Route path="/driver/settings" element={
                      <ProtectedRoute allowedRoles={['driver']}>
                        <DriverSettings />
                      </ProtectedRoute>
                    } />

                    {/* Doctor Routes */}
                    <Route path="/doctor/appointments" element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorAppointments />
                      </ProtectedRoute>
                    } />
                    <Route path="/doctor/patients" element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorPatients />
                      </ProtectedRoute>
                    } />
                    <Route path="/doctor/settings" element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorSettings />
                      </ProtectedRoute>
                    } />

                    {/* Medicine Store Routes */}
                    <Route path="/medicine/inventory" element={
                      <ProtectedRoute allowedRoles={['medicine_store']}>
                        <MedicineInventory />
                      </ProtectedRoute>
                    } />
                    <Route path="/medicine/orders" element={
                      <ProtectedRoute allowedRoles={['medicine_store']}>
                        <MedicineOrders />
                      </ProtectedRoute>
                    } />
                    <Route path="/medicine/settings" element={
                      <ProtectedRoute allowedRoles={['medicine_store']}>
                        <MedicineSettings />
                      </ProtectedRoute>
                    } />

                    {/* Physiotherapy Routes */}
                    <Route path="/physio/sessions" element={
                      <ProtectedRoute allowedRoles={['physiotherapy']}>
                        <PhysioSessions />
                      </ProtectedRoute>
                    } />
                    <Route path="/physio/patients" element={
                      <ProtectedRoute allowedRoles={['physiotherapy']}>
                        <PhysioPatients />
                      </ProtectedRoute>
                    } />
                    <Route path="/physio/settings" element={
                      <ProtectedRoute allowedRoles={['physiotherapy']}>
                        <PhysioSettings />
                      </ProtectedRoute>
                    } />

                    {/* Old Age Home Routes */}
                    <Route path="/old-age/residents" element={
                      <ProtectedRoute allowedRoles={['old_age_home']}>
                        <OldAgeResidents />
                      </ProtectedRoute>
                    } />
                    <Route path="/old-age/inquiries" element={
                      <ProtectedRoute allowedRoles={['old_age_home']}>
                        <OldAgeInquiries />
                      </ProtectedRoute>
                    } />
                    <Route path="/old-age/settings" element={
                      <ProtectedRoute allowedRoles={['old_age_home']}>
                        <OldAgeSettings />
                      </ProtectedRoute>
                    } />

                    {/* Admin Specific Sub-Routes */}
                    <Route path="/admin/ambulances" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AmbulanceManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/patients" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminPatients />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/activity" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ActivityLogs />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/doctors" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDoctors />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/medicines" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminMedicines />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/physiotherapy" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminPhysiotherapy />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/old-age-homes" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminOldAgeHomes />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/bookings" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminBookings />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/contacts" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminContactMessages />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/quick-bookings" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminQuickBookings />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/lab-tests" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLabTests />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/home-cares" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminHomeCares />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/residents" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminResidents />
                      </ProtectedRoute>
                    } />

                    {/* User Specific Sub-Routes */}
                    <Route path="/user/ambulances" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserAmbulances />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/doctors" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserDoctors />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/medicines" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserMedicines />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/physiotherapy" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserPhysiotherapy />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/old-age-homes" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserOldAgeHomes />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/lab-tests" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserLabTests />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/home-cares" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserHomeCares />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/records" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserRecords />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/activity" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserActivity />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/settings" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserSettings />
                      </ProtectedRoute>
                    } />
                    <Route path="/user/bookings" element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserBookings />
                      </ProtectedRoute>
                    } />

                    {/* Common Protected Routes */}
                    <Route
                      path="/documents"
                      element={
                        <ProtectedRoute allowedRoles={['user', 'patient', 'doctor', 'driver', 'medicine_store', 'physiotherapy', 'old_age_home', 'lab_test', 'home_care', 'admin']}>
                          <Documents />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/map"
                      element={
                        <ProtectedRoute>
                          <LiveMapRouteWrapper />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                </Suspense>
              </div>
            )}
          </AnimatePresence>
        </Router>
          </ChatCallProvider>
      </SocketProvider>
    </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
