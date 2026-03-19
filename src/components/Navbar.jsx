import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';


const Navbar = () => {
    const [activeSection, setActiveSection] = useState('hero');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const rafId = useRef(null);

    // ── Navbar show/hide with rAF throttle ──────────────────────────────────
    const handleScroll = useCallback(() => {
        if (rafId.current) return;
        rafId.current = requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
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
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [handleScroll]);

    // ── Section detection via IntersectionObserver ───────────────────────────
    useEffect(() => {
        const sections = ['hero', 'quote1', 'work', 'quote2', 'opensource', 'about', 'contact'];
        const sectionElements = sections
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        if (sectionElements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // Find the most visible section that's intersecting
                let best = null;
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        if (!best || entry.intersectionRatio > best.intersectionRatio) {
                            best = entry;
                        }
                    }
                }
                if (best) {
                    setActiveSection(best.target.id);
                }
            },
            { threshold: [0.1, 0.3, 0.5, 0.7], rootMargin: '-20% 0px -20% 0px' }
        );

        sectionElements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const isDarkBg = ['hero', 'work', 'opensource', 'contact'].includes(activeSection);
    const textColor = isDarkBg ? 'text-white' : 'text-black';
    const logoColor = isDarkBg ? 'text-white' : 'text-black';

    const scrollTo = (id) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const visibilityClass = isVisible ? 'translate-y-0' : '-translate-y-full';

    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full z-[100] px-6 py-6 md:py-8 flex justify-between items-center transition-all duration-500 ease-in-out ${visibilityClass} pointer-events-none`}
            >
                <motion.button
                    whileHover="hover"
                    initial="initial"
                    onClick={() => scrollTo('hero')}
                    className={`text-2xl font-bold tracking-tighter font-serif z-[101] pointer-events-auto transition-colors duration-300 ${logoColor} p-4 -ml-4 relative`}
                    data-cursor="hover"
                >
                    OA.
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <motion.polyline
                            points="1,1 99,1 99,99"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        <motion.polyline
                            points="1,1 1,99 99,99"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                    </svg>
                </motion.button>

                <div className={`hidden md:flex gap-2 text-xs font-mono uppercase tracking-[0.2em] font-bold pointer-events-auto transition-colors duration-300 ${textColor}`}>
                    {['work', 'opensource', 'about', 'contact'].map((section) => (
                        <motion.button
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
                                <motion.polyline
                                    points="1,1 99,1 99,99"
                                    fill="none" stroke="currentColor" strokeWidth="1"
                                    variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                />
                                <motion.polyline
                                    points="1,1 1,99 99,99"
                                    fill="none" stroke="currentColor" strokeWidth="1"
                                    variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                />
                            </svg>
                        </motion.button>
                    ))}
                </div>

                <motion.button
                    whileHover="hover"
                    initial="initial"
                    className={`md:hidden z-[101] pointer-events-auto transition-colors duration-300 ${isMobileMenuOpen ? 'text-white' : textColor} p-4 -mr-4 relative`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    data-cursor="hover"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <motion.polyline
                            points="1,1 99,1 99,99"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        <motion.polyline
                            points="1,1 1,99 99,99"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            variants={{ hover: { pathLength: 1 }, initial: { pathLength: 0 } }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                    </svg>
                </motion.button>
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
