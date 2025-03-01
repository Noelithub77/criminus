'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TransitionProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    setIsTransitioning(true);
    const timeout = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);
  
  return (
    <>
      {isTransitioning ? (
        <div className="transition-overlay">
          <div className="transition-spinner"></div>
        </div>
      ) : (
        children
      )}
    </>
  );
} 