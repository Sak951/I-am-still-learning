"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "react-spring";

export default function Mascot({ collapsed = false }: { collapsed?: boolean }) {
  const leftEyeRef = useRef<SVGGElement>(null);
  const rightEyeRef = useRef<SVGGElement>(null);
  const [isSmiling, setIsSmiling] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);

  // Gentle float bobbing animation using react-spring
  const floatSpring = useSpring({
    from: { y: 0 },
    to: async (next) => {
      while (true) {
        await next({ y: -4 });
        await next({ y: 4 });
      }
    },
    config: { mass: 2, tension: 80, friction: 12 },
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const getEyeOffset = (eyeEl: SVGGElement | null) => {
        if (!eyeEl) return { x: 0, y: 0 };
        const rect = eyeEl.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        
        const dx = e.clientX - eyeX;
        const dy = e.clientY - eyeY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Pupil travels up to 4.5px from center
        const maxTravel = collapsed ? 2.5 : 4.5;
        const travel = Math.min(maxTravel, dist * 0.03);
        const angle = Math.atan2(dy, dx);
        
        return {
          x: Math.cos(angle) * travel,
          y: Math.sin(angle) * travel
        };
      };

      const leftOffset = getEyeOffset(leftEyeRef.current);
      const rightOffset = getEyeOffset(rightEyeRef.current);

      if (leftEyeRef.current) {
        const pupil = leftEyeRef.current.querySelector(".pupil") as HTMLElement;
        if (pupil) pupil.style.transform = `translate(${leftOffset.x}px, ${leftOffset.y}px)`;
      }
      if (rightEyeRef.current) {
        const pupil = rightEyeRef.current.querySelector(".pupil") as HTMLElement;
        if (pupil) pupil.style.transform = `translate(${rightOffset.x}px, ${rightOffset.y}px)`;
      }
    };

    // Listen to page hover states to smile when hovering buttons/links
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("clickable")
      ) {
        setIsSmiling(true);
      } else {
        setIsSmiling(false);
      }
    };

    // Dynamic random blinks
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4500);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      clearInterval(blinkInterval);
    };
  }, [collapsed]);

  return (
    <animated.div
      style={floatSpring}
      onClick={() => {
        setIsHappy(true);
        setTimeout(() => setIsHappy(false), 1200);
      }}
      className={`relative cursor-pointer select-none group flex items-center justify-center p-1 ${
        collapsed ? "mb-2 mt-1" : "mb-5 mt-2"
      }`}
    >
      {/* Holographic volumetric pulse background */}
      <div className={`absolute inset-0 bg-gradient-to-tr from-brand-purple/20 via-brand-blue/20 to-brand-emerald/20 rounded-full scale-100 group-hover:scale-110 transition-transform duration-500 opacity-60 ${
        collapsed ? "blur-md" : "blur-2xl"
      }`} />

      {/* Volumetric glowing ring */}
      <div className={`absolute rounded-full border border-white/5 bg-white/5 backdrop-blur-[2px] animate-pulse-slow z-0 ${
        collapsed ? "w-10 h-10" : "w-[100px] h-[100px]"
      }`} />

      {/* Main Mascot SVG */}
      <svg
        width="110"
        height="110"
        viewBox="0 0 110 110"
        className={`relative z-10 transition-all duration-300 ${
          collapsed ? "w-10 h-10" : "w-24 h-24 drop-shadow-[0_0_20px_rgba(124,58,237,0.45)] group-hover:drop-shadow-[0_0_30px_rgba(59,130,246,0.65)]"
        }`}
      >
        <defs>
          <radialGradient id="mascot-body" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="45%" stopColor="#8b5cf6" />
            <stop offset="90%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3730a3" />
          </radialGradient>
        </defs>

        {/* Soft Ears */}
        <path d="M 28 35 Q 18 10 38 22" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
        <path d="M 82 35 Q 92 10 72 22" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />

        {/* Main Head Body */}
        <circle cx="55" cy="55" r="40" fill="url(#mascot-body)" />

        {/* Glossy highlight layer */}
        <path d="M 27 35 Q 55 20 83 35 Q 55 28 27 35" fill="white" opacity="0.12" />

        {/* Eyes Section */}
        <g>
          {/* Left Eye */}
          <g ref={leftEyeRef} transform="translate(40, 52)">
            <ellipse
              cx="0"
              cy="0"
              rx="7"
              ry={isBlinking ? 0.8 : 10}
              fill="white"
              className="transition-all duration-100"
            />
            {!isBlinking && (
              <circle
                className="pupil"
                cx="0"
                cy="0"
                r="4"
                fill="#0b0b0f"
                style={{ willChange: "transform" }}
              />
            )}
            {/* Cute sparkle */}
            {!isBlinking && (
              <circle cx="-1.5" cy="-2" r="1.2" fill="white" />
            )}
          </g>

          {/* Right Eye */}
          <g ref={rightEyeRef} transform="translate(70, 52)">
            <ellipse
              cx="0"
              cy="0"
              rx="7"
              ry={isBlinking ? 0.8 : 10}
              fill="white"
              className="transition-all duration-100"
            />
            {!isBlinking && (
              <circle
                className="pupil"
                cx="0"
                cy="0"
                r="4"
                fill="#0b0b0f"
                style={{ willChange: "transform" }}
              />
            )}
            {/* Cute sparkle */}
            {!isBlinking && (
              <circle cx="-1.5" cy="-2" r="1.2" fill="white" />
            )}
          </g>
        </g>

        {/* Blush cheeks */}
        <ellipse cx="28" cy="62" rx="4.5" ry="3" fill="#f43f5e" opacity={isSmiling || isHappy ? 0.5 : 0.15} className="transition-opacity duration-300" />
        <ellipse cx="82" cy="62" rx="4.5" ry="3" fill="#f43f5e" opacity={isSmiling || isHappy ? 0.5 : 0.15} className="transition-opacity duration-300" />

        {/* Mouth */}
        <path
          d={
            isHappy
              ? "M 48 68 Q 55 78 62 68 Z" // Open happy mouth
              : isSmiling
              ? "M 49 70 Q 55 77 61 70" // Wide smile
              : "M 51 71 Q 55 74 59 71" // Small gentle smile
          }
          fill={isHappy ? "#e11d48" : "none"}
          stroke={isHappy ? "#e11d48" : "white"}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-200"
        />
      </svg>
    </animated.div>
  );
}
