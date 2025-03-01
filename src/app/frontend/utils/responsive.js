/**
 * Responsive design utility functions
 */

// Breakpoints (in pixels)
export const breakpoints = {
  mobile: 767,
  tablet: 1023,
  desktop: 1439,
  largeDesktop: 1440
};

/**
 * Get the current device type based on window width
 * @returns {string} The device type: 'Mobile', 'Tablet', 'Desktop', or 'Large Desktop'
 */
export const getDeviceType = (width) => {
  if (typeof window === 'undefined' && !width) return 'Mobile'; // Default for SSR
  
  const currentWidth = width || window.innerWidth;
  
  if (currentWidth <= breakpoints.mobile) return 'Mobile';
  if (currentWidth <= breakpoints.tablet) return 'Tablet';
  if (currentWidth <= breakpoints.desktop) return 'Desktop';
  return 'Large Desktop';
};

/**
 * Check if the current device is mobile
 * @returns {boolean} True if the device is mobile
 */
export const isMobile = (width) => {
  if (typeof window === 'undefined' && !width) return true; // Default for SSR
  
  const currentWidth = width || window.innerWidth;
  return currentWidth <= breakpoints.mobile;
};

/**
 * Check if the current device is tablet
 * @returns {boolean} True if the device is tablet
 */
export const isTablet = (width) => {
  if (typeof window === 'undefined' && !width) return false; // Default for SSR
  
  const currentWidth = width || window.innerWidth;
  return currentWidth > breakpoints.mobile && currentWidth <= breakpoints.tablet;
};

/**
 * Check if the current device is desktop
 * @returns {boolean} True if the device is desktop
 */
export const isDesktop = (width) => {
  if (typeof window === 'undefined' && !width) return false; // Default for SSR
  
  const currentWidth = width || window.innerWidth;
  return currentWidth > breakpoints.tablet;
};

/**
 * Custom hook to get and update window dimensions
 * @returns {Object} Window dimensions and device type
 */
export const useWindowDimensions = () => {
  // This is just a placeholder - in a real implementation, this would be a React hook
  // that returns window dimensions and updates on resize
  
  // Example implementation:
  /*
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    deviceType: getDeviceType(typeof window !== 'undefined' ? window.innerWidth : 0)
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        deviceType: getDeviceType(window.innerWidth)
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowDimensions;
  */
  
  return {
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    deviceType: getDeviceType(typeof window !== 'undefined' ? window.innerWidth : 0)
  };
}; 