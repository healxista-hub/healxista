import React from 'react';
import { Calendar } from 'lucide-react';
import SharedBookingsList from '@/components/SharedBookingsList';

const HomeCareAppointments = () => {
    return (
        <SharedBookingsList 
            userRole="provider" 
            title="Caregiving Appointments" 
            icon={Calendar} 
            isDoctor={true} // Using true to get similar clinical fields if any
        />
    );
};

export default HomeCareAppointments;



