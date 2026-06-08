import React from 'react';
import { Activity } from 'lucide-react';
import SharedBookingsList from '@/components/SharedBookingsList';

/**
 * PhysioSessions Module
 * Manages clinical rehabilitation sessions and physiotherapy patient tracks.
 */
const PhysioSessions = () => {
    return (
        <SharedBookingsList 
            userRole="provider" 
            title="Rehabilitation Sessions" 
            icon={Activity} 
        />
    );
};

export default PhysioSessions;



