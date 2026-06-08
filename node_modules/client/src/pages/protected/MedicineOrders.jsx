import React from 'react';
import { ShoppingBag } from 'lucide-react';
import SharedBookingsList from '@/components/SharedBookingsList';

/**
 * MedicineOrders Module
 * Orchestrates pharmacy inventory fulfillment and prescription medication orders.
 */
const MedicineOrders = () => {
    return (
        <SharedBookingsList
            userRole="provider"
            title="Pharmacy Fulfillment"
            icon={ShoppingBag}
        />
    );
};

export default MedicineOrders;



