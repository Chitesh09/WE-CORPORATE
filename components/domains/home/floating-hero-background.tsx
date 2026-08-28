"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function FloatingHeroBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Responsive floating parallax offset
  const translateY = isMobile
    ? Math.min(Math.max(scrollY * 0.08, 0), 40)
    : Math.min(Math.max(scrollY * 0.15, 0), 100);

  const scale = isMobile
    ? 1.01
    : 1.04 + Math.min(scrollY * 0.0002, 0.06);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Floating Image Layer with Responsive Height and Object Fit */}
      <div
        className="absolute top-0 left-0 right-0 h-[420px] sm:h-full w-full will-change-transform transition-transform duration-100 ease-out"
        style={{
          transform: `translate3d(0, -${translateY}px, 0) scale(${scale})`,
        }}
      >
        <Image
          src="/images/hero-bg.jpg"
          alt="Ambitious talent and graduates celebrating career milestones"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          className="object-cover object-[center_15%] sm:object-center filter brightness-[1.02]"
        />
      </div>

      {/* Crystal-clear readability overlay ensuring text, headings and badges stay 100% visible on mobile and desktop */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/88 via-60% to-surface-canvas/98 backdrop-blur-[0.5px]" />
    </div>
  );
}
