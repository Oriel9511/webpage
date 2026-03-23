import React, { useRef, useState, useLayoutEffect } from 'react';

const StackedSection = ({ children, className = "", id = "", zIndex = 0, theme = "dark", sticky = true }) => {
    const ref = useRef(null);
    const [topOffset, setTopOffset] = useState(0);

    useLayoutEffect(() => {
        if (!sticky || !ref.current) return;

        const el = ref.current;
        const recalc = () => {
            const height = el.offsetHeight;
            const windowHeight = window.innerHeight;
            setTopOffset(height > windowHeight ? (windowHeight - height) : 0);
        };

        recalc();

        const ro = new ResizeObserver(recalc);
        ro.observe(el);
        window.addEventListener('resize', recalc);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', recalc);
        };
    }, [sticky]);

    const bgColor = theme === 'light' ? 'bg-[#f0f0f0] text-black' : 'bg-[#0a0a0a] text-white';
    const shadowClass = zIndex > 0 ? "shadow-[0_-50px_40px_-20px_rgba(0,0,0,0.5)]" : "";

    // Always use sticky if requested, but with dynamic top
    const positionClass = sticky ? "sticky" : "relative";

    return (
        <section
            ref={ref}
            id={id}
            data-theme={theme}
            className={`${positionClass} min-h-screen w-full flex flex-col justify-center overflow-hidden ${bgColor} ${className} ${shadowClass}`}
            style={{
                zIndex,
                top: sticky ? topOffset : undefined
            }}
        >
            {children}
        </section>
    );
};

export default StackedSection;
