import { useCallback, useLayoutEffect, useRef, useState } from "react";

// Hand-rolled windowed rendering: tracks a scroll container's offset + viewport
// size and derives which fixed-size-item index range falls within (or just
// outside, via `overscan`) the visible area. Used for both vertical lists
// (row height) and horizontal ones (column width) by switching `axis`.
//
// `resetKey` identifies "which list" is being shown (e.g. the active file's
// id, or a filter's text). The scroll container is reused across re-renders
// even when its content is swapped out for something unrelated (switching
// file tabs, narrowing a filter), so without this the old scroll offset
// would be replayed against the new, differently-sized content — producing
// a blank or wrong slice until the user scrolls again. When `resetKey`
// changes, the offset snaps back to the top/left. The `maxOffset` clamp
// below is a second line of defense for cases `resetKey` doesn't cover
// (e.g. the same list simply getting shorter).
export function useVirtualScroll({ count, itemSize, overscan = 6, axis = "y", resetKey }) {
  // A plain useRef's `.current` mutation doesn't retrigger effects, so if the
  // container isn't mounted yet on the first commit (e.g. an early-return
  // empty state before this hook's consumer has data), the measurement below
  // would never run again once the real element shows up. A callback ref
  // backed by state fixes that: React calls it — and updates `containerEl` —
  // every time the underlying DOM node is attached, including on a later
  // render than the hook's own mount.
  const [containerEl, setContainerEl] = useState(null);
  const containerRef = useCallback((node) => setContainerEl(node), []);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(0);
  const prevResetKeyRef = useRef(resetKey);

  useLayoutEffect(() => {
    if (!containerEl) return;
    const measure = () => setViewportSize(axis === "x" ? containerEl.clientWidth : containerEl.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [containerEl, axis]);

  useLayoutEffect(() => {
    if (prevResetKeyRef.current === resetKey) return;
    prevResetKeyRef.current = resetKey;
    setScrollOffset(0);
    if (!containerEl) return;
    if (axis === "x") containerEl.scrollLeft = 0; else containerEl.scrollTop = 0;
  }, [resetKey, axis, containerEl]);

  const onScroll = useCallback((e) => {
    setScrollOffset(axis === "x" ? e.currentTarget.scrollLeft : e.currentTarget.scrollTop);
  }, [axis]);

  const maxOffset = Math.max(0, count * itemSize - viewportSize);
  const clampedOffset = Math.min(scrollOffset, maxOffset);

  const visibleCount = itemSize > 0 ? Math.ceil(viewportSize / itemSize) : 0;
  const rawStart = itemSize > 0 ? Math.floor(clampedOffset / itemSize) : 0;
  const start = Math.max(0, Math.min(count, rawStart - overscan));
  const end = Math.max(start, Math.min(count, rawStart + visibleCount + overscan));

  return {
    containerRef,
    onScroll,
    start,
    end,
    totalSize: count * itemSize,
    offset: start * itemSize,
  };
}
