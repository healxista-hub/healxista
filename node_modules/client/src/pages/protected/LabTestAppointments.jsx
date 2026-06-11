import React from 'react';
import { Calendar } from 'lucide-react';
import SharedBookingsList from '@/components/SharedBookingsList';

const LabTestAppointments = () => {
    return (
        <SharedBookingsList 
            userRole="provider" 
            title="Lab Appointments" 
            icon={Calendar} 
            isDoctor={true} // Using true to get similar clinical fields if any
        />
    );
};

export default LabTestAppointments;
