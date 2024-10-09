import { useState, useEffect, RefObject } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: UseIntersectionObserverProps = {}
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementVisible = entry.isIntersecting;
        setIsVisible(isElementVisible);

        if (freezeOnceVisible && isElementVisible) {
          observer.unobserve(entry.target);
        }
      },
      { threshold, root, rootMargin }
    );

    const currentElement = elementRef.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible]);

  return isVisible;
};

export default useIntersectionObserver;