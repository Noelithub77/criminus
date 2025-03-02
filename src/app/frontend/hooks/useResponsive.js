import { useState, useEffect } from 'react';
import { getDeviceType, breakpoints } from '../utils/responsive';

/**
 * Custom hook for responsive design
 * @returns {Object} Responsive design utilities
 */
export function useResponsive() {
  // Initialize with default values for SSR
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  
  const [deviceType, setDeviceType] = useState('Mobile'); // Default for SSR
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This code only runs on the client
    setIsClient(true);
    
    // Set initial dimensions
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    
    setDeviceType(getDeviceType(window.innerWidth));
    
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowDimensions({ width, height });
      setDeviceType(getDeviceType(width));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Utility functions - only use client values if we're on the client
  const isMobile = isClient ? windowDimensions.width <= breakpoints.mobile : true; // Default to mobile for SSR
  const isTablet = isClient ? (windowDimensions.width > breakpoints.mobile && windowDimensions.width <= breakpoints.tablet) : false;
  const isDesktop = isClient ? (windowDimensions.width > breakpoints.tablet && windowDimensions.width <= breakpoints.desktop) : false;
  const isLargeDesktop = isClient ? windowDimensions.width > breakpoints.desktop : false;

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