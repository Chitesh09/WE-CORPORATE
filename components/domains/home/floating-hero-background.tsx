"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function FloatingHeroBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth floating parallax offset
  const translateY = Math.min(Math.max(scrollY * 0.15, 0), 100);
  const scale = 1.04 + Math.min(scrollY * 0.0002, 0.06);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Floating Image Layer with Hardware Accelerated Transform */}
      <div
        className="absolute inset-0 w-full h-full will-change-transform transition-transform duration-100 ease-out"
        style={{
          transform: `translate3d(0, -${translateY}px, 0) scale(${scale})`,
        }}
      >
        <Image
          src="/images/hero-bg.jpg"
          alt="Ambitious talent and graduates celebrating career milestones"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:object-center"
        />
      </div>

      {/* Crystal-clear readability overlay ensuring text, headings and badges stay 100% visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/93 via-white/85 to-surface-canvas/95 backdrop-blur-[0.5px]" />
    </div>
  );
}
