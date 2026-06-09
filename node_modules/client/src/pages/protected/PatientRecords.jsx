import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Ambulance,
    HeartPulse,
    FileText,
    PhoneCall,
    MapPin,
    Calendar,
    Download,
    AlertTriangle,
    Stethoscope,
    Activity
} from 'lucide-react';

/* Mock user data (API ready) */
const user = {
    name: 'Rahul Sharma',
    age: 45,
    bloodGroup: 'B+',
    city: 'Kolkata',
    emergencyStatus: 'Safe',
};

const DashboardUser = () => {
    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold">My Health Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user.name}. Stay safe, help is one tap away.
                </p>
            </div>

            {/* 🚨 EMERGENCY CTA */}
            <Card className="border-red-500 bg-red-50">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                        <div>
                            <h3 className="text-lg font-bold text-red-700">
                                Emergency Assistance
                            </h3>
                            <p className="text-sm text-red-600">
                                Book nearest ambulance instantly with live tracking
                            </p>
                        </div>
                    </div>
                    <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        <Ambulance className="h-5 w-5 mr-2" />
                        Call Ambulance Now
                    </Button>
                </CardContent>
            </Card>

            {/* 🔢 HEALTH OVERVIEW */}
            <div className="grid md:grid-cols-4 gap-4">
                {[
                    { label: 'Blood Group', value: user.bloodGroup, icon: HeartPulse },
                    { label: 'City', value: user.city, icon: MapPin },
                    { label: 'Medical Records', value: '12', icon: FileText },
                    { label: 'Ambulance Calls', value: '3', icon: Ambulance },
                ].map((item, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <item.icon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                <p className="text-xl font-bold">{item.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 🚑 LAST AMBULANCE STATUS */}
            <Card>
                <CardHeader>
                    <CardTitle>Last Ambulance Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Road Ambulance • #AMB-204</p>
                            <p className="text-sm text-muted-foreground">
                                Park Street → Apollo Hospital
                            </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                            Completed
                        </span>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline">
                            <MapPin className="h-4 w-4 mr-2" />
                            View Route
                        </Button>
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Case Summary
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 🏥 MEDICAL HISTORY */}
            <Card>
                <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { date: '14 Jan 2026', issue: 'Cardiac Checkup', doctor: 'Dr. Sen' },
                        { date: '02 Dec 2025', issue: 'Accident Trauma', doctor: 'Emergency Team' },
                        { date: '10 Oct 2025', issue: 'Diabetes Review', doctor: 'Dr. Roy' },
                    ].map((record, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="font-medium">{record.issue}</p>
                                <p className="text-sm text-muted-foreground">
                                    {record.date} • {record.doctor}
                                </p>
                            </div>
                            <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* 👨‍⚕️ DOCTOR CONSULTATION */}
            <Card>
                <CardHeader>
                    <CardTitle>Doctor Consultation</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Stethoscope className="h-10 w-10 text-emerald-600" />
                        <div>
                            <p className="font-semibold">Need medical advice?</p>
                            <p className="text-sm text-muted-foreground">
                                Book online consultation instantly
                            </p>
                        </div>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Consult Doctor
                    </Button>
                </CardContent>
            </Card>

        </div>
    );
};

export default DashboardUser;


