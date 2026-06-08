import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Calendar, ChevronRight, Activity, Newspaper,
    Tag, ChevronDown, ChevronUp, Share2, Bookmark, Eye,
    Megaphone, AlertCircle, Star, TrendingUp, Users, Clock, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const categories = ['All', 'News', 'Notification', 'Update', 'Event'];

const articles = [
    {
        id: 1,
        category: 'News',
        title: 'Healxista Launches Comprehensive Lab Testing Services in Kolkata, Purulia & Bokaro',
        summary: 'We are thrilled to announce that our home-sample collection service for comprehensive lab tests is now available across our core service regions.',
        body: `Our expansion into lab testing is a significant milestone. Starting this month, registered users on the Healxista platform in Kolkata, Purulia, and Bokaro can book home-sample collection for over 300+ diagnostic tests including CBC, lipid profile, thyroid function, blood glucose, and cancer markers. Certified technicians will arrive within 4 hours of booking, and digital reports are delivered within 24 hours directly to your dashboard. This service is currently active exclusively in our primary service areas. We are partnering with NABL-accredited laboratories to ensure accuracy and reliability. Book your first test through the platform today.`,
        date: '01 Apr 2026',
        readTime: '3 min read',
        author: 'Healxista Editorial',
        image: '/assets/images/hero/doctor.jpg',
        icon: Activity,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
        views: '2.4k',
        pinned: true,
    },
    {
        id: 2,
        category: 'Notification',
        title: 'Scheduled Platform Maintenance — Sunday 2 AM to 4 AM IST',
        summary: 'Our backend servers will undergo scheduled maintenance. Emergency ambulance booking will still be available via our hotline.',
        body: `Dear Healxista Users, Please be informed that our platform will undergo scheduled maintenance this Sunday, April 6, 2026 from 2:00 AM to 4:00 AM IST. During this window, online booking features including lab tests, doctor appointments, and physiotherapy scheduling will be temporarily unavailable. However, our 24×7 emergency ambulance hotline (9239362736) will remain fully operational throughout. We apologise for any inconvenience caused. Our engineering team is upgrading server infrastructure to improve response times and platform reliability. Thank you for your patience and continued trust in Healxista.`,
        date: '28 Mar 2026',
        readTime: '2 min read',
        author: 'Platform Team',
        image: '/assets/images/hero/hospital.jpg',
        icon: Bell,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700',
        views: '1.1k',
        pinned: false,
    },
    {
        id: 3,
        category: 'Update',
        title: '12 New Premium Old Age Homes Verified and Added to the Network',
        summary: 'Healxista has actively verified and integrated 12 new premium old age homes onto the platform, ensuring highest quality palliative care standards.',
        body: `Following a rigorous 3-month verification process, Healxista is proud to introduce 12 new old age home providers to the platform. Each facility was inspected against 47 quality parameters covering medical staffing, hygiene, nutritional standards, mobility assistance, and recreational programming. These new partners are located within our service network in Kolkata, Purulia, and Bokaro. Families can now browse facility profiles, review photos, check availability, and schedule direct tours — all from within the Healxista app. Our goal is to give families complete confidence when choosing care for their elderly loved ones.`,
        date: '22 Mar 2026',
        readTime: '4 min read',
        author: 'Partnership Desk',
        image: '/assets/images/hero/home_care.png',
        icon: Star,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        badge: 'bg-green-100 text-green-700',
        views: '980',
        pinned: false,
    },
    {
        id: 4,
        category: 'Event',
        title: 'Free Health Camp: Purulia HQ, Raghabpur More — April 10, 2026',
        summary: 'Healxista partners with Apollo Diagnostics and GE Healthcare to offer free blood pressure, diabetes, and ECG screening for all residents.',
        body: `Healxista is organizing a Free Community Health Camp on April 10, 2026 at Raghabpur More, Purulia from 9:00 AM to 5:00 PM. Services available at the camp include Blood Pressure Monitoring, Diabetes Screening (Random Blood Sugar), ECG Testing, BMI Assessment, Free Doctor Consultation, and Eye Check-up. There are no registration fees. Participants are advised to carry a photo ID. The event will be held at the Healxista ground booth near our new headquarters. Walk-ins are welcome. We expect to serve over 1,500 residents. Bring your family.`,
        date: '18 Mar 2026',
        readTime: '2 min read',
        author: 'Community Team',
        image: '/assets/images/hero/doctor.jpg',
        icon: Megaphone,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-700',
        views: '3.7k',
        pinned: false,
    },
    {
        id: 5,
        category: 'News',
        title: 'Healxista Records 10,000+ Successful Ambulance Dispatches in Q1 2026',
        summary: 'The platform crossed a landmark milestone in Q1, recording over 10,000 successful emergency dispatches with an average response time under 8 minutes.',
        body: `In the first quarter of 2026, Healxista's ambulance network achieved a historic milestone — 10,423 successful emergency dispatches across Kolkata, Purulia, and Bokaro. Our average response time improved from 11.2 minutes (Q4 2025) to 7.8 minutes (Q1 2026), contributing to an estimated 600+ lives saved during critical golden-hour interventions. Key driver of this improvement: AI-powered dispatch routing introduced in February 2026. Our algorithm now assigns the closest available ambulance within 45 seconds of booking confirmation, reducing dispatcher decision time by 72%. We thank every ambulance driver, paramedic, and partner hospital who made this possible.`,
        date: '10 Mar 2026',
        readTime: '5 min read',
        author: 'Analytics Team',
        image: '/assets/images/hero/road.jpg',
        icon: TrendingUp,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        badge: 'bg-red-100 text-red-700',
        views: '4.2k',
        pinned: false,
    },
];

const stats = [
    { label: 'Articles Published', value: 'Recent Updates', icon: Newspaper, color: 'text-blue-500' },
    { label: 'Verified Information', value: '100% Verified', icon: ShieldCheck, color: 'text-green-500' },
    { label: 'Last Updated', value: 'Apr 2026', icon: Clock, color: 'text-yellow-500' },
    { label: 'Notifications', value: 'Real-time', icon: Bell, color: 'text-red-500' },
];

// ─────────────────────────────────────────────
//  ARTICLE CARD COMPONENT
// ─────────────────────────────────────────────
const ArticleCard = ({ article, index }) => {
    const [expanded, setExpanded] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const Icon = article.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 ${article.pinned ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}
        >
            {/* Pinned Badge */}
            {article.pinned && (
                <div className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> PINNED ANNOUNCEMENT
                </div>
            )}

            <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-64 lg:w-72 h-52 md:h-auto flex-shrink-0 overflow-hidden relative">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
                    {/* Category pill over image */}
                    <div className="absolute top-3 left-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${article.badge}`}>
                            {article.category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> {article.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> {article.readTime}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" /> {article.views} views
                            </span>
                            <span className="flex items-center gap-1">
                                <Tag className="h-3.5 w-3.5" /> {article.author}
                            </span>
                        </div>

                        {/* Title */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${article.iconBg}`}>
                                <Icon className={`h-4 w-4 ${article.iconColor}`} />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                                {article.title}
                            </h3>
                        </div>

                        {/* Summary */}
                        <p className="text-gray-500 text-sm leading-relaxed mb-3">
                            {article.summary}
                        </p>

                        {/* Expandable full body */}
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3 mt-1">
                                        {article.body}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors group"
                        >
                            {expanded ? (
                                <><ChevronUp className="h-4 w-4" /> Hide Details</>
                            ) : (
                                <><ChevronDown className="h-4 w-4" /> Read Full Story</>
                            )}
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setBookmarked(!bookmarked)}
                                className={`p-2 rounded-lg transition-colors ${bookmarked ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                title="Bookmark"
                            >
                                <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
                            </button>
                            <button
                                onClick={() => navigator.share?.({ title: article.title, text: article.summary })}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                                title="Share"
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
//  MAIN PAGE
// ─────────────────────────────────────────────
const NewsUpdates = () => {
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = activeCategory === 'All'
        ? articles
        : articles.filter(a => a.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                title="News & Updates"
                description="Stay informed with the latest Healxista news, platform notifications, healthcare updates and organizational events."
                keywords="news, updates, notifications, health news, healxista announcements"
            />

            {/* Hero */}
            <PageHero
                bg="/assets/images/news_hero_bg.png"
                badge={{ icon: Newspaper, text: 'Latest from Healxista' }}
                title={<>News & <span className="text-yellow-300">Updates</span></>}
                subtitle="Stay informed on recent platform updates, important announcements, health events, and our expanding network of healthcare providers."
                primaryBtn={{ label: 'Subscribe to Alerts', href: '/contact' }}
                secondaryBtn={{ label: 'View All Services', href: '/services' }}
            />

            {/* Stats Bar */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="text-center"
                            >
                                <Icon className={`h-6 w-6 mx-auto mb-1 ${s.color}`} />
                                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-400">{s.label}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Body */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeCategory === cat
                                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Article Count */}
                <p className="text-sm text-gray-400 mb-6">
                    Showing <span className="font-bold text-gray-700">{filtered.length}</span> {activeCategory !== 'All' ? activeCategory : ''} articles
                </p>

                {/* Articles List */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {filtered.map((article, index) => (
                            <ArticleCard key={article.id} article={article} index={index} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center bg-gradient-to-br from-slate-900 to-red-900 rounded-3xl p-10 text-white overflow-hidden relative"
                >
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
                    <div className="relative z-10">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Want updates in your inbox?</h2>
                        <p className="text-white/75 max-w-lg mx-auto mb-8 text-sm sm:text-base">
                            Leave us your contact and we'll notify you about new services, health camps, and important platform announcements.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-full text-white bg-red-600 hover:bg-red-700 shadow-lg"
                            >
                                Get Notified <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link
                                to="/register/user"
                                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-base font-bold rounded-full text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                            >
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NewsUpdates;
