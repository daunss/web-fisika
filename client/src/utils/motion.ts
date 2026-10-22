import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export { gsap };

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_QUERY).matches
  );
}

/**
 * Animates the entrance of a scene (tab) and any descendant marked with
 * `data-reveal`. Motion is skipped entirely when the user asks for reduced
 * motion, so content never depends on an animation to become visible.
 */
export function useSceneReveal(key: string) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
    if (targets.length === 0) return;

    const tween = gsap.fromTo(
      targets,
      { y: 14, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.42,
        stagger: 0.055,
        ease: "power2.out",
        clearProps: "opacity,transform",
        overwrite: true,
      }
    );

    return () => {
      tween.kill();
    };
  }, [key]);

  return ref;
}

/** One-shot horizontal sweep, used as a "start" confirmation on the stage. */
export function sweepOnce(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { xPercent: -130, opacity: 0.85 },
    {
      xPercent: 130,
      opacity: 0,
      duration: 0.85,
      ease: "power2.inOut",
      overwrite: true,
    }
  );
}
