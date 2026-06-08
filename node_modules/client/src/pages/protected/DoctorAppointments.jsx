import React from 'react';
import { Calendar } from 'lucide-react';
import SharedBookingsList from '@/components/SharedBookingsList';

/**
 * DoctorAppointments Module
 * Handles clinician-specific appointment scheduling and patient consultations.
 */
const DoctorAppointments = () => {
    return (
        <SharedBookingsList 
            userRole="provider" 
            title="Clinical Appointments" 
            icon={Calendar} 
            isDoctor={true}
        />
    );
};

export default DoctorAppointments;



