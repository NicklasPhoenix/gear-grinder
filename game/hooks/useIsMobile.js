import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile viewport and orientation
 * @returns {{ isMobile: boolean, isPortrait: boolean, isLandscape: boolean, width: number, height: number }}
 */
export function useIsMobile() {
    const [state, setState] = useState(() => {
        if (typeof window === 'undefined') {
            return { isMobile: false, isPortrait: true, isLandscape: false, width: 1024, height: 768 };
        }
        const width = window.innerWidth;
        const height = window.innerHeight;
        return {
            isMobile: width < 768,
            isPortrait: height > width,
            isLandscape: width > height,
            width,
            height,
        };
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setState({
                isMobile: width < 768,
                isPortrait: height > width,
                isLandscape: width > height,
                width,
                height,
            });
        };

        // Listen to resize and orientation change
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        // Also check after a short delay (some browsers need this after orientation change)
        const handleOrientationChange = () => {
            setTimeout(handleResize, 100);
        };
        window.addEventListener('orientationchange', handleOrientationChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, []);

    return state;
}

/**
 * Hook that returns true only when on mobile portrait
 * This is the main condition for showing mobile layout
 */
export function useIsMobilePortrait() {
    const { isMobile, isPortrait } = useIsMobile();
    return isMobile && isPortrait;
}

export default useIsMobile;
