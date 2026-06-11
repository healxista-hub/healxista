import React from 'react';
import logo from '@/assets/logo.png';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, List,
    Users,
    Map,
    Ambulance,
    Settings,
    LogOut,
    Activity,
    Pill,
    FileText,
    Calendar,
    Home,
    HeartPulse,
    ClipboardList,
    MessageSquare,
    Beaker,
    FlaskConical,
    HeartHandshake
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();

    // Default to 'user' if no role is found (though protected route should handle this)
    const role = user?.role?.toLowerCase().replace(/ /g, '_') || 'user';

    const getNavItems = (role) => {
        switch (role) {
            case 'driver':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, List, path: '/driver-dashboard' },
                    { name: 'Live Map', icon: Map, path: '/map' },
                    { name: 'Ambulances', icon: Ambulance, path: '/driver/ambulances' },
                    { name: 'Documents', icon: FileText, path: '/documents' },
                    { name: 'Settings', icon: Settings, path: '/driver/settings' },
                ];
            case 'doctor':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, List, path: '/doctor-dashboard' },
                    { name: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
                    { name: 'Patients', icon: Users, path: '/doctor/patients' },
                    { name: 'Documents', icon: FileText, path: '/documents' },
                    { name: 'Settings', icon: Settings, path: '/doctor/settings' },
                ];
            case 'medicine_store':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, List, path: '/medicine-store-dashboard' },
                    { name: 'Orders', icon: FileText, path: '/medicine/orders' },
                    { name: 'Inventory', icon: Pill, path: '/medicine/inventory' },
                    { name: 'Documents', icon: FileText, path: '/documents' },
                    { name: 'Settings', icon: Settings, path: '/medicine/settings' },
                ];
            case 'physiotherapy':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, List, path: '/physiotherapy-dashboard' },
                    { name: 'Sessions', icon: Activity, path: '/physio/sessions' },
                    { name: 'Patients', icon: Users, path: '/physio/patients' },
                    { name: 'Documents', icon: FileText, path: '/documents' },
                    { name: 'Settings', icon: Settings, path: '/physio/settings' },
                ];
            case 'old_age_home':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, List, path: '/old-age-home-dashboard' },
                    { name: 'Inquiries', icon: Users, path: '/old-age/inquiries' },
                    { name: 'Residents', icon: Home, path: '/old-age/residents' },
                    { name: 'Documents', icon: FileText, path: '/documents' },
                    { name: 'Settings', icon: Settings, path: '/old-age/settings' },
                ];
            case 'lab_test':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, List, path: '/lab-test-dashboard' },
                    { name: 'Appointments', icon: Calendar, path: '/lab-test/appointments' },
                    { name: 'Patients', icon: Users, path: '/lab-test/patients' },
                    { name: 'Documents', icon: FileText, path: '/documents' },
                    { name: 'Settings', icon: Settings, path: '/lab-test/settings' },
                ];
            case 'home_care':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, List, path: '/home-care-dashboard' },
                    { name: 'Appointments', icon: Calendar, path: '/home-care/appointments' },
                    { name: 'Patients', icon: Users, path: '/home-care/patients' },
                    { name: 'Documents', icon: FileText, path: '/documents' },
                    { name: 'Settings', icon: Settings, path: '/home-care/settings' },
                ];
            case 'admin':
                return [
                    { name: 'Overview', icon: LayoutDashboard, List, path: '/admin-dashboard' },
                    { name: 'Live Map', icon: Map, path: '/map' },
                    { name: 'Quick Bookings', icon: Activity, path: '/admin/quick-bookings' },
                    { name: 'Bookings', icon: ClipboardList, path: '/admin/bookings' },
                    { name: 'Inquiries', icon: MessageSquare, path: '/admin/contacts' },
                    { name: 'Users', icon: Users, path: '/admin/patients' },
                    { name: 'Doctors', icon: Activity, path: '/admin/doctors' },
                    { name: 'Ambulances', icon: Ambulance, path: '/admin/ambulances' },
                    { name: 'Medicines', icon: Pill, path: '/admin/medicines' },
                    { name: 'Physiotherapy', icon: HeartPulse, path: '/admin/physiotherapy' },
                    { name: 'Old Age Homes', icon: Home, path: '/admin/old-age-homes' },
                    { name: 'Residents', icon: Users, path: '/admin/residents' },
                    { name: 'Pathology Lab', icon: FlaskConical, path: '/admin/lab-tests' },
                    { name: 'Home Care', icon: HeartHandshake, path: '/admin/home-cares' },
                    { name: 'Documents', icon: FileText, path: '/documents' },
                    { name: 'Activity Log', icon: FileText, path: '/admin/activity' },
                    { name: 'Settings', icon: Settings, path: '/admin/settings' },
                ];
            case 'super_admin':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, List, path: '/super-admin-dashboard' },
                    { name: 'List Directory', icon: List, path: '/super-admin/directory' },
                    { name: 'Activity Log', icon: FileText, path: '/admin/activity' },
                    { name: 'Settings', icon: Settings, path: '/super-admin/settings' }
                ];
            default: // User
                return [
                    { name: 'Overview', icon: LayoutDashboard, List, path: '/dashboard' },
                    { name: 'Live Map', icon: Map, path: '/map' },
                    { name: 'My Bookings', icon: Calendar, path: '/user/bookings' },
                    { name: 'Documents & Sharing', icon: FileText, path: '/documents' },
                    { name: 'My Records', icon: FileText, path: '/user/records' },
                    { name: 'Doctors', icon: Activity, path: '/user/doctors' },
                    { name: 'Ambulances', icon: Ambulance, path: '/user/ambulances' },
                    { name: 'Medicines', icon: Pill, path: '/user/medicines' },
                    { name: 'Physiotherapy', icon: HeartPulse, path: '/user/physiotherapy' },
                    { name: 'Old Age Homes', icon: Home, path: '/user/old-age-homes' },
                    { name: 'Pathology Tests', icon: FlaskConical, path: '/user/lab-tests' },
                    { name: 'Home Care', icon: HeartHandshake, path: '/user/home-cares' },
                    { name: 'Activity', icon: Activity, path: '/user/activity' },
                    { name: 'Settings', icon: Settings, path: '/user/settings' },
                ];
        }
    };

    const navItems = getNavItems(role);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
    };

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-all duration-300 ease-in-out shadow-xl md:shadow-none",
            isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        )}>
            <div className="flex h-16 items-center border-b px-6">
                <div className="flex items-center gap-2 font-black text-xl">
                    <img src={logo} alt="Healxista" className="h-8 w-auto" />
                    <span className="brand-text-gradient">Healxista</span>
                </div>
            </div>

            <div className="flex flex-col h-[calc(100vh-4rem)] min-h-0">
                <nav className="flex-1 space-y-2 p-4 overflow-y-auto custom-scrollbar min-h-0">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent",
                                isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t bg-background">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 cursor-pointer w-full"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
