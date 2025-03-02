"use client";
import { useResponsive } from "../hooks/useResponsive";

/**
 * A wrapper component that provides responsive data to its children
 * This allows us to dynamically import it with { ssr: false } to avoid window reference errors
 */
const ResponsiveWrapper = ({ children }) => {
  const responsiveData = useResponsive();
  
  // If children is a function, call it with the responsive data
  if (typeof children === 'function') {
    return children(responsiveData);
  }
  
  // Otherwise, just render the children
  return children;
};

export default ResponsiveWrapper; 