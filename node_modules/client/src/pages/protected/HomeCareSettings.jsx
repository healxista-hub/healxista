import React from 'react';
import ProfileForm from '@/components/ProfileForm';
import ChangePassword from '../../components/ChangePassword';

const HomeCareSettings = () => {
    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Caregiver <span className="text-red-600">&</span> License</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Professional credentials & service data</p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10">
                <ProfileForm
                    extraFields={[
                        { name: 'agencyName', label: 'Qualification / Role', placeholder: 'e.g. Registered Nurse' },
                        { name: 'servicesOffered', label: 'Services Offered', placeholder: 'e.g. Elderly Care, Injections' },
                        { name: 'experienceYears', type: 'number', label: 'Experience (Years)', placeholder: 'e.g. 5' },
                        { name: 'licenseNumber', label: 'Professional License Number', placeholder: 'e.g. RN-1234' },
                        { name: 'address', type: 'textarea', label: 'Clinic Address', placeholder: 'Address of practice' },
                        { name: 'city', label: 'City', placeholder: 'City' },
                        { name: 'state', label: 'State', placeholder: 'State' },
                        { name: 'zip_code', label: 'PIN Code', placeholder: 'PIN Code' },
                        { name: 'gender', type: 'select', label: 'Gender', options: ['Male', 'Female', 'Other'] }
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

export default HomeCareSettings;



