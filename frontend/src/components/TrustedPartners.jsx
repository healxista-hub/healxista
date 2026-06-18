import React from 'react';
import { motion } from 'framer-motion';

const partners = [
    {
        name: 'Remedia Pain Relief Clinic',
        initials: 'RC',
        color: 'bg-red-600',
        tag: 'Pain Management',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Logo_of_the_Indian_Red_Cross_Society.svg/200px-Logo_of_the_Indian_Red_Cross_Society.svg.png',
    },

    {
        name: 'Remedia Pain Relief Clinic',
        initials: 'RC',
        color: 'bg-red-600',
        tag: 'Pain Management',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Logo_of_the_Indian_Red_Cross_Society.svg/200px-Logo_of_the_Indian_Red_Cross_Society.svg.png',
    },

    {
        name: 'Remedia Pain Relief Clinic',
        initials: 'RC',
        color: 'bg-red-600',
        tag: 'Pain Management',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Logo_of_the_Indian_Red_Cross_Society.svg/200px-Logo_of_the_Indian_Red_Cross_Society.svg.png',
    },

    {
        name: 'Remedia Pain Relief Clinic',
        initials: 'RC',
        color: 'bg-red-600',
        tag: 'Pain Management',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Logo_of_the_Indian_Red_Cross_Society.svg/200px-Logo_of_the_Indian_Red_Cross_Society.svg.png',
    },

    {
        name: 'Remedia Pain Relief Clinic',
        initials: 'RC',
        color: 'bg-red-600',
        tag: 'Pain Management',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Logo_of_the_Indian_Red_Cross_Society.svg/200px-Logo_of_the_Indian_Red_Cross_Society.svg.png',
    }
];

const PartnerCard = ({ partner }) => {
    const [imgFailed, setImgFailed] = React.useState(false);

    return (
        <div className="flex flex-col items-center gap-2 px-8 group cursor-default">
            <div className="h-14 w-28 flex items-center justify-center">
                {!imgFailed ? (
                    <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-12 w-auto max-w-[112px] object-contain opacity-50 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div className={`h-12 w-12 rounded-full ${partner.color} flex items-center justify-center text-white font-black text-sm opacity-60 group-hover:opacity-100 transition`}>
                        {partner.initials}
                    </div>
                )}
            </div>
            <div className="text-center">
                <p className="text-xs font-bold text-gray-700 whitespace-nowrap">{partner.name}</p>
                <p className="text-[10px] text-gray-400">{partner.tag}</p>
            </div>
        </div>
    );
};

const TrustedPartners = () => {
    // Duplicate for infinite scroll
    const scrollPartners = [...partners, ...partners];

    return (
        <section className="py-12 bg-white border-y border-gray-100 overflow-hidden">
            <div className="container mx-auto px-4 mb-6">
                <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-400">
                    Trusted Partners &amp; Medical Networks
                </h3>
            </div>

            <div className="relative flex overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, -(176 * partners.length)],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: 28,
                            ease: 'linear',
                        },
                    }}
                    className="flex whitespace-nowrap items-start px-6"
                >
                    {scrollPartners.map((partner, i) => (
                        <PartnerCard key={i} partner={partner} />
                    ))}
                </motion.div>

                {/* Gradient Masks */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
};

export default TrustedPartners;
