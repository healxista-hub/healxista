import React from 'react';
import ProfileForm from '@/components/ProfileForm';

const OldAgeSettings = () => {
    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Sanitarium <span className="text-red-600">&</span> Care</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Facility registrations & capacity logistics</p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10">
                <ProfileForm
                    extraFields={[
                        { name: 'adminName', label: 'Administrator Name', placeholder: 'Name of the primary admin' },
                        { name: 'capacity', type: 'number', label: 'Facility Capacity', placeholder: 'Total number of beds/residents allowed' },
                        { name: 'facilitiesAvailable', type: 'textarea', label: 'Facilities Available', placeholder: 'e.g. 24/7 Nursing, Recreation' },
                        { name: 'licenseNumber', label: 'Facility License Number', placeholder: 'e.g. OAH-2023-...' },
                        { name: 'address', type: 'textarea', label: 'Facility Address', placeholder: 'Full address of the old age home' },
                        { name: 'city', label: 'City', placeholder: 'City' },
                        { name: 'state', label: 'State', placeholder: 'State' },
                        { name: 'zip_code', label: 'PIN Code', placeholder: 'PIN Code' }
                    ]}
                />
            </div>
        </div>
    );
};

export default OldAgeSettings;



