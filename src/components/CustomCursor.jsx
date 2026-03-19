import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

// ─── Utilities ────────────────────────────────────────────────────────────────
function isInteractive(el) {
  if (!el) return false;
  return el.closest(
    'a, button, [role="button"], [data-cursor="hover"], .cursor-pointer, input[type="submit"], input[type="button"], summary, label'
  ) !== null;
}

function isTextInput(el) {
  if (!el) return false;
  return el.closest('input, textarea, select, [contenteditable="true"]') !== null;
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Idle animation sequences ─────────────────────────────────────────────────
// Each fn receives (pupilX, pupilY, idleScaleY, idleDotScale) MotionValues
// and returns a promise, so they can be chained with await.

async function animBlink(_, __, idleScaleY) {
  await animate(idleScaleY, 0.08, { duration: 0.055, ease: 'easeIn' });
  await sleep(55);
  await animate(idleScaleY, 1, { duration: 0.1, ease: 'easeOut' });
}

async function animDoubleBlink(pupilX, pupilY, idleScaleY, idleDotScale) {
  await animBlink(pupilX, pupilY, idleScaleY, idleDotScale);
  await sleep(130);
  await animBlink(pupilX, pupilY, idleScaleY, idleDotScale);
}

async function animLookAround(pupilX, pupilY) {
  const maxR = 5.9;
  const moves = [
    [maxR, 0],
    [0, maxR * 0.8],
    [-maxR, 0.5],
    [maxR * 0.6, maxR * 0.5],
    [0, -maxR * 0.8],
    [-maxR * 0.6, maxR * 0.4],
  ];

  while (moves.length > 0) {
    const position = moves[Math.floor(Math.random() * moves.length)];
    const [tx, ty] = position;
    await Promise.all([
      animate(pupilX, -tx, { duration: Math.floor(Math.random() + 0.4 * 10) / 10, ease: 'easeInOut' }),
      animate(pupilY, -ty, { duration: Math.floor(Math.random() + 0.4 * 10) / 10, ease: 'easeInOut' }),
    ]);
    moves.shift();
    await sleep(230);
  }
  await Promise.all([
    animate(pupilX, 0, { duration: 0.40, ease: 'easeOut' }),
    animate(pupilY, 0, { duration: 0.40, ease: 'easeOut' }),
  ]);
}

async function animPulse(_, __, ___, idleDotScale) {
  await animate(idleDotScale, 1.55, { duration: 0.46, ease: 'easeInOut' });
  await animate(idleDotScale, 0.7, { duration: 0.42, ease: 'easeInOut' });
  await animate(idleDotScale, 1.3, { duration: 0.38, ease: 'easeInOut' });
  await animate(idleDotScale, 0.85, { duration: 0.36, ease: 'easeInOut' });
  await animate(idleDotScale, 1, { duration: 0.28, ease: 'easeOut' });
}

async function animImpatience(pupilX, pupilY, idleScaleY, idleDotScale) {
  for (const tx of [3, -5, 4, -3, 2, 0]) {
    await animate(pupilX, tx, { duration: 0.065, ease: 'easeInOut' });
  }
  await sleep(180);
  await animBlink(pupilX, pupilY, idleScaleY, idleDotScale);
}

async function animGlance(pupilX, pupilY) {
  const dir = Math.random() > 0.5 ? 1 : -1;
  await animate(pupilX, dir * 6.5, { duration: 0.70, ease: 'easeOut' });
  await sleep(350);
  await Promise.all([
    animate(pupilX, 0, { duration: 0.50, ease: 'easeInOut' }),
    animate(pupilY, 0, { duration: 0.50, ease: 'easeInOut' }),
  ]);
}

const IDLE_SEQUENCES = [
  animLookAround,
  animPulse,
  animImpatience,
  animGlance,
  animDoubleBlink,
  animBlink,
];

// ─── Component ────────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const evaluate = () => {
      setEnabled(fine.matches && !coarse.matches && !prefersReduced.matches && !reduce);
    };
    evaluate();
    fine.addEventListener?.('change', evaluate);
    coarse.addEventListener?.('change', evaluate);
    prefersReduced.addEventListener?.('change', evaluate);
    return () => {
      fine.removeEventListener?.('change', evaluate);
      coarse.removeEventListener?.('change', evaluate);
      prefersReduced.removeEventListener?.('change', evaluate);
    };
  }, [reduce]);

  // ── Position ──────────────────────────────────────────────────────────────
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const ringSpring = useMemo(() => ({ stiffness: 460, damping: 38, mass: 0.55 }), []);
  const dotSpring = useMemo(() => ({ stiffness: 900, damping: 32, mass: 0.30 }), []);

  const ringX = useSpring(x, ringSpring);
  const ringY = useSpring(y, ringSpring);
  const dotX = useSpring(x, dotSpring);
  const dotY = useSpring(y, dotSpring);

  // ── Idle personality MotionValues ─────────────────────────────────────────
  // These are ONLY used in `style` props, never in `animate`
  const pupilX = useMotionValue(0);  // horizontal pupil offset (px)
  const pupilY = useMotionValue(0);  // vertical pupil offset   (px)
  const idleScaleY = useMotionValue(1);  // vertical squish (blink)
  const idleDotScale = useMotionValue(1); // pupil size pulse

  // Combined dot position = spring position + pupil wander offset
  // useTransform with a function reactively reads pupilX, pupilY, dotX, dotY
  const finalDotX = useTransform(() => dotX.get() + pupilX.get());
  const finalDotY = useTransform(() => dotY.get() + pupilY.get());

  // ── Idle state tracking ───────────────────────────────────────────────────
  const idleTimerRef = useRef(null);
  const isIdleRef = useRef(false);
  const isRunningRef = useRef(false);

  const resetIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      // Snap all personality values back to neutral immediately
      animate(pupilX, 0, { duration: 0.18, ease: 'easeOut' });
      animate(pupilY, 0, { duration: 0.18, ease: 'easeOut' });
      animate(idleScaleY, 1, { duration: 0.12, ease: 'easeOut' });
      animate(idleDotScale, 1, { duration: 0.12, ease: 'easeOut' });
    }
    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      setIsIdle(true);
    }, 2500);
  }, [pupilX, pupilY, idleScaleY, idleDotScale]);

  // ── Mouse event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const handleMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      resetIdle();
      if (isTextInput(e.target)) {
        setVisible(false);
      } else {
        setHovering(isInteractive(e.target));
      }
    };
    const handleLeave = () => setVisible(false);
    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);
    const handleEnter = () => setVisible(true);

    resetIdle();

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    window.addEventListener('mouseleave', handleLeave, { passive: true });
    window.addEventListener('mouseenter', handleEnter, { passive: true });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('mouseenter', handleEnter);
    };
  }, [enabled, x, y, resetIdle]);

  // ── Idle animation loop ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isIdle || hovering) return;

    let cancelled = false;

    (async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      while (!cancelled && isIdleRef.current && !hovering) {
        const seq = IDLE_SEQUENCES[Math.floor(Math.random() * IDLE_SEQUENCES.length)];
        try {
          await seq(pupilX, pupilY, idleScaleY, idleDotScale);
        } catch (_) { /* animation was cancelled */ }
        await sleep(900 + Math.random() * 1800);
      }

      isRunningRef.current = false;
    })();

    return () => {
      cancelled = true;
      // Reset the running flag immediately so the next effect invocation can
      // start a fresh loop without being blocked by a stale true value.
      isRunningRef.current = false;
    };
  }, [isIdle, hovering, pupilX, pupilY, idleScaleY, idleDotScale]);

  // ── Visual constants ──────────────────────────────────────────────────────
  const BASE_RING = 28;
  const HOVER_RING = 56;
  const BASE_DOT = 6.5;
  const HOVER_DOT = 44;
  const RING_SCALE_HOVER = HOVER_RING / BASE_RING;
  const DOT_SCALE_HOVER = HOVER_DOT / BASE_DOT;
  const ringBorder = 1.2;
  const outlineWidth = 2;
  const outlineSize = BASE_RING + outlineWidth * 2;
  const dotOutlineWidth = 1.5;
  const dotOutlineSize = BASE_DOT + dotOutlineWidth * 2;

  const ringScale = hovering ? RING_SCALE_HOVER * (pressed ? 0.9 : 1) : (pressed ? 0.9 : 1);
  const dotScale = hovering ? DOT_SCALE_HOVER * (pressed ? 0.8 : 1) : (pressed ? 0.8 : 1);
  const ringOpacity = hovering ? 0 : (visible ? 1 : 0);
  const dotBorderRadius = hovering ? '14px' : '50%';

  // ── Lens / html2canvas ────────────────────────────────────────────────────
  const lensScale = 1.5;
  const html2cRef = useRef(null);
  const snapshotCanvasRef = useRef(null);
  const lensMountRef = useRef(null);
  const snapTimerRef = useRef(null);
  const lastSnapAtRef = useRef(0);
  const [snapRev, setSnapRev] = useState(0);
  const [vp, setVp] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 0,
    h: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let cancelled = false;
    if (!enabled) return undefined;
    (async () => {
      try {
        const mod = await import('html2canvas');
        if (!cancelled) {
          html2cRef.current = mod.default || mod;
          takeSnapshot();
          setTimeout(() => takeSnapshot(), 1200);
        }
      } catch (_) { }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [enabled]);

  const takeSnapshot = useCallback(async () => {
    if (!html2cRef.current) return;
    const now = Date.now();
    if (now - lastSnapAtRef.current < 1500) return;
    lastSnapAtRef.current = now;
    try {
      const canvas = await html2cRef.current(document.body, {
        backgroundColor: null,
        useCORS: true,
        logging: false,
        scale: 0.5,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        scrollX: window.scrollX || 0,
        scrollY: window.scrollY || 0,
        ignoreElements: (el) => {
          try {
            return (
              el?.classList?.contains('custom-cursor-root') ||
              el?.getAttribute?.('data-html2canvas-ignore') === 'true'
            );
          } catch (_) { return false; }
        },
      });
      snapshotCanvasRef.current = canvas;
      setSnapRev((v) => v + 1);
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onScrollOrResize = () => {
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      snapTimerRef.current = setTimeout(() => takeSnapshot(), 800);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') takeSnapshot();
    };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, takeSnapshot]);

  useEffect(() => {
    const mount = lensMountRef.current;
    const canvas = snapshotCanvasRef.current;
    if (!mount || !canvas) return;
    if (canvas.parentElement !== mount) {
      mount.innerHTML = '';
      mount.appendChild(canvas);
    }
    Object.assign(canvas.style, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: `${vp.w * lensScale}px`,
      height: `${vp.h * lensScale}px`,
      transformOrigin: '0 0',
      willChange: 'transform',
    });
  }, [snapRev, vp.w, vp.h, lensScale]);

  // Direct DOM update for lens offset — no React renders
  useEffect(() => {
    const updateOffset = () => {
      const canvas = snapshotCanvasRef.current;
      if (!canvas) return;
      const offsetX = -(ringX.get() * lensScale - BASE_RING / 2);
      const offsetY = -(ringY.get() * lensScale - BASE_RING / 2);
      canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    };
    const unsubX = ringX.on('change', updateOffset);
    const unsubY = ringY.on('change', updateOffset);
    return () => { unsubX(); unsubY(); };
  }, [ringX, ringY, lensScale, snapRev]);

  if (!enabled) return null;

  const baseOpacity = visible ? 1 : 0;
  const outlineShadow = '0 6px 18px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.6)';
  const dotShadow = hovering
    ? '0 12px 28px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)'
    : '0 3px 8px rgba(0,0,0,0.5)';

  // ── Shared style object for the blink wrapper centred at ring position ────
  // All ring (eye) elements live inside a zero-size wrapper that carries the
  // ring's spring position + the idle scaleY (blink). This avoids any conflict
  // between style MotionValues and animate static values on the same element.
  const eyeWrapperStyle = {
    x: ringX,
    y: ringY,
    width: 0,
    height: 0,
    scaleY: idleScaleY, // blink — MotionValue in style, no conflict
  };

  // Same for dot: the wrapper carries position + blink, children carry scale
  const dotWrapperStyle = {
    x: finalDotX,  // combined spring + pupil offset
    y: finalDotY,
    width: 0,
    height: 0,
    scaleY: idleScaleY,
  };

  // Children of the wrappers are centred with translateX/Y -50%
  const childCenter = { translateX: '-50%', translateY: '-50%' };

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] custom-cursor-root">

      {/* ── Eye (ring) wrapper — positions ring elements, applies blink ─── */}
      <div className="absolute" style={{ left: 0, top: 0 }}>

        {/* We need the wrapper itself to be a motion.div for the MotionValue */}
        <motion.div className="absolute" style={eyeWrapperStyle}>

          {/* Outline ring — black shadow */}
          <motion.div
            aria-hidden
            className="absolute"
            style={{
              ...childCenter,
              width: outlineSize,
              height: outlineSize,
              borderRadius: '50%',
              border: `${outlineWidth}px solid rgba(0,0,0,0.9)`,
              boxShadow: outlineShadow,
              opacity: ringOpacity,
              willChange: 'transform, opacity',
            }}
            animate={{ scale: ringScale }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          />

          {/* Lens — canvas snapshot */}
          {snapshotCanvasRef.current && (
            <motion.div
              aria-hidden
              className="absolute rounded-full overflow-hidden"
              style={{
                ...childCenter,
                width: BASE_RING,
                height: BASE_RING,
                opacity: baseOpacity,
                willChange: 'transform, opacity',
              }}
              animate={{ scale: ringScale }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              <div ref={lensMountRef} className="absolute inset-0" />
            </motion.div>
          )}

          {/* Fallback backdrop lens */}
          {!snapshotCanvasRef.current && (
            <motion.div
              aria-hidden
              className="absolute rounded-full overflow-hidden"
              style={{
                ...childCenter,
                width: BASE_RING,
                height: BASE_RING,
                opacity: baseOpacity,
                backdropFilter: 'contrast(1.08) brightness(1.06) saturate(1.05) blur(0.5px)',
                WebkitBackdropFilter: 'contrast(1.08) brightness(1.06) saturate(1.05) blur(0.5px)',
                willChange: 'transform, opacity',
              }}
              animate={{ scale: ringScale }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            />
          )}

          {/* Ring — mix-blend-difference white ring */}
          <motion.div
            aria-hidden
            className="absolute mix-blend-difference"
            style={{
              ...childCenter,
              width: BASE_RING,
              height: BASE_RING,
              borderRadius: '50%',
              border: `${ringBorder}px solid rgba(255,255,255,0.9)`,
              boxShadow: '0 0 24px rgba(255,255,255,0.06) inset',
              opacity: ringOpacity,
              willChange: 'transform, opacity',
            }}
            animate={{ scale: ringScale }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          />

        </motion.div>
      </div>

      {/* ── Pupil (dot) wrapper — wanders inside ring, also blinks ──────── */}
      <div className="absolute" style={{ left: 0, top: 0 }}>
        <motion.div className="absolute" style={dotWrapperStyle}>

          {/* Dot Outline — black edge */}
          <motion.div
            aria-hidden
            className="absolute flex items-center justify-center overflow-visible"
            style={{
              ...childCenter,
              width: dotOutlineSize,
              height: dotOutlineSize,
              border: hovering ? 'none' : `${dotOutlineWidth}px solid rgba(0,0,0,0.95)`,
              boxShadow: hovering ? 'none' : dotShadow,
              opacity: baseOpacity,
              willChange: 'transform, opacity',
            }}
            animate={{ scale: dotScale, borderRadius: dotBorderRadius }}
            transition={{ type: 'spring', stiffness: 700, damping: 30 }}
          >
            <AnimatePresence>
              {hovering && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: 10, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 35 }}
                  exit={{ opacity: 0, scale: 0.5, x: -10, rotate: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="text-black"
                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}
                >
                  <ArrowLeft size={10} strokeWidth={4} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Dot — white mix-blend; outer handles hover scale, inner handles pulse */}
          <motion.div
            aria-hidden
            className="absolute mix-blend-difference flex items-center justify-center overflow-visible"
            style={{
              ...childCenter,
              width: BASE_DOT,
              height: BASE_DOT,
              opacity: baseOpacity,
              willChange: 'transform, opacity',
            }}
            animate={{ scale: dotScale, borderRadius: dotBorderRadius }}
            transition={{ type: 'spring', stiffness: 700, damping: 30 }}
          >
            {/* Inner pulse element — idleDotScale only lives here in style */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                scale: idleDotScale,         // ← MotionValue, no conflict (separate element)
                backgroundColor: hovering ? 'transparent' : 'rgba(255,255,255,0.95)',
                borderRadius: 'inherit',
              }}
            />

            <AnimatePresence>
              {hovering && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: 10, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 35 }}
                  exit={{ opacity: 0, scale: 0.5, x: -10, rotate: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="text-white relative z-10"
                >
                  <ArrowLeft size={10} strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>

    </div>
  );
};

export default CustomCursor;
