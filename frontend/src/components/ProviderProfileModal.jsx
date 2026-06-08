import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    X, 
    Star, 
    Clock, 
    Award, 
    MapPin, 
    ShieldCheck,
    CheckCircle2,
    Calendar,
    Stethoscope,
    Briefcase,
    BadgeCheck,
    Truck,
    Building2,
    FlaskConical,
    Timer,
    Info
} from 'lucide-react';

const ProviderProfileModal = ({ isOpen, onClose, provider, onBookNow }) => {
    if (!provider) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Wrapper - Scrolling Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white overflow-hidden rounded-2xl shadow-2xl"
                    >
                        {/* Scrollable Area (Banner + Content) */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                            {/* Header / Banner */}
                            <div className="relative h-40 shrink-0 bg-slate-100">
                                {provider.cover_image_url ? (
                                    <img src={`/uploads/${provider.cover_image_url}`} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                                    </div>
                                )}
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition z-10 backdrop-blur-sm"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Main Content Area */}
                            <div className="px-4 sm:px-6 pb-8 pt-0 relative">
                                {/* Profile Picture and Basic Info row */}
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start mb-6 relative">
                                    {/* Avatar */}
                                    <div className="-mt-16 sm:-mt-20 h-32 w-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white shrink-0 relative z-10">
                                        <img 
                                            src={provider.image || '/assets/images/placeholder_avatar.png'} 
                                            alt={provider.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(provider.name || 'Provider') + '&background=random' }}
                                        />
                                    </div>
                                    
                                    {/* Name & Basic Info */}
                                    <div className="flex-1 pt-2 sm:pt-4 w-full min-w-0">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap mt-[6px]">
                                                    <span className="truncate">{provider.name || provider.ownerName || provider.lab_name}</span>
                                                    {provider.is_online !== false ? (
                                                        <span className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-md text-[10px] sm:text-xs font-semibold bg-green-100 text-green-700 shrink-0">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                            Available Now
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-md text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-700 shrink-0">
                                                            Offline
                                                        </span>
                                                    )}
                                                </h2>
                                                <p className="text-blue-600 font-medium text-base sm:text-lg mt-1 flex items-center gap-2 truncate">
                                                    <Stethoscope className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">{provider.specialty || provider.type || 'Healthcare Professional'}</span>
                                                </p>
                                            </div>
                                            <Button 
                                                className={`hidden sm:flex font-bold shrink-0 mt-[6px] ${provider.is_online !== false ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'}`}
                                                disabled={provider.is_online === false}
                                                onClick={() => {
                                                    if(provider.is_online === false) return;
                                                    onClose();
                                                    if (onBookNow) onBookNow(provider);
                                                }}
                                            >
                                                {provider.is_online === false ? 'Not Available' : 'Book Appointment'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
                                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto bg-blue-100 text-blue-600 rounded-full mb-2">
                                            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <p className="text-gray-500 text-xs sm:text-sm">Experience</p>
                                        <p className="font-bold text-gray-900 text-sm sm:text-base">{provider.experience || '5+ Years'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
                                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto bg-yellow-100 text-yellow-600 rounded-full mb-2">
                                            <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <p className="text-gray-500 text-xs sm:text-sm">Rating</p>
                                        <p className="font-bold text-gray-900 text-sm sm:text-base">{provider.rating || '4.5'} / 5.0</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
                                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto bg-green-100 text-green-600 rounded-full mb-2">
                                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <p className="text-gray-500 text-xs sm:text-sm">Consults</p>
                                        <p className="font-bold text-gray-900 text-sm sm:text-base">{provider.consultations || '1000+'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
                                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto bg-purple-100 text-purple-600 rounded-full mb-2">
                                            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <p className="text-gray-500 text-xs sm:text-sm">Verified</p>
                                        <p className="font-bold text-gray-900 text-sm sm:text-base">Secure</p>
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">About {provider.name?.split(' ')[0] || 'Provider'}</h3>
                                        <p className="text-gray-600 leading-relaxed text-sm italic">
                                            {provider.bio || `Highly experienced ${provider.specialty || provider.type || 'professional'} dedicated to providing top-quality care and patient-centric health solutions.`}
                                        </p>
                                    </div>

                                    {/* Role Specific Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        {provider.role_name === 'Doctor' && (
                                            <>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Stethoscope className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Specialization</p>
                                                        <p className="text-gray-600">{provider.specialization || 'General Medicine'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <BadgeCheck className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Consultation Fee</p>
                                                        <p className="text-gray-600">₹{provider.consultation_fee || '500'}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {provider.role_name === 'Physiotherapy' && (
                                            <>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Briefcase className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Specialization</p>
                                                        <p className="text-gray-600">{provider.specialization || 'Sports Rehab'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <BadgeCheck className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Per Session Fee</p>
                                                        <p className="text-gray-600">₹{provider.consultation_fee || '800'}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {provider.role_name === 'Driver' && (
                                            <>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Truck className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Vehicle Info</p>
                                                        <p className="text-gray-600">{provider.vehicle_type || 'Ambulance'} ({provider.vehicle_number || 'N/A'})</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Timer className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Experience</p>
                                                        <p className="text-gray-600">{provider.experience || '5'} Years</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {provider.role_name === 'Lab Test' && (
                                            <>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Building2 className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Owner Name</p>
                                                        <p className="text-gray-600">{provider.owner_name || provider.ownerName || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <FlaskConical className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Accreditation</p>
                                                        <p className="text-gray-600">{provider.accreditation || 'NABL Certified'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <MapPin className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Home Collection</p>
                                                        <p className="text-gray-600">{provider.home_sample_collection ? 'Available' : 'Clinic Only'}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {provider.role_name === 'Medicine Store' && (
                                            <>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Building2 className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Owner Name</p>
                                                        <p className="text-gray-600">{provider.owner_name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Clock className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Opening Hours</p>
                                                        <p className="text-gray-600">{provider.opening_hours || '09:00 AM - 09:00 PM'}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {provider.role_name === 'Old Age Home' && (
                                            <>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Building2 className="h-4 w-4 mt-0.5 text-indigo-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Capacity</p>
                                                        <p className="text-gray-600">{provider.capacity || '50'} Residents</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Info className="h-4 w-4 mt-0.5 text-indigo-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Facilities</p>
                                                        <p className="text-gray-600 line-clamp-2">{provider.facilities_description || 'Standard Healthcare Facilities'}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {provider.role_name === 'Home Care' && (
                                            <>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Stethoscope className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Qualification / Role</p>
                                                        <p className="text-gray-600">{provider.agency_name || provider.agencyName || 'Professional Caregiver'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <Briefcase className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-gray-700">Services Offered</p>
                                                        <p className="text-gray-600">{provider.services_offered || provider.servicesOffered || 'General Home Care'}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-3">
                                            <h4 className="font-bold text-gray-800 text-sm">Contact & Location</h4>
                                            <div className="flex items-start gap-3 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                                                <span>{provider.address || 'Location varies'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-bold text-gray-800 text-sm">Availability</h4>
                                            <div className="flex items-start gap-3 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                                                <div>
                                                    <p>Monday - Saturday</p>
                                                    <p>09:00 AM - 08:00 PM</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Book Button */}
                                <div className="mt-8 pt-4 border-t sm:hidden">
                                    <Button 
                                        className={`w-full font-bold h-12 ${provider.is_online !== false ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'}`}
                                        disabled={provider.is_online === false}
                                        onClick={() => {
                                            if(provider.is_online === false) return;
                                            onClose();
                                            if (onBookNow) onBookNow(provider);
                                        }}
                                    >
                                        {provider.is_online === false ? 'Not Available' : 'Book Appointment Now'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProviderProfileModal;
