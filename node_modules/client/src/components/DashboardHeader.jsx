import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, X, Phone, User, Search, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AvailabilityToggle from './AvailabilityToggle';

const DashboardHeader = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Format role safely
    const formatRole = (role) => {
        if (!role) return 'User';
        const lowerRole = String(role).toLowerCase();
        if (lowerRole === 'patient') return 'User';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 md:px-6 py-3 flex items-center justify-between">
            {/* Left: Search */}
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0 text-gray-700">
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="relative hidden md:block w-64 lg:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-background pl-9"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Availability Toggle (Only for Providers) */}
                {user && !['user', 'patient', 'admin'].includes(String(user?.role).toLowerCase()) && (
                    <AvailabilityToggle accountId={user.id} />
                )}

                {/* Emergency CTA */}
                <Button variant="destructive" size="sm" className="hidden xs:flex font-bold shadow-sm h-9 px-2 sm:px-4">
                    <Phone className="sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline lg:inline">Emergency SOS</span>
                    <span className="inline sm:hidden">SOS</span>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative shrink-0 text-gray-700">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-white"></span>
                </Button>

                {/* User Profile */}
                <div className="relative flex items-center pl-2 md:pl-4 border-l border-gray-200" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 md:gap-3 focus:outline-none hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold leading-none text-gray-900">{user?.name || 'Admin'}{user?.customId ? ` (${user.customId})` : ''}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatRole(user?.role)}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold border border-red-200 shrink-0 overflow-hidden">
                            {(user?.profile_image_url || user?.profilePicture) ? (
                                <img
                                    src={`/uploads/${user.profile_image_url || user.profilePicture}`}
                                    alt={user?.name || 'Profile'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.querySelector('span').style.display = 'flex'; }}
                                />
                            ) : null}
                            <span className={`w-full h-full items-center justify-center ${(user?.profile_image_url || user?.profilePicture) ? 'hidden' : 'flex'}`}>
                                {user?.name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                            </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block shrink-0" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}{user?.customId ? ` (${user.customId})` : ''}</p>
                                <p className="text-xs text-gray-500 truncate">{formatRole(user?.role)}</p>
                            </div>
                            <div className="px-4 py-2">
                                <p className="text-xs text-gray-500">Signed in as</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.email || 'user@email.com'}</p>
                            </div>
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
