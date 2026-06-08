import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Truck, 
  ShieldCheck, 
  Store, 
  HeartPulse, 
  Home,
  ArrowRight,
  ArrowLeft,
  Beaker,
  HeartHandshake
} from 'lucide-react';
import logo from '@/assets/logo.png';

const providers = [
    {
        title: "Doctor Portal",
        id: "doctor",
        icon: Stethoscope,
        description: "Access patient records, appointments, and medical consultations.",
        link: "/login/doctor",
        color: "blue"
    },
    {
        title: "Ambulance Services",
        id: "driver",
        icon: Truck,
        description: "Dispatch management and emergency response tracking for drivers.",
        link: "/login/driver",
        color: "red"
    },
    {
        title: "System Admin",
        id: "admin",
        icon: ShieldCheck,
        description: "Full system control, user management, and service analytics.",
        link: "/login/admin",
        color: "slate"
    },
    {
        title: "Medicine Store",
        id: "medicine",
        icon: Store,
        description: "Inventory control and prescription order management.",
        link: "/login/medicine-store",
        color: "green"
    },
    {
        title: "Physiotherapy",
        id: "physio",
        icon: HeartPulse,
        description: "Treatment planning and rehabilitation session tracking.",
        link: "/login/physiotherapy",
        color: "teal"
    },
    {
        title: "Old Age Home",
        id: "oldage",
        icon: Home,
        description: "Resident management and facility administration.",
        link: "/login/old-age-home",
        color: "orange"
    },
    {
        title: "Pathology Lab",
        id: "lab_test",
        icon: Beaker,
        description: "Diagnostic reports, patient samples, and lab analytics.",
        link: "/login/lab-test",
        color: "indigo"
    },
    {
        title: "Home Care",
        id: "home_care",
        icon: HeartHandshake,
        description: "Professional nursing and caregiving services at home.",
        link: "/login/home-care",
        color: "red"
    }
];

const ProviderPortal = () => {
    return (
        <div 
            className="min-h-screen relative overflow-x-hidden flex flex-col items-center py-24 px-6 md:justify-center bg-fixed bg-cover bg-center"
            style={{ backgroundImage: `url('/assets/images/hero/hospital.jpg')` }}
        >
            {/* Dark overlay for better contrast */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-0"></div>

            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20">
                <Link to="/" className="flex items-center gap-2 text-white hover:text-red-400 font-bold transition-all bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg hover:bg-white/20 hover:-translate-x-1">
                    <ArrowLeft size={18} /> Back to Home
                </Link>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-7xl relative z-10"
            >
                <div className="text-center mb-16">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6 bg-white/5 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">
                        <img src={logo} alt="Healxista" className="h-10 w-auto drop-shadow-md brightness-200" />
                        <span className="text-2xl font-black text-white tracking-widest uppercase">Healxista</span>
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
                        Service Provider <span className="text-red-500">Gateway</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto font-medium">
                        Select your specialized portal to access professional tools, manage patients, and serve the community.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providers.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link 
                                to={item.link}
                                className="group relative block bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 hover:border-red-500/50 hover:bg-slate-900/60 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 overflow-hidden"
                            >
                                {/* Decorative gradient accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full transition-opacity duration-500 group-hover:opacity-40 ${
                                    item.color === 'blue' ? 'bg-blue-500' :
                                    item.color === 'red' ? 'bg-red-500' :
                                    item.color === 'green' ? 'bg-green-500' :
                                    item.color === 'teal' ? 'bg-teal-500' :
                                    item.color === 'orange' ? 'bg-orange-500' :
                                    item.color === 'indigo' ? 'bg-indigo-500' :
                                    'bg-slate-500'
                                }`}></div>

                                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${
                                    item.color === 'blue' ? 'bg-blue-500/20 text-blue-400 shadow-blue-500/10 border border-blue-500/30' :
                                    item.color === 'red' ? 'bg-red-500/20 text-red-400 shadow-red-500/10 border border-red-500/30' :
                                    item.color === 'green' ? 'bg-green-500/20 text-green-400 shadow-green-500/10 border border-green-500/30' :
                                    item.color === 'teal' ? 'bg-teal-500/20 text-teal-400 shadow-teal-500/10 border border-teal-500/30' :
                                    item.color === 'orange' ? 'bg-orange-500/20 text-orange-400 shadow-orange-500/10 border border-orange-500/30' :
                                    item.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400 shadow-indigo-500/10 border border-indigo-500/30' :
                                    'bg-slate-700/50 text-slate-300 shadow-slate-900/50 border border-slate-600/50'
                                }`}>
                                    <item.icon size={32} />
                                </div>
                                
                                <h3 className="relative z-10 text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="relative z-10 text-slate-400 leading-relaxed mb-6 font-medium">
                                    {item.description}
                                </p>
                                
                                <div className="relative z-10 flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-slate-500 group-hover:text-red-400 group-hover:gap-4 transition-all">
                                    Enter Portal <ArrowRight size={16} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                        Need assistance or account access? <Link to="/contact" className="text-red-600 hover:underline font-bold">Contact Support</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ProviderPortal;
