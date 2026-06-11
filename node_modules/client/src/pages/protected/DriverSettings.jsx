import React from 'react';
import ProfileForm from '@/components/ProfileForm';
import ChangePassword from '../../components/ChangePassword';

const DriverSettings = () => {
    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Your  <span className="text-red-600">&</span> Vehicle Profile</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Update personal & vehicle information</p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10">
                <ProfileForm
                    extraFields={[
                        { name: 'vehicleNumber', label: 'Vehicle Number', placeholder: 'e.g. WB02 AB 1234' },
                        { name: 'vehicleType', type: 'select', label: 'Vehicle Type', options: ['Basic Life Support (BLS)', 'Advanced Life Support (ALS)', 'Patient Transport Vehicle'] },
                        { name: 'experience', type: 'number', label: 'Driving Experience (Years)', placeholder: 'e.g. 5' },
                        { name: 'licenseNumber', label: 'Driving License Number', placeholder: 'e.g. DL-14-2020...' },
                        { name: 'address', type: 'textarea', label: 'Home Address', placeholder: 'Where you are based' },
                        { name: 'city', label: 'City', placeholder: 'City' },
                        { name: 'state', label: 'State', placeholder: 'State' },
                        { name: 'zip_code', label: 'PIN Code', placeholder: 'PIN Code' },
                        { name: 'gender', type: 'select', label: 'Gender', options: ['Male', 'Female', 'Other'] },
                        { name: 'is_sharing_location', type: 'checkbox', label: 'Location Sharing', placeholder: 'Share my real-time location' }
                    ]}
                />
            </div>

            {/* Security & Password Module */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10">
                <ChangePassword />
            </div>
        </div>
    );
};

export default DriverSettings;



