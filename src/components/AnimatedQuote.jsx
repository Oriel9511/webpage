import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';

const AnimatedQuote = ({ text, author, theme = "dark" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-10% 0px" });

    const words = text.split(" ");
    const textColor = theme === 'light' ? 'text-black' : 'text-white';
    const iconColor = theme === 'light' ? 'text-zinc-400' : 'text-zinc-600';

    return (
        <div ref={ref} className="w-full max-w-5xl mx-auto px-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8 }}
            >
                <Quote size={40} className={`mx-auto mb-10 ${iconColor}`} />
            </motion.div>

            <h3 className={`text-3xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-8 ${textColor} flex flex-wrap justify-center gap-x-3 gap-y-2`}>
                {words.map((word, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 40, rotateX: 90 }}
                        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 90 }}
                        transition={{
                            duration: 0.8,
                            delay: i * 0.04,
                            ease: [0.215, 0.61, 0.355, 1]
                        }}
                        className="inline-block origin-bottom perspective-1000"
                    >
                        {word}
                    </motion.span>
                ))}
            </h3>

            {author && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className={`font-mono text-xs md:text-sm uppercase tracking-widest mt-8 ${textColor}`}
                >
                    — {author}
                </motion.p>
            )}
        </div>
    );
};

export default AnimatedQuote;
