import React from 'react';
import { Home } from 'lucide-react';
import SharedBookingsList from '@/components/SharedBookingsList';

/**
 * OldAgeInquiries Module
 * Handles facility placement and admission control for senior care residents.
 */
const OldAgeInquiries = () => {
    return (
        <SharedBookingsList 
            userRole="provider" 
            title="Resident Inquiries" 
            icon={Home} 
        />
    );
};

export default OldAgeInquiries;



