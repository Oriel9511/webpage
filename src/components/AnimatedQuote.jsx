import React, { memo, useMemo, useRef } from 'react';
import { motion as Motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';

const THEME_STYLES = {
    light: {
        textColor: 'text-black',
        iconColor: 'text-zinc-400'
    },
    dark: {
        textColor: 'text-white',
        iconColor: 'text-zinc-600'
    }
};

const ICON_VARIANTS = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8 }
    }
};

const WORD_VARIANTS = {
    hidden: { opacity: 0, y: 40, rotateX: 90 },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
            duration: 0.8,
            delay: index * 0.04,
            ease: [0.215, 0.61, 0.355, 1]
        }
    })
};

const AUTHOR_VARIANTS = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 0.6,
        transition: { delay: 1, duration: 1 }
    }
};

const AnimatedQuote = ({ text, author, theme = "dark" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-10% 0px" });
    const animateState = isInView ? 'visible' : 'hidden';
    const words = useMemo(() => (text || '').trim().split(/\s+/).filter(Boolean), [text]);
    const { textColor, iconColor } = THEME_STYLES[theme] || THEME_STYLES.dark;

    return (
        <div ref={ref} className="w-full max-w-5xl mx-auto px-6 text-center">
            <Motion.div
                initial="hidden"
                animate={animateState}
                variants={ICON_VARIANTS}
            >
                <Quote size={40} className={`mx-auto mb-10 ${iconColor}`} />
            </Motion.div>

            <h3 className={`text-3xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-8 ${textColor} flex flex-wrap justify-center gap-x-3 gap-y-2`}>
                {words.map((word, i) => (
                    <Motion.span
                        key={i}
                        custom={i}
                        initial="hidden"
                        animate={animateState}
                        variants={WORD_VARIANTS}
                        className="inline-block origin-bottom perspective-1000"
                    >
                        {word}
                    </Motion.span>
                ))}
            </h3>

            {author && (
                <Motion.p
                    initial="hidden"
                    animate={animateState}
                    variants={AUTHOR_VARIANTS}
                    className={`font-mono text-xs md:text-sm uppercase tracking-widest mt-8 ${textColor}`}
                >
                    — {author}
                </Motion.p>
            )}
        </div>
    );
};

export default memo(AnimatedQuote);
