import React, { useRef, useState, useLayoutEffect } from 'react';

const StackedSection = ({ children, className = "", id = "", zIndex = 0, theme = "dark", sticky = true }) => {
    const ref = useRef(null);
    const [topOffset, setTopOffset] = useState(0);

    useLayoutEffect(() => {
        if (!sticky) return;

        const handleResize = () => {
            if (ref.current) {
                const height = ref.current.offsetHeight;
                const windowHeight = window.innerHeight;
                // If content is taller than viewport, stick so the bottom is visible (negative top)
                // If content is shorter, stick at top 0
                setTopOffset(height > windowHeight ? (windowHeight - height) : 0);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [sticky, children]);

    const bgColor = theme === 'light' ? 'bg-[#f0f0f0] text-black' : 'bg-[#0a0a0a] text-white';
    const shadowClass = zIndex > 0 ? "shadow-[0_-50px_40px_-20px_rgba(0,0,0,0.5)]" : "";

    // Always use sticky if requested, but with dynamic top
    const positionClass = sticky ? "sticky" : "relative";

    return (
        <section
            ref={ref}
            id={id}
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
