import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref. Once the element
 * scrolls into view, "reveal-active" is added so its .reveal children
 * (see src/index.css) transition into place. Falls back to immediately
 * visible if IntersectionObserver is unavailable.
 */
function useReveal(options) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("reveal-active");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add("reveal-active");
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px", ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}

export default useReveal;
