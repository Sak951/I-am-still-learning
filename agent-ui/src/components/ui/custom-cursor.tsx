"use client";

import React, { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    // Track mouse coordinate
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Position small dot instantly
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    // Damped animation loop for the trailing ring
    let animationFrameId: number;
    const animate = () => {
      // Damping interpolation (0.15 = lag speed)
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Click feedback scale pulse
    const handleMouseDown = () => {
      ring.style.transform += " scale(0.75)";
      ring.style.borderColor = "#10b981"; // Shift to green on press
    };

    const handleMouseUp = () => {
      ring.style.transform = ring.style.transform.replace(" scale(0.75)", "");
      ring.style.borderColor = "rgba(124, 58, 237, 0.4)";
    };

    // Hover listeners to scale up ring on anchors and buttons
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.tagName === "TEXTAREA" ||
        target.classList.contains("clickable-hover")
      ) {
        ring.classList.add("ring-hover");
        dot.classList.add("dot-hover");
      } else {
        ring.classList.remove("ring-hover");
        dot.classList.remove("dot-hover");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Small tracking core dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out hidden md:block"
        style={{ willChange: "transform" }}
      />
      {/* Volumetric glow lag ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-brand-purple/40 pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out flex items-center justify-center bg-brand-purple/5 shadow-[0_0_15px_rgba(124,58,237,0.15)] hidden md:block"
        style={{ willChange: "transform" }}
      />

      <style jsx global>{`
        .ring-hover {
          width: 2.2rem !important;
          height: 2.2rem !important;
          background-color: rgba(59, 130, 246, 0.08) !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
          shadow-[0_0_25px_rgba(59,130,246,0.3)] !important;
        }
        .dot-hover {
          width: 0.25rem !important;
          height: 0.25rem !important;
          background-color: #3b82f6 !important;
        }
        /* Disable cursor in OS workspace for custom tracker */
        @media (min-width: 768px) {
          body, button, a, textarea, select, input {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
