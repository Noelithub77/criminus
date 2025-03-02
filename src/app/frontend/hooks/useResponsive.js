import { useState, useEffect } from 'react';
import { getDeviceType, breakpoints } from '../utils/responsive';

/**
 * Custom hook for responsive design
 * @returns {Object} Responsive design utilities
 */
export function useResponsive() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const [deviceType, setDeviceType] = useState(
    getDeviceType(typeof window !== 'undefined' ? window.innerWidth : 0)
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowDimensions({ width, height });
      setDeviceType(getDeviceType(width));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Utility functions
  const isMobile = windowDimensions.width <= breakpoints.mobile;
  const isTablet = windowDimensions.width > breakpoints.mobile && windowDimensions.width <= breakpoints.tablet;
  const isDesktop = windowDimensions.width > breakpoints.tablet && windowDimensions.width <= breakpoints.desktop;
  const isLargeDesktop = windowDimensions.width > breakpoints.desktop;

  return {
    width: windowDimensions.width,
    height: windowDimensions.height,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoints
  };
} 