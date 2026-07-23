"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear duplicate canvases (fixes double mount in StrictMode)
    container.innerHTML = "";

    // Dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080a, 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 25;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.debug.checkShaderErrors = false;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles (Neural Core Nodes)
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions: number[][] = [];

    // Distribute particles in a spherical layout
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 6 + Math.random() * 1.5; // sphere radius

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions.push([x, y, z]);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Particle texture (simple soft circular particle)
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    // Node Material
    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      color: 0x7c3aed // Purple accent
    });

    const neuralPoints = new THREE.Points(geometry, material);
    scene.add(neuralPoints);

    // Dynamic Connections (Mesh Network Lines)
    const maxConnections = 600;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);

    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.15,
      depthWrite: false
    });

    const connectionLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(connectionLines);

    // Volumetric Holographic Rings
    const ringCount = 180;
    const createRing = (radius: number, colorHex: number) => {
      const ringGeom = new THREE.BufferGeometry();
      const ringPos = new Float32Array(ringCount * 3);

      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2;
        ringPos[i * 3] = radius * Math.cos(angle);
        ringPos[i * 3 + 1] = 0;
        ringPos[i * 3 + 2] = radius * Math.sin(angle);
      }

      ringGeom.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
      const ringMat = new THREE.PointsMaterial({
        size: 0.2,
        map: texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6,
        color: colorHex
      });
      return new THREE.Points(ringGeom, ringMat);
    };

    const outerRing = createRing(11, 0x3b82f6); // Blue ring
    const innerRing = createRing(9, 0x10b981);  // Emerald ring

    // Angle the rings for dynamic orbital look
    outerRing.rotation.x = Math.PI / 3;
    outerRing.rotation.y = Math.PI / 6;
    innerRing.rotation.x = -Math.PI / 4;
    innerRing.rotation.z = Math.PI / 5;

    scene.add(outerRing);
    scene.add(innerRing);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.02;
      targetY = (e.clientY - window.innerHeight / 2) * 0.02;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth mouse damping (lerp)
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Group rotation based on mouse coordinate
      neuralPoints.rotation.y = elapsedTime * 0.08 + mouseX * 0.1;
      neuralPoints.rotation.x = elapsedTime * 0.05 + mouseY * 0.1;

      outerRing.rotation.y = -elapsedTime * 0.12;
      innerRing.rotation.y = elapsedTime * 0.18;

      // Deform sphere particles (synaptic breathe effect)
      const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
      const positionsArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const x = originalPositions[i][0];
        const y = originalPositions[i][1];
        const z = originalPositions[i][2];

        // Complex sine wave morphing
        const pulse = 1.0 + 0.08 * Math.sin(elapsedTime * 1.5 + x * 0.3 + y * 0.2);
        positionsArr[i * 3] = x * pulse;
        positionsArr[i * 3 + 1] = y * pulse;
        positionsArr[i * 3 + 2] = z * pulse;
      }
      posAttr.needsUpdate = true;

      // Update Mesh Network connections
      let lineIndex = 0;
      const points = positionsArr;
      const lines = lineGeometry.getAttribute("position").array as Float32Array;
      const colors = lineGeometry.getAttribute("color").array as Float32Array;

      // Clean line buffers
      for (let i = 0; i < lines.length; i++) {
        lines[i] = 0;
      }

      // Check distance pairs
      for (let i = 0; i < particleCount; i++) {
        if (lineIndex >= maxConnections) break;

        const x1 = points[i * 3];
        const y1 = points[i * 3 + 1];
        const z1 = points[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          if (lineIndex >= maxConnections) break;

          const x2 = points[j * 3];
          const y2 = points[j * 3 + 1];
          const z2 = points[j * 3 + 2];

          const dist = Math.sqrt(
            (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2
          );

          if (dist < 3.8) {
            // Add Line segment
            const idx = lineIndex * 6;
            lines[idx] = x1;
            lines[idx + 1] = y1;
            lines[idx + 2] = z1;
            lines[idx + 3] = x2;
            lines[idx + 4] = y2;
            lines[idx + 5] = z2;

            // Fade line color based on proximity
            const alpha = 1.0 - dist / 3.8;
            const cIdx = lineIndex * 6;

            // Start color: purple gradient
            colors[cIdx] = 0.49 * alpha;
            colors[cIdx + 1] = 0.23 * alpha;
            colors[cIdx + 2] = 0.93 * alpha;

            // End color: cyan gradient
            colors[cIdx + 3] = 0.23 * alpha;
            colors[cIdx + 4] = 0.51 * alpha;
            colors[cIdx + 5] = 0.96 * alpha;

            lineIndex++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex * 2);
      lineGeometry.getAttribute("position").needsUpdate = true;
      lineGeometry.getAttribute("color").needsUpdate = true;

      // Volumetric camera hover
      camera.position.x = mouseX * 0.4;
      camera.position.y = -mouseY * 0.4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      outerRing.geometry.dispose();
      (outerRing.material as THREE.Material).dispose();
      innerRing.geometry.dispose();
      (innerRing.material as THREE.Material).dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
