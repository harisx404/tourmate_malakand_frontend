import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Utility component to scroll the window to the top on route changes.
 * Ensures the user starts at the top of the page when navigating.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;