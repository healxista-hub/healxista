import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
    {
        name: 'Rahul Pal',
        role: 'Nerve Block Treatment',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
        quote:
            "I was struggling with severe neuralgia pain for a long time and nothing seemed to work. After undergoing nerve block treatment, I finally experienced significant relief. The pain has reduced drastically, and I can now return to my daily activities comfortably. Highly thankful for this effective treatment.",
    },
    {
        name: 'Sumanta Saha',
        role: 'Arthritis Pain Management',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
        quote:
            'I was suffering from arthritis pain that made daily activities difficult. After PRP therapy, I experienced noticeable relief and improved joint mobility. The stiffness and discomfort have reduced significantly, allowing me to move more freely. I’m truly thankful for this effective and non-surgical treatment.',
    },
    {
        name: 'Sourav Sarkar',
        role: 'PRP Therapy',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
        quote:
            'I was suffering from chronic joint pain that limited my daily activities. After undergoing PRP therapy, I experienced remarkable improvement and reduced discomfort. My mobility has improved, and I can move freely again. Grateful for this effective and non-surgical treatment that truly enhanced my quality of life.',
    },
];

const Testimonials = () => {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const next = () => setIndex((i) => (i + 1) % testimonials.length);
    const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

    // Auto-slide
    useEffect(() => {
        if (paused) return;
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [paused]);

    return (
        <section className="relative py-24 bg-gradient-to-b from-blue-900 via-indigo-950 to-black text-white overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Heading */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold">
                        People <span className="text-red-500">Trust Us</span>
                    </h2>
                    <p className="mt-3 text-blue-200 text-lg">
                        Real experiences from lives we’ve touched.
                    </p>
                </div>

                <div
                    className="relative max-w-4xl mx-auto"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    {/* Arrows */}
                    <Button
                        onClick={prev}
                        variant="ghost"
                        aria-label="Previous testimonial"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 hidden md:flex h-12 w-12 rounded-full bg-white/10 hover:bg-white/20"
                    >
                        <ChevronLeft />
                    </Button>

                    <Button
                        onClick={next}
                        variant="ghost"
                        aria-label="Next testimonial"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 hidden md:flex h-12 w-12 rounded-full bg-white/10 hover:bg-white/20"
                    >
                        <ChevronRight />
                    </Button>

                    {/* Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -80 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                            <Card className="bg-white/95 backdrop-blur border-none shadow-2xl rounded-3xl p-10 md:p-14 text-gray-900 relative">
                                <Quote className="absolute top-8 left-8 h-14 w-14 text-blue-100 rotate-180" />

                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6 -mt-20">
                                        <img
                                            src={testimonials[index].image}
                                            alt={testimonials[index].name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Quote */}
                                    <p className="text-xl md:text-2xl font-serif italic text-gray-700 leading-relaxed mb-8">
                                        “{testimonials[index].quote}”
                                    </p>

                                    {/* Name */}
                                    <h4 className="font-bold text-lg text-blue-700">
                                        {testimonials[index].name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {testimonials[index].role}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>

                    {/* Dots */}
                    <div className="flex justify-center gap-3 mt-10">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                aria-label={`Go to testimonial ${i + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-10 bg-red-500' : 'w-2 bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
