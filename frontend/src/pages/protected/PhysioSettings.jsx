import React from 'react';
import ProfileForm from '@/components/ProfileForm';
import ChangePassword from '../../components/ChangePassword';

const PhysioSettings = () => {
    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Rehab <span className="text-red-600">&</span> Wellness</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Therapeutic center credentials & specialization data</p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10">
                <ProfileForm
                    extraFields={[
                        { name: 'specialization', label: 'Center Specialization', placeholder: 'e.g. Sports Rehabilitation' },
                        { name: 'experienceYears', type: 'number', label: 'Experience (Years)', placeholder: 'e.g. 5' },
                        { name: 'consultationFee', type: 'number', label: 'Consultation Fee', placeholder: 'e.g. 300' },
                        { name: 'licenseNumber', label: 'Registration/License Number', placeholder: 'e.g. PHY-2023-...' },
                        { name: 'address', type: 'textarea', label: 'Center Address', placeholder: 'Full address of the clinic/center' },
                        { name: 'city', label: 'City', placeholder: 'City' },
                        { name: 'state', label: 'State', placeholder: 'State' },
                        { name: 'zip_code', label: 'PIN Code', placeholder: 'PIN Code' },
                        { name: 'gender', type: 'select', label: 'Gender Category', options: ['Mixed', 'Female Only', 'Male Only'] }
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

export default PhysioSettings;



