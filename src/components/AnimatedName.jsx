import React, { memo, useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';

const letterVariants = {
  hidden: { opacity: 0, y: 28, rotateX: 35, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      delay: i * 0.045,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const hoverTransition = { type: 'tween', duration: 0.2 };

const AnimatedName = ({ text, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  const rows = useMemo(() => {
    const words = (text || '').toUpperCase().split(/\s+/).filter(Boolean);

    return words.reduce(
      ({ items, offset }, word, wordIndex) => ({
        items: [
          ...items,
          {
            key: `w-${wordIndex}`,
            letters: Array.from(word, (character, letterIndex) => {
              const index = offset + letterIndex;

              return {
                character,
                key: `c-${index}`,
                index,
              };
            }),
          },
        ],
        offset: offset + word.length,
      }),
      { items: [], offset: 0 },
    ).items;
  }, [text]);

  return (
    <h1 className={`w-full text-center ${className}`} aria-label={text}>
      <div className="inline-flex flex-col items-center leading-[0.8] [perspective:1200px]">
        {rows.map((row, rowIndex) => (
          <div key={row.key} className="block">
            {row.letters.map(({ character, key, index }) => {
              return shouldReduceMotion ? (
                <span key={key} className="inline-block">
                  {character}
                </span>
              ) : (
                <Motion.span
                  key={key}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={letterVariants}
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={hoverTransition}
                  className="inline-block will-change-transform [text-shadow:0_0_0_rgba(255,255,255,0)] hover:[text-shadow:0_6px_24px_rgba(255,255,255,0.08)]"
                >
                  {character}
                </Motion.span>
              );
            })}
            {rowIndex < rows.length - 1 && <br />}
          </div>
        ))}
      </div>
    </h1>
  );
};

export default memo(AnimatedName);
