import { useState, useCallback, useEffect } from "react";

export function useResizableSidebar(options = {}) {
  const {
    initialWidth = 280,
    minWidth = 220,
    maxWidth = 600,
    direction = "right",
    storageKey = null
  } = options;

  const [width, setWidth] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return Math.min(maxWidth, Math.max(minWidth, parsed));
      }
    }
    return initialWidth;
  });

  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);

    const startX = mouseDownEvent.clientX;
    const startWidth = width;

    const handleMouseMove = (mouseMoveEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      // For right sidebar: drag left (-deltaX) => expand width
      // For left sidebar: drag right (+deltaX) => expand width
      const newWidth = direction === "right" ? startWidth - deltaX : startWidth + deltaX;
      const clamped = Math.min(maxWidth, Math.max(minWidth, newWidth));
      setWidth(clamped);
      if (storageKey) {
        localStorage.setItem(storageKey, String(clamped));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [width, direction, minWidth, maxWidth, storageKey]);

  return { width, isResizing, startResizing };
}
