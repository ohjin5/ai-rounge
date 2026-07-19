import { useState, useEffect, useCallback, useRef } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMouseActive, setIsMouseActive] = useState<boolean>(true);
  const mouseTimeoutRef = useRef<number | null>(null);

  const onFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [onFullscreenChange]);

  const toggleFullscreen = useCallback(async (element: HTMLElement | null) => {
    if (!element) return;
    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  }, []);

  // Monitor mouse activity in fullscreen to hide cursor when idle
  useEffect(() => {
    if (!isFullscreen) {
      setIsMouseActive(true);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      return;
    }

    const handleMouseMove = () => {
      setIsMouseActive(true);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      mouseTimeoutRef.current = window.setTimeout(() => {
        setIsMouseActive(false);
      }, 3000); // Hide cursor after 3 seconds of inactivity
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove(); // Initialize timeout

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  return {
    isFullscreen,
    isMouseActive,
    toggleFullscreen,
  };
}
