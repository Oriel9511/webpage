import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

const StackedSection = ({ children, className = "", id = "", zIndex = 0, theme = "dark", sticky = true }) => {
    const ref = useRef(null);
    const frameRef = useRef(0);
    const topOffsetRef = useRef(0);
    const [topOffset, setTopOffset] = useState(0);

    const updateTopOffset = useCallback(() => {
        if (!sticky || !ref.current) return;

        const height = ref.current.offsetHeight;
        const windowHeight = window.innerHeight;
        const nextTopOffset = height > windowHeight ? (windowHeight - height) : 0;

        if (topOffsetRef.current !== nextTopOffset) {
            topOffsetRef.current = nextTopOffset;
            setTopOffset(nextTopOffset);
        }
    }, [sticky]);

    useLayoutEffect(() => {
        if (!sticky || !ref.current) {
            topOffsetRef.current = 0;
            return;
        }

        const scheduleRecalc = () => {
            window.cancelAnimationFrame(frameRef.current);
            frameRef.current = window.requestAnimationFrame(updateTopOffset);
        };

        scheduleRecalc();

        const ro = new ResizeObserver(scheduleRecalc);
        ro.observe(ref.current);

        return () => {
            window.cancelAnimationFrame(frameRef.current);
            ro.disconnect();
        };
    }, [sticky, updateTopOffset]);

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
