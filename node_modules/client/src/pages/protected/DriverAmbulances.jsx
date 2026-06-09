import React from 'react';
import { Ambulance } from 'lucide-react';
import SharedBookingsList from '@/components/SharedBookingsList';

/**
 * DriverAmbulances Module
 * Manages real-time ambulance dispatch operations and emergency transport requests.
 */
const DriverAmbulances = () => {
    return (
        <SharedBookingsList
            userRole="provider"
            title="Dispatch Operations"
            icon={Ambulance}
        />
    );
};

export default DriverAmbulances;



