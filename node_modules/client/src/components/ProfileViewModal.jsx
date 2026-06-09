import React from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper to generate a consistent avatar color based on name
const getAvatarColor = (name) => {
    const colors = [
        'from-blue-500 to-indigo-600',
        'from-red-500 to-rose-600',
        'from-green-500 to-emerald-600',
        'from-purple-500 to-violet-600',
        'from-orange-500 to-amber-600',
        'from-teal-500 to-cyan-600',
    ];
    const idx = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
};

const ProfileViewModal = ({ isOpen, onClose, profile, title = "Profile Details", onBookNow }) => {
    if (!isOpen || !profile) return null;

    const profilePicUrl = profile.profile_image_url ? `/uploads/${profile.profile_image_url}` : null;
    // Smartly handle both /uploads/ and /uploads/documents/ paths
    const docFilename = profile.document_url;
    const docUrl = docFilename ? `/uploads/${docFilename}` : null;
    const avatarColor = getAvatarColor(profile.name);

    // Fields to skip entirely from the data grid
    const skipFields = new Set([
        'id', 'password', 'profile_image_url', 'document_url', 'created_at',
        'role', 'name', 'bio', 'is_verified', 'type', 'specialty',
        'first_name', 'last_name', 'provider_id', 'profile_id',
        'account_id', 'role_id', 'is_online', 'overall_rating', 'gender',
    ]);

    // Human-readable labels for known fields
    const fieldLabels = {
        custom_id: 'Registration No',
        role_name: 'Role',
        mobile: 'Phone Number',
        email: 'Email',
        address: 'Address',
        city: 'City',
        state: 'State',
        zip_code: 'PIN Code',
        street: 'Street',
        blood_group: 'Blood Group',
        specialization: 'Specialization',
        licenseNumber: 'License Number',
        license_number: 'License Number',
        experienceYears: 'Experience (Years)',
        consultationFee: 'Consultation Fee',
        vehicleNumber: 'Vehicle Number',
        vehicle_number: 'Vehicle Number',
        vehicleType: 'Vehicle Type',
        vehicle_type: 'Vehicle Type',
        experience: 'Experience',
        ownerName: 'Owner Name',
        operatingHours: 'Operating Hours',
        capacity: 'Capacity',
        facilitiesAvailable: 'Facilities Available',
        lab_name: 'Lab Name',
        accreditation: 'Accreditation',
        home_sample_collection: 'Home Sample Collection',
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" />

            {/* Modal Wrapper */}
            <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white overflow-hidden rounded-2xl shadow-2xl">

                {/* Scrolling Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                    {/* Header Banner */}
                    <div className="relative h-40 shrink-0 bg-slate-100">
                        {profile.cover_image_url ? (
                            <img src={`/uploads/${profile.cover_image_url}`} alt="Cover" className="w-full h-full object-cover" />
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

                    {/* Content Area */}
                    <div className="px-4 sm:px-6 pb-8 pt-0 relative">
                        {/* Avatar + Name Row */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start mb-6 relative">
                            {/* Avatar */}
                            <div className={`-mt-16 sm:-mt-20 h-32 w-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden shrink-0 flex items-center justify-center relative z-10 bg-gradient-to-br ${avatarColor}`}>
                                {profilePicUrl ? (
                                    <img
                                        src={profilePicUrl}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="text-5xl text-white font-bold uppercase">
                                        {profile.name?.charAt(0) || 'P'}
                                    </span>
                                )}
                            </div>

                            {/* Name & Info */}
                            <div className="flex-1 pt-2 sm:pt-4 w-full min-w-0">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-[6px]">
                                            {profile.name}
                                        </h2>
                                        <p className="text-blue-600 font-medium text-sm mt-1 flex items-center gap-2">
                                            <FileText className="h-4 w-4 shrink-0" />
                                            {profile.role_name || profile.type || profile.role || title}
                                        </p>
                                        {profile.custom_id && (
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {profile.custom_id}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {profile.is_verified && (
                                                <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                    <CheckCircle2 className="h-3 w-3" /> Verified
                                                </span>
                                            )}
                                            {profile.is_online !== false ? (
                                                <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-200">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                                    Offline
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {onBookNow && profile.is_verified && (
                                        <Button
                                            className={`hidden sm:flex font-bold shrink-0 mt-[6px] ${
                                                profile.is_online !== false
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                            disabled={profile.is_online === false}
                                            onClick={() => { if (profile.is_online !== false) onBookNow(profile); }}
                                        >
                                            {profile.is_online === false ? 'Not Available' : 'Book Service'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* About / Bio */}
                        {profile.bio && (
                            <div className="mb-6 border-t pt-4">
                                <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">About</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{profile.bio}</p>
                            </div>
                        )}

                        {/* Data Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(profile).map(([key, value]) => {
                                if (skipFields.has(key)) return null;
                                if (value === null || value === undefined || value === '') return null;

                                const label = fieldLabels[key] || key
                                    .replace(/_/g, ' ')
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/\b\w/g, l => l.toUpperCase())
                                    .trim();

                                const displayValue = typeof value === 'boolean'
                                    ? (value ? '✓ Yes' : '✗ No')
                                    : String(value);

                                return (
                                    <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 mb-0.5 font-semibold uppercase tracking-wider">{label}</p>
                                        <p className="text-sm font-semibold text-gray-800 break-words">{displayValue}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Document Section */}
                        {docUrl && (
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold text-gray-700 mb-3 uppercase text-xs tracking-wider">Verification Document</h4>
                                <a
                                    href={docUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <FileText className="h-5 w-5" />
                                    View Verification Document
                                </a>
                            </div>
                        )}

                        {/* Mobile Book Button */}
                        {onBookNow && profile.is_verified && (
                            <div className="mt-6 pt-4 border-t sm:hidden">
                                <Button
                                    className={`w-full font-bold h-12 ${
                                        profile.is_online !== false
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={profile.is_online === false}
                                    onClick={() => { if (profile.is_online !== false) onBookNow(profile); }}
                                >
                                    {profile.is_online === false ? 'Not Available' : 'Book Service Now'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileViewModal;
