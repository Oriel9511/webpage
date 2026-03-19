import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const letterVariants = {
  hidden: { opacity: 0, y: 28, rotateX: 35, scale: 0.96, filter: 'blur(8px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      delay: i * 0.045,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const AnimatedName = ({ text, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  const words = (text || '').toUpperCase().split(/\s+/).filter(Boolean);

  return (
    <h1 className={`w-full text-center ${className}`} aria-label={text}>
      <div className="inline-flex flex-col items-center leading-[0.8] [perspective:1200px]">
        {words.map((word, wi) => (
          <div key={`w-${wi}`} className="block">
            {word.split('').map((ch, ci) => {
              // Stagger index based on total letters before this one (prevents huge inter-word delay)
              const lettersBefore = words.slice(0, wi).reduce((sum, w) => sum + w.length, 0);
              const idx = lettersBefore + ci;
              return shouldReduceMotion ? (
                <span key={`c-${idx}`} className="inline-block">
                  {ch}
                </span>
              ) : (
                <motion.span
                  key={`c-${idx}`}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={letterVariants}
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ type: 'tween', duration: 0.2 }}
                  className="inline-block will-change-transform [text-shadow:0_0_0_rgba(255,255,255,0)] hover:[text-shadow:0_6px_24px_rgba(255,255,255,0.08)]"
                >
                  {ch}
                </motion.span>
              );
            })}
            {wi < words.length - 1 && <br />}
          </div>
        ))}
      </div>
    </h1>
  );
};

export default AnimatedName;
