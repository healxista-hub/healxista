import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const WebsiteLayout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-red-500/20">
            <Navbar />
            <main className="w-full overflow-x-hidden min-h-screen flex flex-col">
                <div className="flex-1 w-full">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default WebsiteLayout;
