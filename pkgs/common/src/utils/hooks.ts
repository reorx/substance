import { useState, useEffect, useRef, RefObject } from 'react';


export function useComponentVisible(initialValue: boolean, togglerRef?: RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(initialValue);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (togglerRef?.current?.contains(event.target as Node)) {
      // do nothing when click on the toggler
      return
    }
    if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsVisible(false);
    }
  };

  useEffect(() => {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
          document.removeEventListener('click', handleClickOutside, true);
      };
  }, []);

  return { ref, isVisible, setIsVisible };
}

export function usePageTitle(title: string) {
useEffect(() => {
  document.title = title;
}, []);
};
