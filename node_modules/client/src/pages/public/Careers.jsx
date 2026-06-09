import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, MapPin, DollarSign, Clock, Users, ArrowRight,
    Search, Filter, Send, X, Award, Heart, ShieldCheck, Mail
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
//  CAREERS DATA
// ─────────────────────────────────────────────
const departments = ['All', 'Clinical', 'Operations', 'Engineering'];
const locations = ['All', 'Kolkata', 'Purulia', 'Bokaro', 'Remote'];

const jobOpenings = [
    {
        id: 1,
        title: 'Office Executive',
        department: 'Operations',
        location: 'Purulia',
        salary: '₹10,000 - ₹12,000 / month',
        type: 'Full-time (On-site)',
        experience: 'Graduate / Freshers welcome',
        description: 'Manage front-office operations, maintain digital health logs, handle call reception, and assist visitors and medical staff in our Purulia office.',
        responsibilities: [
            'Maintain daily office schedules, visitor logs, and files.',
            'Maintain digital medical entries and dispatch records accurately on computers.',
            'Assist visitors, verify documents, and direct queries to the operations team.'
        ],
        advertisement: 'Healxista is expanding its regional operational headquarters in Purulia. We are looking for a reliable, tech-savvy Office Executive to manage our day-to-day front office administrative functions, support clinical team scheduling, and streamline communication between patients, ambulance dispatch drivers, and administrators.',
        qualification: 'Graduate in any stream (B.A., B.Sc., B.Com., or equivalent). Basic certification or diploma in Computer Applications is highly preferred.',
        experienceDetails: 'Freshers or experienced applicants with basic computer capabilities are welcome. Must be proficient in Microsoft Office (Word, Excel), simple email client tasks, and internet navigation.',
        recruitmentStages: [
            { stage: '1. CV Screening', desc: 'Initial review of educational qualifications and background details.' },
            { stage: '2. Computer Practical Test', desc: 'Hands-on practical assessment of MS Excel data logs, email drafting, and typing.' },
            { stage: '3. Personal Interview', desc: 'Final round focusing on interpersonal skills, helpline responsiveness, and shift availability at Purulia HQ.' }
        ],
        howToApply: 'Please apply by sending your resume/CV and cover letter via email to info@healxista.com and healxista@gmail.com with the subject line "Office Executive Application".'
    }
];

const expiredJobs = [
    {
        id: 101,
        title: 'Emergency Trauma Consultant / Surgeon',
        department: 'Clinical',
        location: 'Kolkata',
        type: 'Full-time (On-site)',
        experience: '5+ Years MD / MS',
        closedDate: 'Closed on 15 Apr 2026',
        description: 'Triaged and managed emergency room operations, guided mobile ICU telemetry transfers, and conducted pre-hospital trauma interventions.'
    },
    {
        id: 102,
        title: 'Advanced Life Support (ALS) Ambulance Driver',
        department: 'Operations',
        location: 'Purulia',
        type: 'Shift-based (On-site)',
        experience: '3+ Years Commercial Driving',
        closedDate: 'Closed on 01 Apr 2026',
        description: 'Operated advanced life support vehicles, navigated GPS dispatch routing, and maintained critical vehicle systems.'
    },
    {
        id: 103,
        title: 'Full-Stack Software Engineer (React / Node)',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time (Remote)',
        experience: '2+ Years Web App Development',
        closedDate: 'Closed on 10 Mar 2026',
        description: 'Optimized live ambulance telemetry streaming, scaled backend WebSockets, and updated administrative booking panels.'
    }
];

const perks = [
    { title: 'Top-tier Health Insurance', description: 'Comprehensive medical cover for employees and family.', icon: Heart, color: 'text-red-500 bg-red-50' },
    { title: 'Continuous Training', description: 'Paid clinical certifications and professional dev allowances.', icon: Award, color: 'text-blue-500 bg-blue-50' },
    { title: 'Safe & Secure Workplace', description: 'Fully compliant, verified, and progressive regional networks.', icon: ShieldCheck, color: 'text-green-500 bg-green-50' },
];

const Careers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingJob, setViewingJob] = useState(null);

    const filteredJobs = jobOpenings.filter(job => {
        return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <SEO
                title="Careers - Join the Team"
                description="Become a part of Healxista. Browse our clinical, technical, and operational job openings in Kolkata, Purulia, and Bokaro."
                keywords="careers, jobs, emergency team, ambulance driver jobs, nurse jobs, doctor jobs, software jobs, Kolkata, Purulia, Bokaro"
            />

            {/* Hero */}
            <PageHero
                bg="/assets/images/careers_hero_bg.png"
                badge={{ icon: Briefcase, text: 'We are hiring!' }}
                title={<>Join the <span className="text-yellow-300">Healxista</span> Fleet</>}
                subtitle="Empower emergency response systems in regional India. We are recruiting talented clinicians, operators, and engineers passionate about saving lives."
                primaryBtn={{ label: 'View Openings', onClick: () => document.querySelector('#openings')?.scrollIntoView({ behavior: 'smooth' }) }}
                secondaryBtn={{ label: 'Contact HR', href: '/contact' }}
            />

            {/* Perks Row */}
            <section className="bg-white border-b py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900">Why Work With Healxista?</h2>
                        <p className="text-gray-500 mt-3 text-base">We prioritize our employees' well-being and growth, providing robust benefits and a mission-driven collaborative workspace.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {perks.map((perk, i) => {
                            const Icon = perk.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className={`p-4 w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${perk.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{perk.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{perk.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Job Listings Area */}
            <section id="openings" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900">Explore Open Positions</h2>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base">Find your fit. Use the search option below to browse our current clinical, operational, and development roles.</p>
                </div>

                {/* Filter and Search controls */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 flex gap-4 justify-between items-center">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search open positions by keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition-all"
                        />
                    </div>
                </div>



                {/* Job Cards list */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job, idx) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                >
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-100 text-slate-700 uppercase tracking-wider">
                                                {job.department}
                                            </span>
                                            <span className="inline-flex items-center text-xs font-bold text-gray-400">
                                                <MapPin className="h-3.5 w-3.5 mr-1 text-red-500" /> {job.location}
                                            </span>
                                            <span className="inline-flex items-center text-xs font-bold text-gray-400">
                                                <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" /> {job.type}
                                            </span>
                                        </div>

                                        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 max-w-3xl leading-relaxed font-medium">
                                            {job.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 pt-1">
                                            <span>Salary Bracket: <strong className="text-gray-700">{job.salary}</strong></span>
                                            <span>Required Experience: <strong className="text-gray-700">{job.experience}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => setViewingJob(job)}
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-sm font-black rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto"
                            >
                                <img
                                    src="/assets/images/careers_no_openings.png"
                                    alt="No active openings - Join our talent pool"
                                    className="w-80 h-auto mx-auto mb-8 rounded-2xl shadow-sm object-cover"
                                />
                                <h3 className="text-2xl font-black text-gray-900 mb-2">No Active Openings Right Now</h3>
                                <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-6 font-medium">
                                    We are currently fully staffed across our Kolkata, Purulia, and Bokaro locations. However, we are always on the lookout for exceptional talent. Join our regional talent pool by sending us a general application below.
                                </p>
                                <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl max-w-md mx-auto">
                                    Please send your general application directly via email to <a href="mailto:info@healxista.com" className="underline font-extrabold hover:text-red-700">info@healxista.com</a> and <a href="mailto:healxista@gmail.com" className="underline font-extrabold hover:text-red-700">healxista@gmail.com</a>.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* PAST / EXPIRED OPENINGS */}
            <section className="py-20 bg-slate-150/45 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-3 py-1.5 rounded-full">Archive</span>
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-3">Recently Closed Positions</h2>
                        <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed">
                            These are roles we have recently filled. We display them to showcase our recurring hiring domains. If you believe your profile is an ideal fit, please submit a General Application above.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {expiredJobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden opacity-75 group hover:opacity-100 hover:shadow-md transition-all duration-300"
                            >
                                {/* Diagonal Closed Tag */}
                                <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-bl-xl uppercase tracking-wider">
                                    Filled / Expired
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-400">
                                        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px]">
                                            {job.department}
                                        </span>
                                        <span>{job.location}</span>
                                        <span>•</span>
                                        <span>{job.type}</span>
                                    </div>

                                    <h3 className="text-lg font-extrabold text-slate-700 leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">
                                        {job.title}
                                    </h3>

                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                        {job.description}
                                    </p>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 font-sans">
                                        <span>{job.experience}</span>
                                        <span className="text-red-500 font-extrabold">{job.closedDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* JOB DETAILS MODAL */}
            <AnimatePresence>
                {viewingJob && (
                    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setViewingJob(null)}
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
                        >
                            <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 w-full" />

                            {/* Modal Header */}
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                                <div>
                                    <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">
                                        Job Specification Details
                                    </span>
                                    <h3 className="text-xl font-black text-gray-900 mt-1">{viewingJob.title}</h3>
                                </div>
                                <button
                                    onClick={() => setViewingJob(null)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
                                {/* Overview Banner */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                                    <div>
                                        <p className="font-bold text-gray-400 uppercase tracking-wider">Department</p>
                                        <p className="font-extrabold text-gray-700 mt-0.5">{viewingJob.department}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                        <p className="font-extrabold text-gray-700 mt-0.5">{viewingJob.location}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-400 uppercase tracking-wider">Employment</p>
                                        <p className="font-extrabold text-gray-700 mt-0.5">{viewingJob.type}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-400 uppercase tracking-wider">Salary Offer</p>
                                        <p className="font-extrabold text-green-600 mt-0.5">{viewingJob.salary}</p>
                                    </div>
                                </div>

                                {/* Section: Advertisement Details */}
                                {viewingJob.advertisement && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-black text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                                            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                                            Job Overview & Advertisement
                                        </h4>
                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                            {viewingJob.advertisement}
                                        </p>
                                    </div>
                                )}

                                {/* Qualifications & Experience */}
                                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-black text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                                            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                                            Required Qualifications
                                        </h4>
                                        <p className="text-xs text-gray-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                            {viewingJob.qualification || "Graduate in any stream."}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-black text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                                            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                                            Required Experience / Skills
                                        </h4>
                                        <p className="text-xs text-gray-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                            {viewingJob.experienceDetails || viewingJob.experience}
                                        </p>
                                    </div>
                                </div>

                                {/* Section: Key Responsibilities */}
                                {viewingJob.responsibilities && (
                                    <div className="space-y-2.5">
                                        <h4 className="text-sm font-black text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                                            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                                            Key Responsibilities
                                        </h4>
                                        <ul className="grid gap-2 text-xs text-gray-600 font-medium">
                                            {viewingJob.responsibilities.map((resp, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-blue-500 mt-0.5">•</span>
                                                    <span>{resp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Section: Recruitment Stages */}
                                {viewingJob.recruitmentStages && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-black text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                                            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                                            Recruitment Stages & Selection
                                        </h4>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {viewingJob.recruitmentStages.map((stage, i) => (
                                                <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                                    <h5 className="text-[11px] font-black text-slate-800">{stage.stage}</h5>
                                                    <p className="text-[10px] text-gray-500 mt-1 leading-normal font-medium">{stage.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section: How to Apply */}
                                {viewingJob.howToApply && (
                                    <div className="space-y-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                                            How to Apply
                                        </h4>
                                        <p className="text-[11px] text-blue-800/90 leading-relaxed font-semibold">
                                            {viewingJob.howToApply}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
                                <button
                                    onClick={() => setViewingJob(null)}
                                    className="px-6 h-11 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border rounded-xl transition-all font-sans"
                                >
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Careers;
