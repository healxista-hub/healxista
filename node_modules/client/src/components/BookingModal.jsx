import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    X,
    Ambulance,
    Plane,
    Train,
    Stethoscope,
    MapPin,
    Phone,
    User,
    AlertCircle,
    CheckCircle2,
    FileText,
    Upload,
    Paperclip,
    CreditCard,
    Clock,
} from 'lucide-react';

const serviceOptions = [
    { value: 'road', label: 'Road Ambulance', icon: Ambulance },
    { value: 'air', label: 'Air Ambulance', icon: Plane, availableSoon: true },
    { value: 'train', label: 'Train Ambulance', icon: Train, availableSoon: true },
    { value: 'doctor', label: 'Doctor Consultation', icon: Stethoscope },
    { value: 'medicine', label: 'Medicine Delivery', icon: AlertCircle },
    { value: 'lab', label: 'Lab Test', icon: FileText },
    { value: 'home_care', label: 'Home Care', icon: User },
    { value: 'physio', label: 'Physiotherapy', icon: CheckCircle2 },
    { value: 'other', label: 'Other Service', icon: FileText },
];

const emergencyLevels = [
    { value: 'critical', label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: 'urgent', label: 'Urgent', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { value: 'normal', label: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50' },
];

const serviceConfigs = {
    registered_doctors: {
        patientLabel: 'Patient Name',
        pickupLabel: 'Patient Location / Address',
        notesLabel: 'Reason for Consultation',
        showDrop: false,
        showEmergency: false,
    },
    registered_medicine_stores: {
        patientLabel: 'Customer Name',
        pickupLabel: 'Delivery Address',
        notesLabel: 'Medicines Required / Prescriptions',
        showDrop: false,
        showEmergency: false,
    },
    registered_physiotherapists: {
        patientLabel: 'Patient Name',
        pickupLabel: 'Patient Address',
        notesLabel: 'Condition Details',
        showDrop: false,
        showEmergency: false,
    },
    registered_old_age_homes: {
        patientLabel: 'Contact Person Name',
        pickupLabel: 'Current Address',
        notesLabel: 'Specific Requirements',
        showDrop: false,
        showEmergency: false,
    },
    lab_tests: {
        patientLabel: 'Patient Name',
        pickupLabel: 'Home Address (Sample Collection)',
        notesLabel: 'Tests Required',
        showDrop: false,
        showEmergency: false,
    },
    home_care_services: {
        patientLabel: 'Patient Name',
        pickupLabel: 'Home Address',
        notesLabel: 'Care Required (Nurse, Elderly Care)',
        showDrop: false,
        showEmergency: false,
    },
    default_ambulance: {
        patientLabel: 'Patient Name',
        pickupLabel: 'Pickup Location',
        notesLabel: 'Additional Notes',
        showDrop: true,
        showEmergency: true,
    }
};

const getActiveConfig = (providerType, serviceType) => {
    if (providerType && serviceConfigs[providerType]) {
        return serviceConfigs[providerType];
    }
    if (serviceType === 'doctor') return serviceConfigs.registered_doctors;
    if (serviceType === 'physio') return serviceConfigs.registered_physiotherapists;
    if (serviceType === 'medicine') return serviceConfigs.registered_medicine_stores;
    if (serviceType === 'oldAgeHome') return serviceConfigs.registered_old_age_homes;
    if (serviceType === 'lab') return serviceConfigs.lab_tests;
    if (serviceType === 'home_care') return serviceConfigs.home_care_services;
    if (serviceType === 'other') return serviceConfigs.registered_medicine_stores;
    
    // Default for road, train, air, or anything unexpected
    return serviceConfigs.default_ambulance;
};

const BookingModal = ({ isOpen, onClose, preSelectedService = 'road', provider = null, providerType = null }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        contactNumber: '',
        pickupLocation: '',
        dropLocation: '',
        serviceType: preSelectedService || 'road',
        emergencyLevel: 'urgent',
        additionalNotes: '',
    });

    const [selectedFile, setSelectedFile] = useState(null);

    // Check if we should lock the service type (e.g., accessed from a specialized page)
    const isServiceLocked = !!provider || (preSelectedService && preSelectedService !== 'road' && preSelectedService !== 'air' && preSelectedService !== 'train');

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (submitError) {
            setSubmitError('');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, user_document: 'File size should not exceed 10MB' }));
                return;
            }
            setSelectedFile(file);
            setErrors(prev => ({ ...prev, user_document: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const config = getActiveConfig(providerType, formData.serviceType);

        if (!formData.patientName.trim()) {
            newErrors.patientName = `${config.patientLabel} is required`;
        }

        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^[0-9]{10}$/.test(formData.contactNumber.replace(/\s/g, ''))) {
            newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
        }

        if (!formData.pickupLocation.trim()) {
            newErrors.pickupLocation = `${config.pickupLabel} is required`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);
            setSubmitError('');
            try {
                const token = sessionStorage.getItem('token');
                let headers = {};
                // Note: user might not be logged in when booking
                if (token) {
                    // using cookie-based auth
                }

                const formDataToSend = new FormData();
                
                // Append standard fields
                Object.keys(formData).forEach(key => {
                    formDataToSend.append(key, formData[key]);
                });

                // Append file if exists
                if (selectedFile) {
                    formDataToSend.append('user_document', selectedFile);
                }

                if (provider) {
                    const serviceName = ['road', 'air', 'train'].includes(formData.serviceType) ? 'Ambulance Ride' : 
                                       formData.serviceType === 'doctor' ? 'Doctor Appointment' :
                                       formData.serviceType === 'physio' ? 'Physiotherapy Session' :
                                       formData.serviceType === 'medicine' ? 'Medicine Order' :
                                       (formData.serviceType === 'lab' || formData.serviceType === 'labTest') ? 'Lab Test Booking' :
                                       formData.serviceType === 'oldAgeHome' ? 'Old Age Home Inquiry' : 
                                       (providerType === 'registered_doctors' ? 'Doctor Appointment' : 
                                        providerType === 'registered_labs' ? 'Lab Test Booking' : 
                                        providerType === 'registered_physiotherapists' ? 'Physiotherapy Session' : 
                                        providerType === 'registered_medicine_stores' ? 'Medicine Order' : 'Service');
                    
                    formDataToSend.append('serviceName', serviceName);
                    formDataToSend.append('bookingType', ['road', 'air', 'train'].includes(formData.serviceType) ? 'Ride' : 'Appointment');
                    formDataToSend.append('providerId', provider.provider_id || provider.id);

                    await axios.post(`/api/bookings`, formDataToSend, { 
                        headers: { 'Content-Type': 'multipart/form-data' } 
                    });
                } else {
                    // For quick bookings, we currently don't support file upload but could easily add it
                    const payload = {
                        serviceType: formData.serviceType,
                        name: formData.patientName,
                        phone: formData.contactNumber,
                        location: formData.pickupLocation,
                        destination: formData.dropLocation,
                        details: formData.additionalNotes
                    };
                    await axios.post(`/api/quick-bookings`, payload, { headers });
                }

                // Show success message
                setIsSubmitted(true);

                // Reset form after 15 seconds and close modal
                const timer = setTimeout(() => {
                    setFormData({
                        patientName: '',
                        contactNumber: '',
                        pickupLocation: '',
                        dropLocation: '',
                        serviceType: preSelectedService,
                        emergencyLevel: 'urgent',
                        additionalNotes: '',
                    });
                    setIsSubmitted(false);
                    setSelectedFile(null);
                    onClose();
                }, 15000);
                
                // Store timer so it can be cleared if closed early (optional but good practice)
                window.bookingSuccessTimer = timer;
            } catch (error) {
                console.error('Booking submitted error:', error);
                alert('Failed to submit booking. Please try again.');
            }
        }
    };

    const handleClose = () => {
        if (window.bookingSuccessTimer) {
            clearTimeout(window.bookingSuccessTimer);
            window.bookingSuccessTimer = null;
        }
        setFormData({
            patientName: '',
            contactNumber: '',
            pickupLocation: '',
            dropLocation: '',
            serviceType: preSelectedService,
            emergencyLevel: 'urgent',
            additionalNotes: '',
        });
        setErrors({});
        setSubmitError('');
        setIsSubmitted(false);
        setIsSubmitting(false);
        setSelectedFile(null);
        onClose();
    };

    const config = getActiveConfig(providerType, formData.serviceType);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
                    >
                        <Card className="border-none shadow-none flex flex-col flex-1 min-h-0 rounded-none">
                            <CardHeader className="relative bg-gradient-to-r from-red-600 to-red-700 text-white shrink-0">
                                <button
                                    onClick={handleClose}
                                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/20 transition z-10"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <Ambulance className="h-7 w-7" />
                                    {provider ? `Book ${provider.name}` : 'Service Booking'}
                                </CardTitle>
                                <p className="text-white/90 text-sm mt-2">
                                    {provider
                                        ? `Fill in the details below to send a direct request to ${provider.name}.`
                                        : "Fill in the details below and we'll process your request immediately"}
                                </p>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1">
                                {isSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-8 px-2"
                                    >
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                            className="relative mb-6"
                                        >
                                            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                            <div className="relative h-24 w-24 bg-gradient-to-tr from-emerald-100 to-emerald-50 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                            </div>
                                        </motion.div>

                                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                            Booking Confirmed!
                                        </h3>
                                        <p className="text-slate-500 text-center mb-8 max-w-sm">
                                            Your request has been successfully submitted. We'll contact you shortly with service details.
                                        </p>

                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="w-full max-w-md bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-2xl p-5 shadow-sm mb-8"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <CreditCard className="h-5 w-5 text-amber-700" />
                                                </div>
                                                <p className="text-xs font-black text-amber-800 uppercase tracking-widest">
                                                    Payment Information
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-amber-900/80 leading-relaxed">
                                                After your booking is accepted by our service provider, please pay the <span className="font-bold text-amber-700">{formData.serviceType === 'doctor' || providerType === 'registered_doctors' ? 'Consultation Charges' : formData.serviceType === 'medicine' || providerType === 'registered_medicine_stores' ? 'Medicine Charges' : formData.serviceType === 'lab' || providerType === 'registered_labs' ? 'Lab Test Charges' : formData.serviceType === 'physio' || providerType === 'registered_physiotherapists' ? 'Physiotherapy Charges' : 'Service Charges'}</span> to proceed with the service.
                                            </p>
                                        </motion.div>

                                        <div className="w-full max-w-md flex flex-col items-center">
                                            <Button
                                                onClick={handleClose}
                                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold mb-4 transition-all hover:scale-[1.02]"
                                            >
                                                Done, Close Now
                                            </Button>
                                            
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Auto-closing in 15 seconds</span>
                                            </div>
                                            
                                            {/* 15s Progress Bar */}
                                            <div className="w-full max-w-[200px] h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: "100%" }}
                                                    animate={{ width: "0%" }}
                                                    transition={{ duration: 15, ease: "linear" }}
                                                    className="h-full bg-emerald-400 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Patient Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {config.patientLabel} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                <Input
                                                    name="patientName"
                                                    value={formData.patientName}
                                                    onChange={handleChange}
                                                    placeholder={`Enter ${config.patientLabel.toLowerCase()}`}
                                                    className={`pl-10 ${errors.patientName ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.patientName && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.patientName}
                                                </p>
                                            )}
                                        </div>

                                        {/* Contact Number */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Contact Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                <Input
                                                    name="contactNumber"
                                                    value={formData.contactNumber}
                                                    onChange={handleChange}
                                                    placeholder="10-digit mobile number"
                                                    className={`pl-10 ${errors.contactNumber ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.contactNumber && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.contactNumber}
                                                </p>
                                            )}
                                        </div>

                                        {/* Pickup Location */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {config.pickupLabel} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                <Input
                                                    name="pickupLocation"
                                                    value={formData.pickupLocation}
                                                    onChange={handleChange}
                                                    placeholder="Enter address"
                                                    className={`pl-10 ${errors.pickupLocation ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.pickupLocation && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.pickupLocation}
                                                </p>
                                            )}
                                        </div>

                                        {/* Drop Location */}
                                        {config.showDrop && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Drop Location / Hospital Name
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        name="dropLocation"
                                                        value={formData.dropLocation}
                                                        onChange={handleChange}
                                                        placeholder="Enter destination (optional)"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Service Type Selection - Hide if provider is pre-assigned or context locks service */}
                                        {!isServiceLocked && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Service Type
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {serviceOptions.map((service) => {
                                                        const Icon = service.icon;
                                                        const isSelected = formData.serviceType === service.value;
                                                        return (
                                                            <button
                                                                key={service.value}
                                                                type="button"
                                                                onClick={() =>
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        serviceType: service.value,
                                                                    }))
                                                                }
                                                                className={`relative p-2 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center h-full ${isSelected
                                                                    ? 'border-red-600 bg-red-50 text-red-700'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                {service.availableSoon && (
                                                                    <span className="absolute -top-2 -right-2 bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-tight shadow">
                                                                        SOON
                                                                    </span>
                                                                )}
                                                                <Icon className={`h-6 w-6 mx-auto mb-1 ${isSelected ? 'text-red-600' : 'text-gray-600'}`} />
                                                                <span className="text-xs font-semibold">
                                                                    {service.label}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Emergency Level */}
                                        {config.showEmergency && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Emergency Level
                                                </label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {emergencyLevels.map((level) => {
                                                        const isSelected = formData.emergencyLevel === level.value;
                                                        return (
                                                            <button
                                                                key={level.value}
                                                                type="button"
                                                                onClick={() =>
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        emergencyLevel: level.value,
                                                                    }))
                                                                }
                                                                className={`p-2 sm:p-3 rounded-xl border-2 text-center font-semibold text-xs sm:text-sm transition-all sm:whitespace-nowrap ${isSelected
                                                                    ? `border-current ${level.color} ${level.bgColor}`
                                                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                                    }`}
                                                            >
                                                                {level.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Notes */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {config.notesLabel}
                                            </label>
                                            <textarea
                                                name="additionalNotes"
                                                value={formData.additionalNotes}
                                                onChange={handleChange}
                                                placeholder="Any special instructions or medical conditions..."
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                                            />
                                        </div>

                                        {/* Document Upload */}
                                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-red-400 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-black text-slate-800 flex items-center gap-2">
                                                    <Paperclip className="h-4 w-4 text-red-600" />
                                                    Attach Document (Prescription/Report)
                                                </label>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max 10MB</span>
                                            </div>
                                            
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,image/*,.doc,.docx"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`p-4 rounded-xl border-2 border-slate-200 bg-white flex flex-col items-center justify-center gap-2 transition-all ${selectedFile ? 'border-emerald-500 bg-emerald-50' : 'group-hover:bg-slate-50'}`}>
                                                    {selectedFile ? (
                                                        <>
                                                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                                            <div className="text-center">
                                                                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{selectedFile.name}</p>
                                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">File Ready</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                                                                <Upload className="h-5 w-5" />
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-500">Tap to upload PDF or Image</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {errors.user_document && (
                                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-bold">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.user_document}
                                                </p>
                                            )}
                                        </div>

                                        {/* Submit Error */}
                                        {submitError && (
                                            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm flex items-start gap-2">
                                                <AlertCircle className="h-5 w-5 shrink-0" />
                                                <p>{submitError}</p>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-lg font-bold disabled:opacity-70"
                                            >
                                                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleClose}
                                                disabled={isSubmitting}
                                                className="px-8 h-12"
                                            >
                                                Cancel
                                            </Button>
                                        </div>

                                        <p className="text-xs text-gray-500 text-center">
                                            For immediate life-threatening emergencies, call <span className="font-bold text-red-600">9239362736</span>
                                        </p>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;
