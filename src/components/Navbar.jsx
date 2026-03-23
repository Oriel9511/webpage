import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion as Motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAVBAR_SAMPLE_Y = 64;
const NAVBAR_SAMPLE_BAND = 2;


const Navbar = () => {
    const [isDarkBg, setIsDarkBg] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const rafId = useRef(null);
    const sectionMetaRef = useRef([]);
    const metaMapRef = useRef(new WeakMap());
    const observerRef = useRef(null);

    const applyActiveTheme = useCallback(() => {
        const activeSection = sectionMetaRef.current
            .filter(section => section.isIntersecting)
            .sort((a, b) => {
                if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
                return a.order - b.order;
            })
            .at(-1);

        if (!activeSection) return;

        const nextIsDark = activeSection.theme === 'dark';
        setIsDarkBg(prev => (prev === nextIsDark ? prev : nextIsDark));
    }, []);

    const seedVisibleSections = useCallback(() => {
        const probeY = Math.min(NAVBAR_SAMPLE_Y, Math.max(window.innerHeight - 1, 0));

        sectionMetaRef.current.forEach((section) => {
            const rect = section.element.getBoundingClientRect();
            section.isIntersecting = rect.top <= probeY && rect.bottom > probeY;
        });

        applyActiveTheme();
    }, [applyActiveTheme]);

    const rebuildThemeObserver = useCallback(() => {
        observerRef.current?.disconnect();

        sectionMetaRef.current = Array.from(document.querySelectorAll('[data-theme]')).map((element, order) => ({
            element,
            order,
            theme: element.dataset.theme || 'dark',
            zIndex: Number.parseInt(window.getComputedStyle(element).zIndex || '0', 10) || 0,
            isIntersecting: false,
        }));

        // Populate WeakMap for O(1) lookup in observer callback
        const nextMap = new WeakMap();
        sectionMetaRef.current.forEach(meta => nextMap.set(meta.element, meta));
        metaMapRef.current = nextMap;

        if (!sectionMetaRef.current.length) return;

        const bottomMargin = Math.max(window.innerHeight - NAVBAR_SAMPLE_Y - NAVBAR_SAMPLE_BAND, 0);
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const meta = metaMapRef.current.get(entry.target);
                if (!meta) return;
                meta.isIntersecting = entry.isIntersecting && entry.intersectionRect.height > 0;
            });

            applyActiveTheme();
        }, {
            root: null,
            rootMargin: `-${NAVBAR_SAMPLE_Y}px 0px -${bottomMargin}px 0px`,
            threshold: 0,
        });

        sectionMetaRef.current.forEach(section => observerRef.current.observe(section.element));
        seedVisibleSections();
    }, [applyActiveTheme, seedVisibleSections]);

    // ── Scroll handler: navbar show/hide + theme detection ──────────────────
    const handleScroll = useCallback(() => {
        if (rafId.current) return;
        rafId.current = requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;

            // Navbar visibility
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;

            rafId.current = null;
        });
    }, []);

    useEffect(() => {
        rebuildThemeObserver();

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', rebuildThemeObserver, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', rebuildThemeObserver);
            observerRef.current?.disconnect();
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [handleScroll, rebuildThemeObserver]);

    // ── MutationObserver: rebuild when DOM sections change ──────────────────
    useEffect(() => {
        let rebuildFrame = null;
        const mo = new MutationObserver(() => {
            // Debounce via rAF to avoid thrashing on fast DOM changes
            if (rebuildFrame !== null) cancelAnimationFrame(rebuildFrame);
            rebuildFrame = requestAnimationFrame(() => {
                rebuildFrame = null;
                rebuildThemeObserver();
            });
        });
        mo.observe(document.body, { childList: true, subtree: true });
        return () => {
            mo.disconnect();
            if (rebuildFrame !== null) cancelAnimationFrame(rebuildFrame);
        };
    }, [rebuildThemeObserver]);

    const textColor = isDarkBg ? 'text-white' : 'text-black';
    const logoColor = textColor;

    const scrollTo = (id) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (!element) return;

        // Batch layout reads/writes inside a single rAF to avoid thrashing
        requestAnimationFrame(() => {
            const sections = document.querySelectorAll('[data-theme]');
            const originals = [];
            sections.forEach(s => {
                originals.push(s.style.position);
                s.style.position = 'relative';
            });

            const rect = element.getBoundingClientRect();
            const top = rect.top + window.scrollY;

            sections.forEach((s, i) => { s.style.position = originals[i]; });

            window.scrollTo({ top, behavior: 'smooth' });
        });
    };

    const visibilityClass = isVisible ? 'translate-y-0' : '-translate-y-full';

    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full z-[100] px-6 py-6 md:py-8 flex justify-between items-center transition-all duration-500 ease-in-out ${visibilityClass} pointer-events-none`}
            >
                <Motion.button
                    whileHover="hover"
                    initial="initial"
                    onClick={() => scrollTo('hero')}
                    className={`text-2xl font-bold tracking-tighter font-serif z-[101] pointer-events-auto transition-colors duration-300 ${logoColor} p-4 -ml-4 relative`}
                    data-cursor="hover"
                >
                    OA.
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <Motion.polyline
                            points="1,1 99,1 99,99"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        <Motion.polyline
                            points="1,1 1,99 99,99"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                    </svg>
                </Motion.button>

                <div className={`hidden md:flex gap-2 text-xs font-mono uppercase tracking-[0.2em] font-bold pointer-events-auto transition-colors duration-300 ${textColor}`}>
                    {['work', 'opensource', 'about', 'contact'].map((section) => (
                        <Motion.button
                            key={section}
                            whileHover="hover"
                            initial="initial"
                            onClick={() => scrollTo(section)}
                            className={`relative px-6 py-4 hover:opacity-80 transition-opacity ${section === 'contact' ? 'text-zinc-400' : ''}`}
                            data-cursor="hover"
                        >
                            {section === 'work' ? 'Experiencia' :
                                section === 'opensource' ? 'Labs' :
                                    section === 'about' ? 'Perfil' : 'Contacto'}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                <Motion.polyline
                                    points="1,1 99,1 99,99"
                                    fill="none" stroke="currentColor" strokeWidth="1"
                                    variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                />
                                <Motion.polyline
                                    points="1,1 1,99 99,99"
                                    fill="none" stroke="currentColor" strokeWidth="1"
                                    variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                />
                            </svg>
                        </Motion.button>
                    ))}
                </div>

                <Motion.button
                    whileHover="hover"
                    initial="initial"
                    className={`md:hidden z-[101] pointer-events-auto transition-colors duration-300 ${isMobileMenuOpen ? 'text-white' : textColor} p-4 -mr-4 relative`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    data-cursor="hover"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <Motion.polyline
                            points="1,1 99,1 99,99"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        <Motion.polyline
                            points="1,1 1,99 99,99"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                    </svg>
                </Motion.button>
            </nav>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center gap-8 text-white font-serif text-2xl pointer-events-auto">
                    <button onClick={() => scrollTo('work')}>Experiencia</button>
                    <button onClick={() => scrollTo('opensource')}>Labs</button>
                    <button onClick={() => scrollTo('about')}>Perfil</button>
                    <button onClick={() => scrollTo('contact')}>Contacto</button>
                </div>
            )}
        </>
    );
};

export default Navbar;
