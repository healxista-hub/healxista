import React, { useEffect, useState } from 'react';
import { HeartPulse, Ambulance, Stethoscope, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
    { label: 'Happy Families', value: 20000, suffix: '+', icon: HeartPulse },
    { label: 'OPD Done', value: 10000, suffix: '+', icon: Ambulance },
    { label: 'Doctors', value: 30, suffix: '+', icon: Stethoscope },
    { label: 'Completed', value: 5000, suffix: '+', icon: CheckCircle2 },
];

// Count-up hook — must be used at component top-level only
const useCountUp = (end, duration = 1400) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const step = end / (duration / 16);

        const timer = setInterval(() => {
            start += step;
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

// ── Individual stat card — hook called at component top level (Rules of Hooks compliant) ──
const StatCard = ({ stat, index }) => {
    const count = useCountUp(stat.value);
    const Icon = stat.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group flex flex-col items-center text-center rounded-2xl bg-white/5 backdrop-blur-md p-6 hover:bg-white/10 transition"
        >
            {/* Icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-600/15 text-red-400 group-hover:scale-110 transition">
                <Icon className="h-7 w-7" />
            </div>

            {/* Number */}
            <div className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                {count.toLocaleString('en-IN')}
                {stat.suffix}
            </div>

            {/* Label */}
            <div className="mt-2 text-sm md:text-base uppercase tracking-widest font-semibold text-blue-200">
                {stat.label}
            </div>
        </motion.div>
    );
};

const StatsBar = ({ className = "relative z-20 -mt-8" }) => {
    return (
        <section className={`${className} bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 py-14 shadow-2xl`}>

            {/* Soft ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 bg-blue-500/10 blur-3xl rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} stat={stat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsBar;
