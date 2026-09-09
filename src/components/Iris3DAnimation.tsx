import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface Iris3DAnimationProps {
  state: 'A' | 'B';
}

interface Strand {
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

export const Iris3DAnimation: React.FC<Iris3DAnimationProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const strandCount = 160;
    const strands: Strand[] = [];

    // Initialize 160 high-density fiber optic strands
    for (let i = 0; i < strandCount; i++) {
      const angle = (i / strandCount) * Math.PI * 2;
      const radius = 95 + Math.random() * 35;

      const stateAX = (Math.random() - 0.5) * 90;
      const stateAY = (Math.random() - 0.5) * 160;
      const stateAZ = (Math.random() - 0.5) * 80;

      const stateBX = Math.cos(angle) * radius;
      const stateBY = Math.sin(angle) * radius;
      const stateBZ = (Math.random() - 0.5) * 45;

      const isA = state === 'A';
      const colors = ['#FAD7A0', '#F5B041', '#E59E35', '#D4841D', '#F7DC6F'];
      const glowColors = ['rgba(245, 176, 65, 0.9)', 'rgba(229, 158, 53, 0.9)', 'rgba(212, 132, 29, 0.9)'];

      strands.push({
        x: isA ? stateAX : stateBX,
        y: isA ? stateAY : stateBY,
        z: isA ? stateAZ : stateBZ,
        targetX: isA ? stateAX : stateBX,
        targetY: isA ? stateAY : stateBY,
        targetZ: isA ? stateAZ : stateBZ,
        length: 50 + Math.random() * 40,
        baseAngle: angle,
        phase: Math.random() * Math.PI * 2,
        speed: 0.025 + Math.random() * 0.035,
        color: colors[i % colors.length],
        glowColor: glowColors[i % glowColors.length],
      });
    }

    let globalRotation = 0;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.035;
      globalRotation += 0.009;

      const centerX = width / 2;
      const centerY = height / 2;

      const isStateA = state === 'A';

      for (let i = 0; i < strands.length; i++) {
        const s = strands[i];
        const angle = s.baseAngle;
        const radius = 100 + Math.sin(time + s.phase) * 14;

        if (isStateA) {
          // Flowing 3D vertical wave cluster
          s.targetX = Math.sin(time * 0.6 + i * 0.08) * 45 + (i % 7 - 3) * 16;
          s.targetY = (i - strandCount / 2) * 2.1 + Math.cos(time + i * 0.2) * 18;
          s.targetZ = Math.sin(time * 0.8 + i) * 35;
        } else {
          // Dynamic 3D Iris Ring
          s.targetX = Math.cos(angle + globalRotation) * radius;
          s.targetY = Math.sin(angle + globalRotation) * radius;
          s.targetZ = Math.sin(time * 1.4 + i) * 28;
        }

        // Fluid spring physics interpolation
        s.x += (s.targetX - s.x) * 0.065;
        s.y += (s.targetY - s.y) * 0.065;
        s.z += (s.targetZ - s.z) * 0.065;

        // 3D Perspective Projection
        const perspective = 320 / (320 + s.z);
        const screenX = centerX + s.x * perspective;
        const screenY = centerY + s.y * perspective;

        // Determine tip angle based on current state & motion vector
        const tipAngle = isStateA
          ? Math.PI / 2 + Math.sin(time + i * 0.1) * 0.25
          : Math.atan2(s.y, s.x) + Math.sin(time + s.phase) * 0.1;

        const tipX = screenX + Math.cos(tipAngle) * s.length * perspective;
        const tipY = screenY + Math.sin(tipAngle) * s.length * perspective;

        // Render Fiber-Optic Tendril Strand
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        const ctrlX = (screenX + tipX) / 2 + Math.sin(time + s.phase) * 12;
        const ctrlY = (screenY + tipY) / 2 + Math.cos(time + s.phase) * 12;
        ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);

        ctx.strokeStyle = s.color;
        ctx.lineWidth = Math.max(1, 2.4 * perspective);
        ctx.globalAlpha = Math.min(1, Math.max(0.3, (s.z + 120) / 180));
        ctx.stroke();

        // Render Glowing Fiber Tip Particle
        ctx.beginPath();
        ctx.arc(tipX, tipY, 3.5 * perspective, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = s.glowColor;
        ctx.shadowBlur = 14 * perspective;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
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
    <Box
      ref={canvasRef}
      component="canvas"
      sx={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};

export default Iris3DAnimation;
