import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Instagram, Twitter, Linkedin, Facebook, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHero from '@/components/PageHero';

const ContactInfoCard = ({ icon: Icon, title, content, subContent, colorClass }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
    >
        <div className={`p-4 rounded-xl flex-shrink-0 ${colorClass.bg}`}>
            <Icon className={`h-6 w-6 ${colorClass.text}`} />
        </div>
        <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
            <p className="text-gray-700 font-medium">{content}</p>
            {subContent && <p className="text-gray-500 text-sm mt-1">{subContent}</p>}
        </div>
    </motion.div>
);

const SocialButton = ({ icon: Icon, label, href }) => (
    <a
        href={href}
        className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
    >
        <Icon className="w-5 h-5" />
        <span className="sr-only">{label}</span>
    </a>
);

const Contact = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.message) {
            toast.error("Email and Message are required!");
            return;
        }

        setLoading(true);
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/support/contact`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Your message has been sent successfully!");
                setFormData({
                    first_name: '', last_name: '', email: '', phone: '', subject: '', message: ''
                });
            } else {
                toast.error("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <SEO
                title="Contact Us"
                description="Get in touch with the Healxista team in Kolkata, Purulia & Bokaro. Available 24/7 for emergency priority support, partnership queries, and feedback."
                keywords="contact, support, emergency hotline, email support, Kolkata, Purulia, Bokaro, Healxista"
            />
            {/* HERO */}
            <PageHero
                bg="/assets/images/hero/road.jpg"
                badge={{ icon: Phone, text: '24/7 Priority Support' }}
                title={<>We're Here <span className="text-yellow-300">For You</span></>}
                subtitle="Whether it's an emergency, a partnership query, or feedback, our dedicated team is always ready to assist."
                primaryBtn={{ label: 'Call Us Now', onClick: () => window.open('tel:9239362736') }}
                secondaryBtn={{ label: 'Send a Message', onClick: () => document.querySelector('#contact-form')?.scrollIntoView({ behavior: 'smooth' }) }}
            />

            {/* MAIN CONTENT */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">

                        {/* LEFT COLUMN: INFO & MAP */}
                        <div className="lg:col-span-5 space-y-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in touch instantly</h2>
                                {/* Contact Cards */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-4"
                                >
                                    <ContactInfoCard
                                        icon={Phone}
                                        title="Emergency Hotline"
                                        content="9239362736"
                                        subContent="Answer as soon as possible"
                                        colorClass={{ bg: "bg-red-100", text: "text-red-600" }}
                                    />
                                    <ContactInfoCard
                                        icon={Mail}
                                        title="Email Support"
                                        content="info@healxista.com, healxista@gmail.com"
                                        subContent="Response time: within 2 hours"
                                        colorClass={{ bg: "bg-blue-100", text: "text-blue-600" }}
                                    />
                                    <ContactInfoCard
                                        icon={MapPin}
                                        title="Headquarters (HQ)"
                                        content="North- Lake Road, Opposite Purulia MRI, Raghavpur More"
                                        subContent="Ward No 3 Municipality, Purulia PS, Purulia 723101 India"
                                        colorClass={{ bg: "bg-green-100", text: "text-green-600" }}
                                    />
                                    <ContactInfoCard
                                        icon={Clock}
                                        title="Office Hours"
                                        content="Mon – Sun: 8:00 AM – 10:00 PM IST"
                                        subContent="Emergency fleets run 24/7/365"
                                        colorClass={{ bg: "bg-yellow-100", text: "text-yellow-600" }}
                                    />
                                </motion.div>
                            </div>

                            {/* Map */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="p-2 bg-white rounded-2xl shadow-sm border border-gray-200">
                                    <div className="h-64 md:h-80 w-full rounded-xl overflow-hidden relative">
                                        <iframe
                                            title="Healxista Purulia HQ"
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.665780512613!2d86.35332837498179!3d23.327899084803964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f697486f0685f1%3A0xc3d8a7c20c027376!2sRaghabpur%20More%2C%20Purulia%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1681468800000!5m2!1sen!2sin"
                                            width="100%"
                                            height="100%"
                                            className="border-0 filter grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN: CONTACT FORM */}
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
                                    <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400 w-full" />
                                    <CardContent className="p-8 md:p-12">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="p-3 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                <MessageSquare className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                                                <p className="text-gray-500 font-medium">Purulia HQ — typically replies within 2 hours</p>
                                            </div>
                                        </div>

                                        <form className="space-y-6" onSubmit={handleSubmit}>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">First Name</label>
                                                    <Input
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleChange}
                                                        placeholder="John"
                                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Last Name</label>
                                                    <Input
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleChange}
                                                        placeholder="Doe"
                                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 flex items-center">Email Address <span className="text-red-500 font-extrabold ml-1">*</span></label>
                                                    <Input
                                                        type="email"
                                                        name="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="john@example.com"
                                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                                    <Input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="+91 92393 62736"
                                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Subject</label>
                                                <Input
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder="How can we help?"
                                                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 flex items-center">Message <span className="text-red-500 font-extrabold ml-1">*</span></label>
                                                <Textarea
                                                    name="message"
                                                    required
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Tell us more about your inquiry..."
                                                    className="min-h-[150px] bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none p-4 rounded-xl"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                            >
                                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><Send className="mr-2 h-5 w-5" /> Send Message</>}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONNECT SECTION */}
            <section className="bg-white py-16 border-t border-gray-100">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Connected With Us</h2>
                    <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">Follow us across social media for health tips, real-time emergency updates, and stories.</p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <SocialButton icon={Facebook} label="Facebook" href="https://www.facebook.com/healxista" />
                        <SocialButton icon={Twitter} label="Twitter" href="https://www.twitter.com/healxista" />
                        <SocialButton icon={Instagram} label="Instagram" href="https://www.instagram.com/healxista" />
                        <SocialButton icon={Linkedin} label="LinkedIn" href="https://www.linkedin.com/company/healxista" />
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Contact;
