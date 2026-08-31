import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RevealAnimation = "fadeInUp" | "fadeIn" | "zoomIn";

interface RevealProps {
  children: ReactNode;
  animation?: RevealAnimation;
  className?: string;
  delay?: number;
}

/**
 * Lightweight, one-time viewport reveal. Content remains visible when motion is
 * reduced or IntersectionObserver is unavailable.
 */
export function Reveal({ children, animation = "fadeInUp", className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "motion-reveal",
        isVisible && "animate__animated",
        isVisible && `animate__${animation}`,
        className,
      )}
      style={isVisible && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
