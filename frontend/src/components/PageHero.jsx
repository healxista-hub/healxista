import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * Shared PageHero – consistent ultra-modern hero height & layout across all public pages.
 *
 * Props:
 *  badge        – { icon: LucideIcon, text: string }
 *  title        – JSX / string (supports <span> for coloring)
 *  subtitle     – string
 *  primaryBtn   – { label, icon?, href?, onClick? }
 *  secondaryBtn – { label, icon?, href?, onClick? }
 *  bg           – background image url string  (default: dark navy gradient)
 *  overlay      – tailwind bg class for overlay (default: 'bg-black/55')
 *  minHeight    – override min-h, default 'min-h-[100dvh]'
 */
const PageHero = ({
    badge,
    title,
    subtitle,
    primaryBtn,
    secondaryBtn,
    bg,
    overlay = 'bg-slate-950/60',
    className = '',
}) => {
    const BadgeIcon  = badge?.icon;
    const PrimaryIcon   = primaryBtn?.icon;
    const SecondaryIcon = secondaryBtn?.icon;

    const primaryContent = (
        <Button
            size="lg"
            className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] border-none hover:scale-105 transition-all rounded-full w-full sm:w-auto"
            onClick={primaryBtn?.onClick}
        >
            {PrimaryIcon && <PrimaryIcon className="mr-2 h-5 w-5" />}
            {primaryBtn?.label}
        </Button>
    );

    const secondaryContent = (
        <Button
            size="lg"
            variant="outline"
            className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold text-white border-white/40 bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all rounded-full w-full sm:w-auto shadow-xl"
            onClick={secondaryBtn?.onClick}
        >
            {SecondaryIcon && <SecondaryIcon className="mr-2 h-5 w-5" />}
            {secondaryBtn?.label}
        </Button>
    );

    return (
        <section
            className={`relative min-h-[100dvh] flex items-center justify-center text-white overflow-hidden py-24 ${className}`}
        >
            {/* Background Image with Parallax-like fixed attachment */}
            {bg ? (
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed scale-105"
                    style={{ backgroundImage: `url(${bg})` }}
                />
            ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900" />
            )}

            {/* Multiple Overlays for Depth */}
            <div className={`absolute inset-0 z-0 ${overlay}`} />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />

            {/* Subtle dot texture and glowing orbs */}
            <div
                className="absolute inset-0 z-0 opacity-[0.05]"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
            />
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center w-full mt-10 md:mt-0">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto space-y-8"
                >
                    {/* Badge */}
                    {badge && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full text-sm font-bold shadow-2xl"
                        >
                            {BadgeIcon ? (
                                <BadgeIcon className="h-4 w-4 text-blue-400" />
                            ) : (
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                            )}
                            {badge.text}
                        </motion.span>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] drop-shadow-2xl px-4">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    {subtitle && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto px-4 font-light text-shadow-sm"
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    {/* Buttons */}
                    {(primaryBtn || secondaryBtn) && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-8 px-4"
                        >
                            {primaryBtn && (
                                primaryBtn.href
                                    ? <Link to={primaryBtn.href} className="w-full sm:w-auto">{primaryContent}</Link>
                                    : primaryContent
                            )}
                            {secondaryBtn && (
                                secondaryBtn.href
                                    ? <Link to={secondaryBtn.href} className="w-full sm:w-auto">{secondaryContent}</Link>
                                    : secondaryContent
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Scroll indicator Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 z-20"
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                    <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 bg-white/70 rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default PageHero;
