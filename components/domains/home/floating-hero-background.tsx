"use client";

import { useEffect, useState } from "react";

export function FloatingHeroBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 35,
        y: (e.clientY / window.innerHeight - 0.5) * 35,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Parallax translation coordinates for glowing ambient orbs
  const translateY1 = Math.min(scrollY * 0.16, 120);
  const translateY2 = Math.min(scrollY * 0.1, 80);
  const translateY3 = Math.min(scrollY * 0.22, 150);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-surface-canvas">
      {/* Ambient Floating Gradient Mesh Orbs with Hover & Scroll Parallax */}
      <div
        className="absolute -top-[12%] left-[8%] w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-gradient-to-br from-brand-accent/15 via-teal-200/10 to-transparent blur-3xl will-change-transform transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 0.8}px, ${-translateY1 + mousePos.y * 0.8}px, 0)`,
        }}
      />
      <div
        className="absolute top-[18%] -right-[8%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-bl from-blue-400/10 via-sky-300/15 to-transparent blur-3xl will-change-transform transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${-mousePos.x * 0.6}px, ${-translateY2 - mousePos.y * 0.6}px, 0)`,
        }}
      />
      <div
        className="absolute top-[55%] left-[20%] w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full bg-gradient-to-tr from-emerald-300/10 via-brand-accent/10 to-transparent blur-3xl will-change-transform transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 0.4}px, ${-translateY3 + mousePos.y * 0.4}px, 0)`,
        }}
      />

      {/* Subtle Geometric Ambient Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a06_1px,transparent_1px),linear-gradient(to_bottom,#0f172a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Protective Surface Overlay ensuring 100% Crisp Typography */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-surface-canvas/50 to-surface-canvas/90" />
    </div>
  );
}
