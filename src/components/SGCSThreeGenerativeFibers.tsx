import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';

export const SGCSThreeGenerativeFibers: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 460;
    let height = container.clientHeight || 460;

    // 1. THREE.JS SCENE, CAMERA, & RENDERER
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 320);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf5b041, 2.5, 500);
    pointLight.position.set(50, 50, 100);
    scene.add(pointLight);

    // 3. GENERATIVE STRAND DATA STRUCTURE (220 Strands x 24 Segments each)
    const strandCount = 220;
    const segmentsPerStrand = 24;
    const totalVertices = strandCount * segmentsPerStrand;

    // Target Positions for 4 Morph States
    const posStateA = new Float32Array(totalVertices * 3);
    const posStateB = new Float32Array(totalVertices * 3);
    const posStateC = new Float32Array(totalVertices * 3);
    const posStateD = new Float32Array(totalVertices * 3);

    const currentPositions = new Float32Array(totalVertices * 3);
    const colorArray = new Float32Array(totalVertices * 3);

    // Color Palette
    const darkColor = new THREE.Color(0x2d1f17);  // Dark brown body
    const midColor = new THREE.Color(0xd4841d);   // Warm amber mid
    const goldColor = new THREE.Color(0xf5b041);  // Golden orange highlight
    const tipColor = new THREE.Color(0xfff0b3);   // Glowing white-gold tip

    for (let i = 0; i < strandCount; i++) {
      const strandRatio = i / strandCount;
      const angle = strandRatio * Math.PI * 2;
      const spreadX = (Math.random() - 0.5) * 80;
      const spreadZ = (Math.random() - 0.5) * 60;
      const radius = 88 + Math.random() * 32;

      for (let j = 0; j < segmentsPerStrand; j++) {
        const segRatio = j / (segmentsPerStrand - 1);
        const idx = (i * segmentsPerStrand + j) * 3;

        // --- STATE A: Hanging Organic Fiber Bundle (Top-to-Bottom) ---
        posStateA[idx] = spreadX + Math.sin(segRatio * Math.PI * 1.5 + i) * 14;
        posStateA[idx + 1] = 90 - segRatio * 170 + Math.sin(i * 0.1) * 8;
        posStateA[idx + 2] = spreadZ + Math.cos(segRatio * Math.PI + i) * 16;

        // --- STATE B: Sweeping Upward/Sideways Wave ---
        posStateB[idx] = (strandRatio - 0.5) * 150 + Math.sin(segRatio * 3 + i) * 22;
        posStateB[idx + 1] = Math.sin(strandRatio * Math.PI + segRatio * 2) * 80 - 40;
        posStateB[idx + 2] = Math.cos(strandRatio * Math.PI * 2) * 45;

        // --- STATE C: Horizontal Curved Fan Shape ---
        const fanAngle = (strandRatio - 0.5) * Math.PI * 1.4;
        const fanRadius = 40 + segRatio * 110;
        posStateC[idx] = Math.sin(fanAngle) * fanRadius;
        posStateC[idx + 1] = Math.cos(fanAngle) * fanRadius * 0.65 - 35;
        posStateC[idx + 2] = Math.sin(segRatio * Math.PI) * 35;

        // --- STATE D: Circular Radial Iris Ring ---
        const ringRadius = 75 + segRatio * 52;
        const ringAngle = angle + (segRatio - 0.5) * 0.35;
        posStateD[idx] = Math.cos(ringAngle) * ringRadius;
        posStateD[idx + 1] = Math.sin(ringAngle) * ringRadius;
        posStateD[idx + 2] = (Math.random() - 0.5) * 25 + Math.sin(segRatio * Math.PI) * 18;

        // Initialize current position to State A
        currentPositions[idx] = posStateA[idx];
        currentPositions[idx + 1] = posStateA[idx + 1];
        currentPositions[idx + 2] = posStateA[idx + 2];

        // Color Gradient: Dark Root -> Amber Mid -> Glowing Tip
        let vertexColor = darkColor.clone();
        if (segRatio > 0.4 && segRatio <= 0.75) {
          vertexColor.lerp(midColor, (segRatio - 0.4) / 0.35);
        } else if (segRatio > 0.75 && segRatio <= 0.92) {
          vertexColor.copy(midColor).lerp(goldColor, (segRatio - 0.75) / 0.17);
        } else if (segRatio > 0.92) {
          vertexColor.copy(goldColor).lerp(tipColor, (segRatio - 0.92) / 0.08);
        }

        colorArray[idx] = vertexColor.r;
        colorArray[idx + 1] = vertexColor.g;
        colorArray[idx + 2] = vertexColor.b;
      }
    }

    // Build Line Segments Geometry
    const lineIndices: number[] = [];
    for (let i = 0; i < strandCount; i++) {
      for (let j = 0; j < segmentsPerStrand - 1; j++) {
        const base = i * segmentsPerStrand + j;
        lineIndices.push(base, base + 1);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(lineIndices);
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      linewidth: 1.5,
    });

    const strandLines = new THREE.LineSegments(geometry, lineMaterial);
    scene.add(strandLines);

    // 4. FLOATING AMBIENT SPARK PARTICLES
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount; p++) {
      particlePos[p * 3] = (Math.random() - 0.5) * 260;
      particlePos[p * 3 + 1] = (Math.random() - 0.5) * 260;
      particlePos[p * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfff0b3,
      size: 2.8,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. CONTINUOUS 8-SECOND TIMELINE MORPHING LOOP (State A -> B -> C -> D -> A)
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const loopTime = elapsedTime % 8.0; // 8-second cycle

      let factor = 0;
      let fromPos = posStateA;
      let toPos = posStateB;

      if (loopTime >= 0 && loopTime < 2.5) {
        // Phase 1: Hanging Bundle (0.0s - 2.5s)
        fromPos = posStateA;
        toPos = posStateA;
        factor = 0;
      } else if (loopTime >= 2.5 && loopTime < 4.0) {
        // Phase 2: Sweeping Wave Transition (2.5s - 4.0s)
        fromPos = posStateA;
        toPos = posStateB;
        factor = (loopTime - 2.5) / 1.5;
      } else if (loopTime >= 4.0 && loopTime < 5.5) {
        // Phase 3: Horizontal Fan (4.0s - 5.5s)
        fromPos = posStateB;
        toPos = posStateC;
        factor = (loopTime - 4.0) / 1.5;
      } else if (loopTime >= 5.5 && loopTime < 7.0) {
        // Phase 4: Circular Radial Ring (5.5s - 7.0s)
        fromPos = posStateC;
        toPos = posStateD;
        factor = (loopTime - 5.5) / 1.5;
      } else {
        // Phase 5: Smooth Loop back to State A (7.0s - 8.0s)
        fromPos = posStateD;
        toPos = posStateA;
        factor = (loopTime - 7.0) / 1.0;
      }

      // Smooth Easing (Cubic)
      const easeFactor = factor < 0.5 ? 4 * factor * factor * factor : 1 - Math.pow(-2 * factor + 2, 3) / 2;

      // Update Strand Vertices
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < totalVertices * 3; i += 3) {
        const waveOffset = Math.sin(elapsedTime * 1.5 + i * 0.05) * 1.8;
        posArr[i] = lerp(fromPos[i], toPos[i], easeFactor) + waveOffset;
        posArr[i + 1] = lerp(fromPos[i + 1], toPos[i + 1], easeFactor) + Math.cos(elapsedTime * 1.2 + i * 0.05) * 1.5;
        posArr[i + 2] = lerp(fromPos[i + 2], toPos[i + 2], easeFactor);
      }
      posAttr.needsUpdate = true;

      // Gentle Scene Rotation
      strandLines.rotation.y = Math.sin(elapsedTime * 0.3) * 0.18;
      strandLines.rotation.z = Math.cos(elapsedTime * 0.25) * 0.08;

      // Particle Drift
      const pPosAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const pPosArr = pPosAttr.array as Float32Array;
      for (let p = 0; p < particleCount; p++) {
        pPosArr[p * 3 + 1] += 0.15;
        if (pPosArr[p * 3 + 1] > 140) pPosArr[p * 3 + 1] = -140;
      }
      pPosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 6. RESPONSIVE RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      lineMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <Box
      ref={mountRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    />
  );
};

export default SGCSThreeGenerativeFibers;
