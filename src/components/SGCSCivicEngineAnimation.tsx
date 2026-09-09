import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

interface SGCSCivicEngineAnimationProps {
  state: 'A' | 'B';
}

interface DataStrand {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  length: number;
  baseAngle: number;
  phase: number;
  speed: number;
  color: string;
  glowColor: string;
}

interface AmbientParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export const SGCSCivicEngineAnimation: React.FC<SGCSCivicEngineAnimationProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 450);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const strandCount = 180;
    const strands: DataStrand[] = [];

    const strandColors = ['#FFE8B3', '#FAD7A0', '#F5B041', '#E59E35', '#D4841D', '#F7DC6F'];
    const glowColors = ['rgba(255, 240, 179, 0.95)', 'rgba(245, 176, 65, 0.95)', 'rgba(229, 158, 53, 0.95)'];

    // 1. Initialize 180 High-Density 3D Fiber-Optic Strands
    for (let i = 0; i < strandCount; i++) {
      const angle = (i / strandCount) * Math.PI * 2;
      const radius = 92 + Math.random() * 38;

      const stateAX = (Math.random() - 0.5) * 95;
      const stateAY = (Math.random() - 0.5) * 170;
      const stateAZ = (Math.random() - 0.5) * 85;

      const stateBX = Math.cos(angle) * radius;
      const stateBY = Math.sin(angle) * radius;
      const stateBZ = (Math.random() - 0.5) * 45;

      const isA = state === 'A';
      strands.push({
        x: isA ? stateAX : stateBX,
        y: isA ? stateAY : stateBY,
        z: isA ? stateAZ : stateBZ,
        targetX: isA ? stateAX : stateBX,
        targetY: isA ? stateAY : stateBY,
        targetZ: isA ? stateAZ : stateBZ,
        length: 48 + Math.random() * 42,
        baseAngle: angle,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        color: strandColors[i % strandColors.length],
        glowColor: glowColors[i % glowColors.length],
      });
    }

    // 2. Initialize Floating Ambient Light Particles (Spark Dust)
    const ambientParticles: AmbientParticle[] = [];
    for (let p = 0; p < 40; p++) {
      ambientParticles.push({
        x: (Math.random() - 0.5) * 320,
        y: (Math.random() - 0.5) * 320,
        z: (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.6,
      });
    }

    let globalRotation = 0;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.03;
      globalRotation += 0.007;

      const centerX = width / 2;
      const centerY = height / 2;
      const isStateA = state === 'A';

      // Draw Soft Radial Amber Background Aura
      const auraGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 210);
      auraGradient.addColorStop(0, 'rgba(245, 176, 65, 0.14)');
      auraGradient.addColorStop(0.5, 'rgba(229, 158, 53, 0.06)');
      auraGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = auraGradient;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Ambient Spark Particles
      for (let p = 0; p < ambientParticles.length; p++) {
        const pt = ambientParticles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;

        if (pt.y < -180) {
          pt.y = 180;
          pt.x = (Math.random() - 0.5) * 320;
        }

        const pPerspective = 310 / (310 + pt.z);
        const px = centerX + pt.x * pPerspective;
        const py = centerY + pt.y * pPerspective;

        ctx.beginPath();
        ctx.arc(px, py, pt.size * pPerspective, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 179, ${pt.alpha * pPerspective})`;
        ctx.shadowColor = '#F5B041';
        ctx.shadowBlur = 8 * pPerspective;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render 180 3D Fiber-Optic Strands
      for (let i = 0; i < strands.length; i++) {
        const s = strands[i];
        const angle = s.baseAngle;
        const radius = 102 + Math.sin(time * 0.9 + s.phase) * 14;

        if (isStateA) {
          // Flowing 3D Vertical Wave Cluster
          s.targetX = Math.sin(time * 0.6 + i * 0.08) * 45 + (i % 7 - 3) * 15;
          s.targetY = (i - strandCount / 2) * 1.9 + Math.cos(time + i * 0.2) * 18;
          s.targetZ = Math.sin(time * 0.8 + i) * 35;
        } else {
          // Dynamic 3D Iris Engine Ring
          s.targetX = Math.cos(angle + globalRotation) * radius;
          s.targetY = Math.sin(angle + globalRotation) * radius;
          s.targetZ = Math.sin(time * 1.4 + i) * 26;
        }

        // Fluid spring physics interpolation
        s.x += (s.targetX - s.x) * 0.065;
        s.y += (s.targetY - s.y) * 0.065;
        s.z += (s.targetZ - s.z) * 0.065;

        // 3D Perspective Projection
        const perspective = 310 / (310 + s.z);
        const screenX = centerX + s.x * perspective;
        const screenY = centerY + s.y * perspective;

        const tipAngle = isStateA
          ? Math.PI / 2 + Math.sin(time + i * 0.1) * 0.25
          : Math.atan2(s.y, s.x) + Math.sin(time + s.phase) * 0.12;

        const tipX = screenX + Math.cos(tipAngle) * s.length * perspective;
        const tipY = screenY + Math.sin(tipAngle) * s.length * perspective;

        // Create Fiber-Optic Gradient (Root -> Tip)
        const lineGradient = ctx.createLinearGradient(screenX, screenY, tipX, tipY);
        lineGradient.addColorStop(0, 'rgba(255, 232, 179, 0.15)');
        lineGradient.addColorStop(0.4, s.color);
        lineGradient.addColorStop(1, '#FFFFFF');

        // Render Strand Curve
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        const ctrlX = (screenX + tipX) / 2 + Math.sin(time * 1.2 + s.phase) * 12;
        const ctrlY = (screenY + tipY) / 2 + Math.cos(time * 1.2 + s.phase) * 12;
        ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);

        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = Math.max(1.1, 2.5 * perspective);
        ctx.globalAlpha = Math.min(1, Math.max(0.3, (s.z + 120) / 185));
        ctx.stroke();

        // Render Hyper-Glowing Fiber Tip Node
        ctx.beginPath();
        ctx.arc(tipX, tipY, 3.6 * perspective, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = s.glowColor;
        ctx.shadowBlur = 15 * perspective;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 3D CANVAS ANIMATION ENGINE */}
      <Box
        ref={canvasRef}
        component="canvas"
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* OVERLAY NATIVE SGCS MUNICIPAL METRIC CHIPS */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '50px',
          px: 2,
          py: 0.75,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#E59E35', boxShadow: '0 0 10px #E59E35' }} />
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', fontWeight: 700, color: '#111111' }}>
          {state === 'A' ? 'LIVE TRIAGE DISPATCH' : 'AI WARD IRIS ENGINE'}
        </Typography>
      </Box>

      {/* TOP-RIGHT METRIC BADGE */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '50px',
          px: 2,
          py: 0.75,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', fontWeight: 700, color: '#111111' }}>
          {state === 'A' ? '98.4% RESOLUTION' : '50 WARDS CONNECTED'}
        </Typography>
      </Box>

    </Box>
  );
};

export default SGCSCivicEngineAnimation;
