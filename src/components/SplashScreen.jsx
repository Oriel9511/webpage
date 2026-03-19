import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Centerpiece */}
      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif tracking-tighter"
        >
          <div className="text-[14vw] leading-none select-none">OA</div>
        </motion.div>

        {/* Anticipation message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400"
        >
          Diseñando una experiencia que querrás explorar. Quédate, lo mejor está por revelarse…
        </motion.p>

        {/* Loader line */}
        <div className="w-64 h-px bg-zinc-700/40 overflow-hidden rounded">
          <motion.div
            className="h-full bg-white"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, repeatType: 'loop', duration: 1.4, ease: 'easeInOut' }}
            style={{ width: '40%' }}
          />
        </div>
      </div>

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_60%_at_50%_40%,rgba(255,255,255,0.08),transparent)]" />
    </motion.div>
  );
};

export default SplashScreen;
