import React from 'react';
import ProfileForm from '@/components/ProfileForm';
import ChangePassword from '../../components/ChangePassword';

const UserSettings = () => {
    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Identity <span className="text-red-600">&</span> Profile</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Manage residency and biometric data flow</p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10">
                <ProfileForm
                    extraFields={[
                        { name: 'date_of_birth', type: 'date', label: 'Date of Birth', placeholder: 'YYYY-MM-DD' },
                        { name: 'gender', type: 'select', label: 'Gender', options: ['Male', 'Female', 'Other'] },
                        { name: 'blood_group', type: 'select', label: 'Blood Group', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                        { name: 'address', type: 'textarea', label: 'Home Address', placeholder: 'Your residential address' },
                        { name: 'city', label: 'City', placeholder: 'City' },
                        { name: 'state', label: 'State', placeholder: 'State' },
                        { name: 'zip_code', label: 'PIN Code', placeholder: 'PIN Code' },
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

export default UserSettings;



