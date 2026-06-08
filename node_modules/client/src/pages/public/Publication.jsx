import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Calendar, ChevronRight, Activity, FileText,
    Download, Eye, Share2, Bookmark, Search,
    Filter, HelpCircle, Award, Compass, HeartPulse, UserPlus
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
//  PUBLICATIONS DATA
// ─────────────────────────────────────────────
const categories = ['All', 'Emergency Medicine', 'Telehealth Technology', 'Clinical Case Studies'];

const publications = [
    {
        id: 1,
        category: 'Nanotechnology & Biomedical Research',
        title: 'Silicon Quantum Dot-Based Fluorescent Probe for Thiocyanate Detection in Human Blood',
        authors: 'Debiprasad Roy, Koushik Majhi, Maloy Kr. Mondal, Swadhin Kr. Saha, Subrata Sinha, Pranesh Chowdhury',
        journal: 'ACS Omega, Volume 3, Issue 7',
        date: '10 Jul 2018',
        doi: '10.1021/acsomega.8b00844',
        citations: 34,
        views: '12.4k',
        coverImage: '/assets/images/publication/pub1.png',
        pdfUrl: 'https://pubs.acs.org/doi/pdf/10.1021/acsomega.8b00844?ref=article_openPDF',

        abstract: 'This study presents the synthesis of allylamine-functionalized silicon quantum dots (ASQDs) as a highly sensitive fluorescent probe for selective thiocyanate detection in human blood. The developed nanomaterial demonstrates excellent photostability, strong fluorescence emission, and a detection limit as low as 1 × 10⁻¹⁰ M. The probe successfully differentiates smoker and non-smoker blood samples based on thiocyanate concentration, highlighting its potential application in biomedical diagnostics and biomarker detection.',

        body: 'Researchers synthesized highly photostable silicon quantum dots using a robust inverse micelle method followed by allylamine surface functionalization. The resulting ASQDs exhibited strong fluorescence emission at 439 nm with a quantum yield of 0.37. Fluorescence quenching studies revealed selective recognition of thiocyanate ions through a photoinduced electron transfer mechanism, with a quenching constant of 19.79 L mol⁻¹. Experimental validation on real human blood samples showed significantly higher thiocyanate concentrations in smokers (9–12 mg/L) compared to non-smokers (2–3 mg/L). The findings demonstrate the potential of ASQDs as an effective fluorescent biomarker platform for clinical diagnostics, health monitoring, and biomedical sensing applications.'
    }
    // {
    //     id: 2,
    //     category: 'Emergency Medicine',
    //     title: 'Golden Hour Trauma Response: Analysis of Pre-Hospital Critical Care Transports',
    //     authors: 'Prof. S. Sen, MD, Lead Medical Coordinator, Healxista Kolkata; Dr. A. Roy, MD',
    //     journal: 'Indian Journal of Emergency & Trauma Care, Vol. 9, Art. 45',
    //     date: '20 Mar 2026',
    //     doi: '10.5824/healxista.trauma.2026.03',
    //     citations: 34,
    //     views: '2.5k',
    //     coverImage: '/assets/images/hero/icu.jpg',
    //     pdfUrl: '/assets/docs/healxista_publication_trauma_care.pdf',
    //     abstract: 'A retrospective study evaluating medical interventions and clinical outcomes of 1,200 emergency critical care transport cases. We examine advanced life support (ALS) vs basic life support (BLS) efficacy during long-distance transits connecting Purulia and Bokaro patients to Kolkata specialty centers.',
    //     body: 'Optimal triage protocols and real-time consulting with on-call specialists during transport are pivotal. By mounting continuous patient monitoring equipment, including automated ventilators and digital ECG telemetry in our mobile ICU fleet, paramedics are empowered to stabilize critical trauma cases under distant specialist guidance. The paper demonstrates that structured digital handovers to receiving ERs reduced transit-to-surgery delays by an average of 14 minutes.'
    // },
    // {
    //     id: 3,
    //     category: 'Clinical Case Studies',
    //     title: 'Integrating Elderly Palliative Care and Home-care Fleets: A Regional Case Study',
    //     authors: 'Dr. Priya Sharma, PhD, Chief of Palliative Services; Dr. G. Chatterjee, MD',
    //     journal: 'Asia-Pacific Journal of Geriatric Medicine, Vol. 22, No. 1',
    //     date: '05 Feb 2026',
    //     doi: '10.5824/healxista.geriatric.2026.02',
    //     citations: 12,
    //     views: '1.2k',
    //     coverImage: '/assets/images/hero/home_care.png',
    //     pdfUrl: '/assets/docs/healxista_publication_telemetry.pdf',
    //     abstract: 'An evaluation of Healxista home healthcare, post-operative physiotherapy programs, and integrated old age home networks. The study measures patient feedback, mobility recovery profiles, and emergency re-admission rates among 500 senior residents.',
    //     body: 'Providing dignified, clinical-grade care at home significantly boosts senior patient recovery rates and mental health scores. Healxista integrated daily nursing services, remote health checks, and scheduled physiotherapy home sessions into a unified dashboard, keeping patients linked directly with family and local emergency crews. Results show a 40% reduction in emergency re-hospitalizations due to proactive clinical monitoring.'
    // }
];

const stats = [
    { label: 'Published Papers', value: '3 Peer-Reviewed', icon: BookOpen, color: 'text-blue-500' },
    { label: 'Total Citations', value: '34 citations', icon: Award, color: 'text-green-500' },
    { label: 'Latest Contribution', value: 'April 2026', icon: Compass, color: 'text-yellow-500' },
    { label: 'Clinical Impact', value: '10k+ Studies', icon: HeartPulse, color: 'text-red-500' },
];

// ─────────────────────────────────────────────
//  PUBLICATION CARD COMPONENT
// ─────────────────────────────────────────────
const PublicationCard = ({ pub, index }) => {
    const [expanded, setExpanded] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: pub.title,
                text: pub.abstract,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(`${pub.title} - DOI: ${pub.doi}`);
            toast.success("Citation details copied to clipboard!");
        }
    };

    const handleView = (e) => {
        e.preventDefault();
        if (pub.pdfUrl) {
            window.open(pub.pdfUrl, '_blank', 'noopener,noreferrer');
        } else {
            toast.error("PDF not available for this publication.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
            <div className="flex flex-col lg:flex-row">
                {/* Cover Image */}
                <div className="lg:w-80 h-56 lg:h-auto flex-shrink-0 overflow-hidden relative bg-slate-900">
                    <img
                        src={pub.coverImage}
                        alt={pub.title}
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent lg:bg-gradient-to-r" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full bg-blue-600 text-white shadow-lg w-max max-w-[200px] sm:max-w-[280px] truncate">
                            {pub.category}
                        </span>
                        {pub.openAccess && (
                            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-emerald-500 text-white shadow-lg w-max">
                                Open Access
                            </span>
                        )}
                        {pub.featured && (
                            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-lg w-max">
                                Featured
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" /> {pub.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5" /> {pub.views} reads
                            </span>
                            <span className="flex items-center gap-1.5 text-blue-600">
                                <FileText className="h-3.5 w-3.5" /> Citations: {pub.citations}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight mb-3">
                            {pub.title}
                        </h3>

                        {/* Authors */}
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                            <span className="text-gray-400">Authors:</span> {pub.authors}
                        </p>

                        {/* Journal & Research Info */}
                        <div className="mb-4 space-y-1">
                            <p className="text-xs italic text-gray-500">
                                {pub.journal} {pub.publisher ? `| ${pub.publisher}` : ''} {pub.status ? `(${pub.status})` : ''}
                            </p>
                            {pub.researchArea && (
                                <p className="text-xs font-semibold text-indigo-600">
                                    Research Area: {pub.researchArea}
                                </p>
                            )}
                        </div>

                        {/* Keywords */}
                        {pub.keywords && pub.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {pub.keywords.map(kw => (
                                    <span key={kw} className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Abstract */}
                        <div className="bg-slate-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Abstract</h4>
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                {pub.abstract}
                            </p>
                        </div>

                        {/* Full text Expandable */}
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4 mt-2">
                                        <h4 className="font-bold text-gray-800 mb-2">Discussion & Results:</h4>
                                        <p>{pub.body}</p>
                                        <p className="mt-2 text-xs font-mono text-gray-400">DOI Reference: {pub.doi}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                        >
                            {expanded ? "Hide Details" : "Read Full Discussion"}
                        </button>

                        <div className="flex items-center gap-3">
                            {/* View Button */}
                            <button
                                onClick={handleView}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                            >
                                <Eye className="h-4 w-4" /> View
                            </button>

                            <button
                                onClick={() => setBookmarked(!bookmarked)}
                                className={`p-2 rounded-lg border transition-colors ${bookmarked ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'hover:bg-gray-50 border-gray-200 text-gray-400'}`}
                                title="Bookmark Article"
                            >
                                <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors"
                                title="Share Citation"
                            >
                                <Share2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const Publication = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = publications.filter(pub => {
        const matchesCategory = activeCategory === 'All' || pub.category === activeCategory;
        const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pub.abstract.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <SEO
                title="Research Publications"
                description="Explore our scientific studies, telemetry research papers, and pre-hospital medical coordination strategies in India."
                keywords="publications, health research, telemedicine research, clinical case study, golden hour transport"
            />

            {/* Hero */}
            <PageHero
                bg="/assets/images/publication_hero_bg_new.png"
                badge={{ icon: BookOpen, text: 'Clinical Research & Innovation' }}
                title={<>Research <span className="text-yellow-300">Activites</span></>}
                subtitle="Read our peer-reviewed research papers and telemetry analytics advancing pre-hospital medical dispatches, emergency trauma care, and clinical home health."
                primaryBtn={{ label: 'Explore Studies', onClick: () => document.querySelector('#studies-list')?.scrollIntoView({ behavior: 'smooth' }) }}
                secondaryBtn={{ label: 'Back to News', href: '/news' }}
            />

            {/* Research Overview & Opportunities */}
            <section className="py-20 bg-slate-50 border-b border-gray-100 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 -skew-x-12 transform origin-top-right z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                        {/* Text Content */}
                        <div className="lg:w-1/2 text-left">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                                Advancing <span className="text-blue-600">Medical Science</span>
                            </h2>
                            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
                                <p>
                                    Our research program is dedicated to advancing scientific knowledge through innovative, interdisciplinary, and impactful investigations. We actively engage in cutting-edge research aimed at addressing important challenges in healthcare, medicine, and related scientific fields.
                                </p>
                                <p>
                                    Explore our recent and ongoing research projects, which span fundamental discoveries, translational studies, and the development of novel therapeutic strategies. Our work is disseminated through publications in leading peer-reviewed scientific journals and presentations at national and international conferences.
                                </p>
                                <p>
                                    We are committed to fostering scientific excellence, collaboration, and innovation, with the goal of translating research findings into meaningful solutions that benefit society. We invite you to discover our latest achievements, publications, and current research initiatives that are shaping the future of medical science and healthcare.
                                </p>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="lg:w-1/2 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6 w-full">
                            {/* Ongoing Project */}
                            <div className="flex-1 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                    <Activity className="h-32 w-32 text-blue-600" />
                                </div>
                                <div>
                                    <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                                        <Activity className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Ongoing Projects</h3>
                                    <p className="text-slate-600 mb-8 leading-relaxed relative z-10">
                                        Explore our active clinical trials, telemedicine optimization studies, and AI-driven emergency response algorithms currently in development.
                                    </p>
                                </div>
                                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 font-bold rounded-xl h-12 px-6 w-fit relative z-10">
                                    View Projects
                                </Button>
                            </div>

                            {/* Join Us */}
                            <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-[0_8px_30px_rgb(59,130,246,0.3)] border border-blue-500 text-white hover:shadow-2xl hover:shadow-blue-900/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute -top-4 -right-4 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                    <UserPlus className="h-32 w-32 text-white" />
                                </div>
                                <div>
                                    <div className="h-14 w-14 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm relative z-10">
                                        <UserPlus className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 relative z-10">Join Us</h3>
                                    <p className="text-blue-50 mb-8 leading-relaxed relative z-10">
                                        Our organization is seeking exceptional researchers with strong motivation and commitment to drive scientific innovation in the development of advanced medical treatments and therapeutic solutions.
                                    </p>
                                </div>
                                <div className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-md relative z-10">
                                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Contact for Opportunities</p>
                                    <p className="text-sm font-medium mb-1">Email: info@healxista.com, healxista@gmail.com</p>
                                    <p className="text-sm font-medium">Phone: +91 92393 62736</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="text-center md:border-r last:border-0 border-gray-100"
                            >
                                <Icon className={`h-6 w-6 mx-auto mb-1 ${s.color}`} />
                                <p className="text-lg md:text-xl font-extrabold text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{s.label}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Body */}
            <div id="studies-list" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                    {/* Search Input */}
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search title, authors or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 text-sm shadow-sm transition-all"
                        />
                    </div>

                    {/* Category List */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all border ${activeCategory === cat
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Publications Count */}
                <p className="text-xs sm:text-sm text-gray-400 mb-6 font-semibold">
                    Showing <span className="font-extrabold text-gray-700">{filtered.length}</span> research papers
                </p>

                {/* List items */}
                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        {filtered.length > 0 ? (
                            filtered.map((pub, index) => (
                                <PublicationCard key={pub.id} pub={pub} index={index} />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200"
                            >
                                <HelpCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-700 mb-2">No publications found</h3>
                                <p className="text-gray-400 text-sm">Try tweaking your search keyword or clearing the filters.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Publication;
