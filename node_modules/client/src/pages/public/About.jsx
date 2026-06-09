import React from 'react';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, HeartPulse, Shield, Users, Clock, Award, Activity, Linkedin, Mail, Github, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageHero from '@/components/PageHero';

const stats = [
    { label: 'Lives Saved', value: '1500+', icon: HeartPulse, color: 'text-red-500' },
    { label: 'Active Ambulances', value: '120+', icon: Activity, color: 'text-blue-500' },
    { label: 'Partner Hospitals', value: '30+', icon: Shield, color: 'text-green-500' },
    { label: 'Expert Doctors', value: '50+', icon: Users, color: 'text-purple-500' }
];

const teamMembers = [
    {
        name: 'Dr. Susovan Patra',
        role: 'Co-Founder | MBBS, MD, FPM, FCPM, CCEBDM',
        image: '/assets/images/team/sosovan.png',
        description: 'Experienced clinician specializing in advanced pain management.',
        fullBio: 'Dr. Susovan Patra is the Medical Director and Co-Founder of Remedia Pain Relief Clinic, dedicated to delivering advanced, patient-centric care in pain management. With over a decade of clinical experience and strong academic credentials, he specializes in interventional pain medicine and minimally invasive treatments. His leadership is driven by a commitment to evidence-based practices, ethical care, and continuous innovation. He champions a multidisciplinary approach to improve outcomes and enhance the quality of life for patients suffering from acute and chronic pain.',
        expertise: ['Interventional Pain Medicine', 'Emergency Care', 'Healthcare Strategy', 'Medical Ethics'],
        social: {
            linkedin: 'https://in.linkedin.com/in/dr-susovan-patra-a1aa4926b',
            email: 'info@healxista.com'
        }
    },
    {
        name: 'Dr. Kaushik Majhi',
        role: 'Co-Founder | Ph.D., Postdoctoral Fellow',
        image: '/assets/images/team/kaoshik.png',
        description: 'Scientist and entrepreneur driving innovation in healthcare systems.',
        fullBio: 'Dr. Kaushik Majhi is an internationally trained scientist and entrepreneur, bringing together deep research expertise and strategic leadership. He earned his Ph.D. in Chemistry from Visva-Bharati University and completed his postdoctoral research at the Weizmann Institute of Science, Israel. His work has been published in leading international journals, reflecting strong analytical and innovative capabilities. At Healxista, he leads vision, operations, and growth—bridging science with scalable healthcare solutions to make quality services more accessible and efficient.',
        expertise: ['Scientific Research', 'Operational Strategy', 'Innovation Management', 'Public Health Systems'],
        social: {
            linkedin: 'https://in.linkedin.com/in/koushik-majhi-a2971730',
            email: 'info@healxista.com'
        }
    },
    {
        name: 'Swarnamoni Mahato',
        role: 'Co-Founder | Software Engineer',
        image: '/assets/images/team/swarana.png',
        description: 'Frontend specialist focused on intuitive user experiences.',
        fullBio: 'Swarnamoni Mahato plays a key role in crafting the user experience of the Healxista platform. Specializing in frontend development and UI/UX design, she ensures the platform is visually appealing, responsive, and easy to use. Her work enhances accessibility and performance for both patients and healthcare providers.',
        expertise: ['Frontend Development', 'UI/UX Design', 'React.js', 'Web Performance'],
        social: {
            linkedin: 'https://linkedin.com/in/swarnamonimahato',
            github: 'https://github.com/swarnamonimahato',
            email: 'info@healxista.com'
        }
    },
    {
        name: 'Belarani Mahato',
        role: 'Pharmacy Advisor | M.Pharm., B.Pharm., D.Pharm.',
        image: '/assets/images/team/belarani.png',
        description: 'Pharmacy expert specializing in clinical research and drug safety.',
        fullBio: 'Belarani Mahato is a highly qualified pharmacy professional with extensive academic and clinical experience. She previously worked at Apollo Hospital, Kolkata, gaining hands-on expertise in patient care and medication management. At Healxista, she contributes as an independent Pharmacy Advisor, providing guidance on pharmaceutical practices, drug safety, and healthcare awareness. Her role is aligned with professional standards and regulatory compliance, ensuring ethical and impactful contributions.',
        expertise: ['Pharmacology', 'Clinical Research', 'Drug Safety', 'Healthcare Advisory'],
        social: {
            linkedin: '#',
            email: 'info@healxista.com'
        }
    }
];

const certifications = [
    {
        id: 1,
        title: 'Clinical Establishment License',
        authority: 'Department of Health & Family Welfare, Govt. of West Bengal',
        refNo: 'Reg No: CE/2026/723101',
        icon: Shield,
        description: 'Certified clinical emergency establishment for advanced pre-hospital triage and mobile ICU patient transport operations across Kolkata and Purulia.',
        issueDate: '08 Jan 2026',
        validity: 'Lifetime License Copy',
        scope: '24/7 Mobile ICU Transport Fleet coordination, Pre-Hospital Emergency Triage, Diagnostic Services.'
    },
    {
        id: 2,
        title: 'Startup India DPIIT Recognition',
        authority: 'Ministry of Commerce & Industry, Govt. of India',
        refNo: 'DPIIT Ref: DIPP139284/2026',
        icon: Award,
        description: 'Recognized startup for smart pre-hospital emergency vehicle dispatch optimization routing and digital telemetry integration systems.',
        issueDate: '15 Mar 2026',
        validity: 'Valid up to 10 Years',
        scope: 'Real-time GPS Dispatch System, Patient Telemetry Synchronization, Digital Ambulance Fleet Management.'
    },
    {
        id: 3,
        title: 'ISO 9001:2015 Accreditation',
        authority: 'IAF Quality Council & Accreditation Body',
        refNo: 'Accred ID: QMS-9001-49210',
        icon: CheckCircle2,
        description: 'Global quality standard certification covering ambulance operations, logistics dispatch, diagnostic collections, and clinical team triage protocols.',
        issueDate: '12 Feb 2026',
        validity: 'Valid up to Feb 2029',
        scope: 'Quality Dispatch Management, Standardized Med Transit, Patient Care Feedback Logs.'
    },
    {
        id: 4,
        title: 'NHA & ABDM Compliance Cert',
        authority: 'National Health Authority (NHA), Govt. of India',
        refNo: 'ABDM ID: ABDM-M3-48190',
        icon: HeartPulse,
        description: 'Officially certified compliance partner for integration with Ayushman Bharat Digital Mission guidelines supporting digital health lockers.',
        issueDate: '01 Apr 2026',
        validity: 'Permanent Compliance',
        scope: 'ABHA Card ID Integration, Secure Patient Consent Management, Interoperable Electronic Medical Records.'
    }
];

const About = () => {
    const navigate = useNavigate();
    const [selectedMember, setSelectedMember] = React.useState(null);
    const [selectedCert, setSelectedCert] = React.useState(null);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <SEO
                title="About Us"
                description="Learn about Healxista's mission to redefine emergency care. Our experienced team of doctors and paramedics provide fast, reliable medical assistance."
                keywords="about, mission, medical assistance, paramedics, emergency care"
            />
            {/* HERO SECTION */}
            <PageHero
                bg="/assets/images/hero/hospital.jpg"
                badge={{ icon: Shield, text: 'Trusted Healthcare Partner' }}
                title={<>Redefining <span className="text-yellow-300">Emergency Care</span></>}
                subtitle="Healxista is India's fastest growing emergency response network, seamlessly blending cutting-edge technology with compassionate care."
                primaryBtn={{ label: 'Explore Our Services', onClick: () => navigate('/services') }}
                secondaryBtn={{ label: 'Contact Us', href: '/contact' }}
            />

            {/* MISSION & VISION */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-10 md:p-14 rounded-3xl shadow-xl hover:shadow-2xl transition border-none"
                        >
                            <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                                <Target className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4 text-slate-900">Our Mission</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                To provide rapid, reliable, and compassionate medical assistance to everyone, everywhere.
                                We strive to bridge the gap between patients and critical care through innovative technology and a dedicated fleet.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-10 md:p-14 rounded-3xl shadow-xl hover:shadow-2xl transition border-none"
                        >
                            <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                <Eye className="h-8 w-8 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4 text-slate-900">Our Vision</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                To create a world where no life is lost due to delayed medical care. We envision a universal, seamlessly integrated healthcare response system accessible to all.
                            </p>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-16 bg-blue-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Our Impact in Numbers</h2>
                        <p className="text-white/80">Delivering excellence every single day.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm"
                            >
                                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white mb-4">
                                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{stat.value}</h3>
                                <p className="text-white/80 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CORE VALUES */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Core Values</h2>
                        <p className="text-gray-600 text-lg">
                            The principles that guide our every action and decision.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                icon: Clock,
                                title: 'Speed & Reliability',
                                desc: 'Time is life. We prioritize rapid response times and dependable service.',
                                color: 'bg-yellow-100 text-yellow-600'
                            },
                            {
                                icon: HeartPulse,
                                title: 'Compassionate Care',
                                desc: 'We treat every patient as family, ensuring comfort and empathy.',
                                color: 'bg-red-100 text-red-600'
                            },
                            {
                                icon: Award,
                                title: 'Medical Excellence',
                                desc: 'Our paramedics and doctors adhere to the highest clinical standards.',
                                color: 'bg-blue-100 text-blue-600'
                            }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-8 bg-gray-50 rounded-3xl hover:shadow-lg transition-shadow border border-gray-100"
                            >
                                <div className={`mx-auto h-16 w-16 flex items-center justify-center rounded-2xl mb-6 ${value.color}`}>
                                    <value.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* REGISTRATION & CERTIFICATIONS */}
            <section className="py-20 bg-white border-t border-b border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3.5 py-2 rounded-full">Legal Registry & compliance</span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mt-4">Registrations & Certifications</h2>
                        <p className="text-gray-600 text-lg mt-2">
                            Healxista is fully licensed, accredited, and recognized by national clinical and technological bodies.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {certifications.map((cert) => (
                            <motion.div
                                key={cert.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group text-left"
                            >
                                <div className="space-y-4">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <cert.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 leading-snug">{cert.title}</h3>
                                        <p className="text-xs text-red-600 font-bold tracking-wider mt-1">{cert.refNo}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{cert.description}</p>
                                </div>

                                <button
                                    onClick={() => setSelectedCert(cert)}
                                    className="mt-6 w-full h-11 text-xs font-black bg-white hover:bg-slate-100 border text-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    Verify Certificate <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Meet Our Leadership</h2>
                        <p className="text-gray-600 text-lg">Guiding our mission with experience and dedication.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {teamMembers.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card
                                    className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition group cursor-pointer"
                                    onClick={() => setSelectedMember(member)}
                                >
                                    <div className="h-64 overflow-hidden relative group">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name) + '&background=random';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                            <span className="text-white font-bold bg-blue-600 px-4 py-2 rounded-full text-sm">View Profile</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 text-center bg-white relative z-10">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                                        <p className="text-red-600 font-semibold text-sm mb-4">{member.role}</p>
                                        <p className="text-gray-600 text-sm pb-2">{member.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Ready to make a difference?</h2>
                    <p className="text-xl text-gray-600 mb-10 font-medium">
                        Join our network as a partner hospital, ambulance driver, or medical professional.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 font-bold"
                            onClick={() => navigate('/contact')}
                        >
                            Partner With Us
                        </Button>
                        <Button
                            variant="outline"
                            className="h-14 px-8 text-lg border-gray-300 text-gray-700 hover:bg-gray-50 font-bold"
                            onClick={() => navigate('/services')}
                        >
                            View All Services
                        </Button>
                    </div>
                </div>
            </section>

            {/* TEAM DETAIL MODAL */}
            <AnimatePresence>
                {selectedMember && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMember(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"
                            >
                                <X className="h-6 w-6 text-slate-600" />
                            </button>

                            {/* Left: Image */}
                            <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
                                <img
                                    src={selectedMember.image}
                                    alt={selectedMember.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedMember.name) + '&background=random&size=512';
                                    }}
                                />
                            </div>

                            {/* Right: Details */}
                            <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto">
                                <div className="mb-8">
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">{selectedMember.name}</h2>
                                    <p className="text-xl font-bold text-red-600 uppercase tracking-wider">{selectedMember.role}</p>
                                </div>

                                <div className="space-y-8">
                                    {/* Bio */}
                                    <div>
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">About Me</h3>
                                        <p className="text-slate-600 text-lg leading-relaxed">{selectedMember.fullBio}</p>
                                    </div>

                                    {/* Expertise */}
                                    <div>
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Core Expertise</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMember.expertise.map(skill => (
                                                <span key={skill} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Connect */}
                                    <div className="pt-4 flex flex-wrap gap-4">
                                        {selectedMember.social.linkedin && selectedMember.social.linkedin !== '#' && (
                                            <a href={selectedMember.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition shadow-lg">
                                                <Linkedin className="h-5 w-5" />
                                                <span className="font-bold">LinkedIn Profile</span>
                                            </a>
                                        )}
                                        {selectedMember.social.github && selectedMember.social.github !== '#' && (
                                            <a href={selectedMember.social.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-100 text-slate-900 px-6 py-3 rounded-2xl hover:bg-gray-200 transition">
                                                <Github className="h-5 w-5" />
                                                <span className="font-bold">Github</span>
                                            </a>
                                        )}
                                        {selectedMember.social.email && (
                                            <a href={`mailto:${selectedMember.social.email}`} className="flex items-center justify-center h-12 w-12 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition">
                                                <Mail className="h-6 w-6" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CERTIFICATE DETAILS MODAL */}
            <AnimatePresence>
                {selectedCert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCert(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col"
                        >
                            {/* Certificate Gold Ribbon */}
                            <div className="h-2 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 w-full" />

                            {/* Header */}
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50 flex-shrink-0 text-left">
                                <div>
                                    <span className="text-[10px] font-black bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded uppercase tracking-wider">
                                        Accreditation & License Copy
                                    </span>
                                    <h2 className="text-xl font-black text-slate-900 mt-1">{selectedCert.title}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedCert(null)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-slate-600" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] text-left">
                                {/* Visual Mock Certificate Card */}
                                <div className="p-6 bg-amber-50/40 border border-amber-200 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner select-none font-serif text-amber-900">
                                    {/* Watermark Logo */}
                                    <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-6 translate-y-6 scale-150 pointer-events-none">
                                        <Award className="w-56 h-56" />
                                    </div>

                                    <div className="text-center space-y-4">
                                        <p className="text-[10px] font-sans font-black tracking-widest uppercase text-amber-700">Official Certification Authority</p>
                                        <p className="text-xs font-bold font-sans text-gray-800 leading-snug">{selectedCert.authority}</p>

                                        <div className="w-full h-px bg-amber-200 my-4" />

                                        <p className="text-[11px] font-sans text-gray-500 font-bold tracking-wide italic">This serves to certify that the platform registry</p>
                                        <p className="text-lg font-black tracking-tight text-gray-950 font-sans">HEALXISTA EMERGENCY SERVICES</p>
                                        <p className="text-[11px] font-sans text-gray-600 font-medium px-4 leading-relaxed">is officially registered and verified under our governance protocols.</p>
                                    </div>

                                    <div className="mt-8 flex justify-between items-end text-[9px] font-sans text-gray-500">
                                        <div>
                                            <p className="font-bold text-amber-800">Accreditation ID</p>
                                            <p className="font-mono text-gray-800 mt-0.5 font-bold">{selectedCert.refNo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-amber-800">Issue Registry</p>
                                            <p className="font-mono text-gray-800 mt-0.5 font-bold">{selectedCert.issueDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata Details */}
                                <div className="space-y-4 text-xs font-sans">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Registry Date</p>
                                            <p className="font-bold text-gray-700 mt-0.5">{selectedCert.issueDate}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Validity Period</p>
                                            <p className="font-bold text-gray-700 mt-0.5">{selectedCert.validity}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                                        <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Licensed Scope of Service</p>
                                        <p className="font-medium text-gray-700 leading-relaxed">{selectedCert.scope}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
                                <button
                                    onClick={() => setSelectedCert(null)}
                                    className="px-6 h-11 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border rounded-xl transition-all"
                                >
                                    Close Certificate
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const element = document.createElement("a");
                                        const docText = `===========================================================
OFFICIAL REGISTRATION ACCREDITATION TRANSCRIPT
===========================================================

License Title: ${selectedCert.title}
Governing Authority: ${selectedCert.authority}
Accreditation ID: ${selectedCert.refNo}
Registry Issue Date: ${selectedCert.issueDate}
Validity Duration: ${selectedCert.validity}

-----------------------------------------------------------
ACCREDITED OPERATIONAL SCOPE
-----------------------------------------------------------
${selectedCert.scope}

-----------------------------------------------------------
REGISTRY SUMMARY
-----------------------------------------------------------
${selectedCert.description}

===========================================================
VERIFIED BY THE NATIONAL HEALTH REGISTRY INTEGRATION NETWORK
© 2026 Healxista Emergency Services
===========================================================`;

                                        const file = new Blob([docText], { type: 'text/plain;charset=utf-8' });
                                        element.href = URL.createObjectURL(file);
                                        element.download = `${selectedCert.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_transcript.txt`;
                                        document.body.appendChild(element);
                                        element.click();
                                        document.body.removeChild(element);
                                    }}
                                    className="px-8 h-11 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl transition-all"
                                >
                                    Download Transcript
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default About;
