import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop – Global scroll management for route changes
 *
 * This component detects pathname changes and scrolls the window to the top.
 * It respects in-page anchor links (hash navigation) by scrolling to the
 * target element instead of the top.
 *
 * On navigation, scroll is instant (not smooth) to avoid jarring delays.
 * Renders nothing – it's a side-effect-only component.
 *
 * Should be mounted once at the top level of the app (inside BrowserRouter).
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash, scroll to that element instead of the top
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Use instant behavior to avoid delays
        element.scrollIntoView({ behavior: 'instant' });
      }
    } else {
      // No hash: scroll to top instantly
      // Temporarily disable smooth scrolling to avoid jarring delays
      const previousScrollBehavior =
        document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
