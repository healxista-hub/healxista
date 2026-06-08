import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const stats = [
    { value: 450, label: 'Road Ambulance (24×7)', suffix: '+' },
    { value: 200, label: 'Hospital Beds Available', suffix: '+' },
    { value: 350, label: 'On-Call Doctors', suffix: '+' },
    { value: 120, label: 'ICU & Critical Care Units', suffix: '+' },
    { value: 500, label: 'Medicine Deliveries Daily', suffix: '+' },
    { value: 300, label: 'Diagnostic Pathology Tests', suffix: '+' },
    { value: 150, label: 'Home Care Professionals', suffix: '+' },
    { value: 100, label: 'Physiotherapy & Rehab Experts', suffix: '+' }
];

// Counter hook — used only at component top level
const useCounter = (end, duration = 1400) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);

    return count;
};

// ── Individual fleet stat card — hook called at component top level (Rules of Hooks compliant) ──
const FleetStatCard = ({ stat, index }) => {
    const count = useCounter(stat.value);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
            <div className="text-3xl md:text-4xl font-extrabold text-red-600">
                {count}
                {stat.suffix}
            </div>
            <p className="mt-2 text-gray-600 font-medium">{stat.label}</p>
        </motion.div>
    );
};

const FleetPresence = () => {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden py-28 bg-gradient-to-b from-white via-red-50/40 to-white">

            <div className="container mx-auto px-4 relative z-10 text-center">

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900">
                        Eastern India's <span className="text-red-600">Emergency Network</span>
                    </h2>
                    <p className="mt-5 text-xl text-gray-600 max-w-3xl mx-auto">
                        Serving Kolkata, Purulia &amp; Bokaro — life-saving ambulances, doctors &amp; emergency care
                        <span className="font-semibold text-gray-900"> always within reach.</span>
                    </p>
                    {/* Cities Badge */}
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {['📍 Kolkata, WB', '📍 Purulia, WB', '📍 Bokaro, Jharkhand'].map((city) => (
                            <span key={city} className="inline-flex items-center px-4 py-1.5 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-full">
                                {city}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 max-w-5xl mx-auto">
                    {stats.map((stat, i) => (
                        <FleetStatCard key={i} stat={stat} index={i} />
                    ))}
                </div>

                {/* FLEET IMAGE */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="relative max-w-6xl mx-auto"
                >
                    <img
                        src="/assets/images/all-ambulance.png"
                        alt="Healxista Fleet — Kolkata, Purulia, Bokaro"
                        className="rounded-3xl shadow-2xl w-full relative z-10"
                        onError={(e) => {
                            e.target.src = '/assets/images/all ambulance.png';
                        }}
                    />
                    {/* Glass border */}
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-white/30" />
                </motion.div>


            </div>
        </section>
    );
};

export default FleetPresence;
