import React from 'react';
import ProfileForm from '@/components/ProfileForm';

const MedicineSettings = () => {
    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Pharmacy <span className="text-red-600">&</span> Inventory</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Medical supply chain credentials & logistics data</p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10">
                <ProfileForm
                    extraFields={[
                        { name: 'ownerName', label: 'Owner Name', placeholder: 'Name of the business owner' },
                        { name: 'operatingHours', type: 'select', label: 'Operating Hours', options: ['24/7', '9 AM - 9 PM', '8 AM - 10 PM', '10 AM - 8 PM'] },
                        { name: 'licenseNumber', label: 'Pharmacy License Number', placeholder: 'e.g. PH-2023-...' },
                        { name: 'address', type: 'textarea', label: 'Store Address', placeholder: 'Full address of the pharmacy' },
                        { name: 'city', label: 'City', placeholder: 'City' },
                        { name: 'state', label: 'State', placeholder: 'State' },
                        { name: 'zip_code', label: 'PIN Code', placeholder: 'PIN Code' }
                    ]}
                />
            </div>
        </div>
    );
};

export default MedicineSettings;



