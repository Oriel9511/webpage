import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const ExperienceRow = ({ job, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="group border-t border-white/20 py-12 transition-colors hover:bg-white/5 cursor-pointer"
            data-cursor="hover"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-3">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{job.year}</span>
                    <h3 className="text-2xl font-serif text-white mt-2 group-hover:italic transition-all duration-300">{job.company}</h3>
                </div>

                <div className="md:col-span-4">
                    <p className="text-zinc-400 font-light text-sm uppercase tracking-wider mb-2">{job.role}</p>
                    <div className="flex flex-wrap gap-2">
                        {job.projects.map((p, i) => (
                            <span key={i} className="text-xs border border-white/10 px-2 py-1 rounded-full text-zinc-500">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-4">
                    <p className="text-zinc-300 font-light leading-relaxed text-sm md:text-base">
                        {job.desc}
                    </p>
                </div>

                <div className="md:col-span-1 flex justify-end">
                    <ArrowUpRight
                        className={`text-white transition-transform duration-500 ${isHovered ? 'rotate-45 opacity-100 scale-125' : 'opacity-0'}`}
                        size={24}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default ExperienceRow;
