import React from 'react';
import ProfileForm from '@/components/ProfileForm';
import { Beaker } from 'lucide-react';
import ChangePassword from '../../components/ChangePassword';

const LabTestSettings = () => {
    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Beaker className="h-8 w-8 text-red-600" />
                    Lab <span className="text-red-600">Settings</span>
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Configure your diagnostic node identity and security</p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10">
                <ProfileForm
                    extraFields={[
                        { name: 'lab_name', label: 'Laboratory Entity Name', placeholder: 'e.g. HealthLab Diagnostics' },
                        { name: 'ownerName', label: 'Owner Name', placeholder: 'Owner Full Name' },
                        { name: 'accreditation', label: 'Accreditation', placeholder: 'e.g. NABL, ISO 9001' },
                        { name: 'address', type: 'textarea', label: 'Physical Location', placeholder: 'Complete address of the laboratory' },
                        { name: 'city', label: 'City', placeholder: 'City' },
                        { name: 'state', label: 'State', placeholder: 'State' },
                        { name: 'zip_code', label: 'PIN Code', placeholder: 'PIN Code' }
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

export default LabTestSettings;
