import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, X } from 'lucide-react';

// ── Slide variants — enters from the right, exits to the right ────────────────
const slideVariants = {
  hidden:  { x: '100%' },
  visible: {
    x: '0%',
    transition: {
      type: 'spring',
      stiffness: 60,
      damping: 22,
      mass: 1.1,
      restDelta: 0.001,
      restSpeed: 0.001,
    },
  },
  exit: {
    x: '100%',
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 24,
      mass: 0.9,
      restDelta: 0.001,
      restSpeed: 0.001,
    },
  },
};

// ── Content stagger variants ──────────────────────────────────────────────────
const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.25 + i * 0.07, duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ── Project detail content placeholder ───────────────────────────────────────
// Content is lorem ipsum for now; replace per-project later.
const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const HIGHLIGHTS = [
  'Arquitectura modular y extensible',
  'Integración con servicios cloud',
  'CI/CD automatizado con Docker',
  'Cobertura de tests > 85%',
];

const CHALLENGE_CARDS = [
  { title: 'El Desafío' },
  { title: 'La Solución' },
];

const PANEL_SHADOW = {
  boxShadow: '-24px 0 80px rgba(0,0,0,0.55), -4px 0 16px rgba(0,0,0,0.35)',
};

const BACK_BUTTON_TRANSITION = { type: 'spring', stiffness: 300, damping: 20 };
const CLOSE_BUTTON_TRANSITION = { type: 'spring', stiffness: 300, damping: 18 };

const ProjectDetailBody = memo(function ProjectDetailBody({ project }) {
  const stackItems = useMemo(
    () => project.tech.split(/[,/]/).map((item) => item.trim()).filter(Boolean),
    [project.tech],
  );

  return (
    <>
      <div className="flex-1 container mx-auto px-6 md:px-12 py-16 md:py-24 max-w-5xl">

        {/* Header */}
        <Motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible" className="mb-4">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">{project.tech}</span>
        </Motion.div>

        <Motion.h2
          custom={1}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl lg:text-8xl font-serif leading-none mb-16 tracking-tighter text-black"
        >
          {project.name}
        </Motion.h2>

        <div className="h-px w-full bg-black/10 mb-16" />

        {/* Two-column body */}
        <div className="grid md:grid-cols-12 gap-12 mb-20">

          {/* Description */}
          <Motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible" className="md:col-span-7 space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-6">Descripción</p>
            <p className="text-zinc-700 font-light text-lg leading-relaxed">{project.desc}</p>
            <p className="text-zinc-500 font-light leading-relaxed">{LOREM}</p>
          </Motion.div>

          {/* Sidebar */}
          <Motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible" className="md:col-span-4 md:col-start-9 space-y-10">

            {/* Stack */}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">Stack</p>
              <div className="flex flex-wrap gap-2">
                {stackItems.map((item) => (
                  <span
                    key={item}
                    className="text-xs border border-black/10 bg-black/5 px-3 py-1.5 text-zinc-700 rounded-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">Aspectos clave</p>
              <ul className="space-y-3">
                {HIGHLIGHTS.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-sm text-zinc-400 font-light">
                    <span className="mt-1.5 h-px w-4 shrink-0 bg-zinc-400" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </Motion.div>
        </div>

        {/* Lorem section 2 */}
        <Motion.div custom={4} variants={itemVariants} initial="hidden" animate="visible" className="border-t border-black/10 pt-16 mb-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-8">Desafíos & Soluciones</p>
          <div className="grid md:grid-cols-2 gap-8">
            {CHALLENGE_CARDS.map((card) => (
              <div key={card.title} className="border border-black/10 p-8 bg-black/3">
                <h3 className="font-serif text-2xl mb-4 text-black">{card.title}</h3>
                <p className="text-zinc-500 font-light leading-relaxed text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </div>
            ))}
          </div>
        </Motion.div>

        {/* CTA Links */}
        <Motion.div custom={5} variants={itemVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-6">
          <a
            href="#"
            className="group inline-flex items-center gap-3 border border-black/20 px-6 py-4 text-sm font-mono uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
            data-cursor="hover"
          >
            <Github size={16} />
            Ver Repositorio
            <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#"
            className="group inline-flex items-center gap-3 border border-black/20 px-6 py-4 text-sm font-mono uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
            data-cursor="hover"
          >
            <ExternalLink size={16} />
            Demo en Vivo
            <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </a>
        </Motion.div>
      </div>

      {/* ── Footer stripe ─────────────────────────────────────────────────────── */}
      <div className="border-t border-black/10 px-6 md:px-12 py-6 flex justify-between items-center text-zinc-400 text-xs font-mono uppercase tracking-widest">
        <span>{project.name}</span>
        <span>{project.tech}</span>
      </div>
    </>
  );
});

// ── Component ─────────────────────────────────────────────────────────────────
const ProjectDetail = ({ project, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!project) return null;

  return (
    <Motion.div
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
        className="fixed inset-0 z-[150] bg-[#f0f0f0] text-black overflow-y-auto flex flex-col scroll-hidden"
      style={PANEL_SHADOW}
      aria-modal="true"
      role="dialog"
      aria-label={`Detalle del proyecto: ${project.name}`}
    >
      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 left-0 right-0 z-10 flex items-center justify-between px-6 md:px-12 py-6 border-b border-black/10 bg-[#f0f0f0]/90 backdrop-blur-sm">
        <Motion.button
          onClick={onClose}
          className="flex items-center gap-3 text-zinc-500 hover:text-black transition-colors font-mono text-xs uppercase tracking-widest group"
          data-cursor="hover"
          whileHover={{ x: -4 }}
          transition={BACK_BUTTON_TRANSITION}
          aria-label="Volver a Labs"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Labs & Open Source
        </Motion.button>

        <Motion.button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-black transition-colors"
          data-cursor="hover"
          whileHover={{ rotate: 90 }}
          transition={CLOSE_BUTTON_TRANSITION}
          aria-label="Cerrar"
        >
          <X size={20} />
        </Motion.button>
      </div>

      <ProjectDetailBody project={project} />
    </Motion.div>
  );
};

export default memo(ProjectDetail);
