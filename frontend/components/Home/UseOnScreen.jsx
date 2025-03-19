import { useEffect, useState } from 'react';

export const useOnScreen = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.5, ...options }
    );

    const element = document.getElementById(options.id || 'default');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options]);

  return isIntersecting;
};
