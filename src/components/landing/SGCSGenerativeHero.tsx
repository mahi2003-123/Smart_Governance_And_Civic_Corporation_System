import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

import "./SGCSGenerativeHero.css";

const FIBERS = 320;
const POINTS = 48;

export const HANGING = 0;
export const SWEEP = 1;
export const FAN = 2;
export const RING = 3;

type Fiber = {
  line: THREE.Line;
  glow: THREE.Line;
  states: Float32Array[];
  seed: number;
  phase: number;
  speed: number;
};

function random(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoother(t: number) {
  t = clamp01(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function bezier(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number
) {
  const u = 1 - t;

  return new THREE.Vector3(
    u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x,

    u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y,

    u * u * u * p0.z +
      3 * u * u * t * p1.z +
      3 * u * t * t * p2.z +
      t * t * t * p3.z
  );
}

/**
 * Creates target positions for one fiber state.
 */
function createState(
  fiberIndex: number,
  state: number
): Float32Array {
  const positions = new Float32Array(POINTS * 3);

  const r1 = random(fiberIndex * 17.31 + 1);
  const r2 = random(fiberIndex * 31.17 + 2);
  const r3 = random(fiberIndex * 53.71 + 3);
  const r4 = random(fiberIndex * 71.29 + 4);

  for (let p = 0; p < POINTS; p++) {
    const t = p / (POINTS - 1);

    let x = 0;
    let y = 0;
    let z = 0;

    // STATE 0: HANGING
    if (state === HANGING) {
      const normalized = fiberIndex / (FIBERS - 1);
      const horizontalSpread = 7.8;
      const baseX = (normalized - 0.5) * horizontalSpread;
      const topY = 4.2 + r1 * 1.4;
      const bottomY = -2.2 - r2 * 1.6;
      const curve = Math.sin(t * Math.PI * 1.5 + fiberIndex * 0.11) * (0.2 + r3 * 0.4);
      const wave = Math.sin(t * Math.PI * 3 + fiberIndex * 0.07) * 0.1;

      x = baseX + curve + wave;
      y = THREE.MathUtils.lerp(topY, bottomY, t);
      z = (r4 - 0.5) * 2.2 + Math.sin(t * Math.PI * 2 + fiberIndex) * 0.15;
    }
    // STATE 1: SWEEP / FLOW
    else if (state === SWEEP) {
      const normalized = fiberIndex / (FIBERS - 1);
      const baseX = (normalized - 0.5) * 8.2;
      const start = new THREE.Vector3(baseX, 3.2 + r1, (r2 - 0.5) * 1.6);
      const end = new THREE.Vector3(baseX * 0.55 + 1.2, -0.8 + baseX * 0.35, (r3 - 0.7) * 1.8);
      const control1 = new THREE.Vector3(baseX * 0.95, 1.6 + r4, 0.7);
      const control2 = new THREE.Vector3(baseX * 0.2 + 2.2, -0.2, -0.6);
      const point = bezier(start, control1, control2, end, t);

      x = point.x + Math.sin(t * Math.PI * 4 + fiberIndex) * 0.09;
      y = point.y + Math.sin(t * Math.PI * 2 + fiberIndex * 0.2) * 0.11;
      z = point.z;
    }
    // STATE 2: FAN / SPREAD
    else if (state === FAN) {
      const normalized = fiberIndex / (FIBERS - 1);
      const angle = THREE.MathUtils.lerp(-1.4, 1.4, normalized);
      const innerRadius = 0.1 + r1 * 0.3;
      const outerRadius = 4.4 + r2 * 1.6;
      const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, t);
      const fanCurve = Math.sin(t * Math.PI) * (0.35 + r3 * 0.45);

      x = Math.cos(angle) * radius + fanCurve + 1.0;
      y = Math.sin(angle) * radius * 0.68 - 0.25;
      z = (r4 - 0.5) * 1.6 + Math.sin(t * Math.PI) * 0.4;
    }
    // STATE 3: RING / RADIAL FORM
    else if (state === RING) {
      const normalized = fiberIndex / FIBERS;
      const angle = normalized * Math.PI * 2;
      const innerRadius = 0.75 + r1 * 0.25;
      const outerRadius = 3.8 + r2 * 1.3;
      const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, t);
      const organic = Math.sin(t * Math.PI) * (0.2 + r3 * 0.4);
      const twist = Math.sin(t * Math.PI) * (r4 - 0.5) * 0.25;
      const finalAngle = angle + twist;

      x = Math.cos(finalAngle) * (radius + organic) + 1.2;
      y = Math.sin(finalAngle) * (radius + organic) * 0.75;
      z = Math.sin(t * Math.PI) * 0.5 + (r3 - 0.5) * 0.85;
    }

    positions[p * 3] = x;
    positions[p * 3 + 1] = y;
    positions[p * 3 + 2] = z;
  }

  return positions;
}

interface SGCSGenerativeHeroProps {
  onPhaseChange?: (phase: number) => void;
  activePhase?: number;
}

export default function SGCSGenerativeHero({ onPhaseChange }: SGCSGenerativeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef({ state: HANGING, progress: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE WITH 100% TRANSPARENT BACKGROUND FOR STUDIO WHITE THEME
    const scene = new THREE.Scene();
    scene.background = null;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8.5);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // 100% transparent clear

    container.appendChild(renderer.domElement);

    // MAIN FIBER GROUP
    const group = new THREE.Group();
    scene.add(group);
    group.position.set(0.7, 0, 0);

    // FIBER MATERIALS & PALETTE FOR WHITE STUDIO THEME
    const fibers: Fiber[] = [];
    const richGold = new THREE.Color("#c88a32");
    const brightAmber = new THREE.Color("#e59e35");
    const deepBronze = new THREE.Color("#4a2c0c");
    const darkGolden = new THREE.Color("#784b12");

    for (let i = 0; i < FIBERS; i++) {
      const states = [
        createState(i, HANGING),
        createState(i, SWEEP),
        createState(i, FAN),
        createState(i, RING),
      ];

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(states[0].slice(), 3));

      const seed = random(i * 9.73);
      let color = richGold;
      if (seed < 0.22) color = deepBronze;
      else if (seed < 0.48) color = darkGolden;
      else if (seed > 0.78) color = brightAmber;

      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.68 + seed * 0.3,
        depthWrite: false,
      });

      const line = new THREE.Line(geometry, material);

      // Glow line overlay for vibrant fiber definition on white studio background
      const glowGeometry = new THREE.BufferGeometry();
      glowGeometry.setAttribute("position", new THREE.BufferAttribute(states[0].slice(), 3));

      const glowMaterial = new THREE.LineBasicMaterial({
        color: "#e59e35",
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
      });

      const glow = new THREE.Line(glowGeometry, glowMaterial);

      group.add(line);
      group.add(glow);

      fibers.push({
        line,
        glow,
        states,
        seed,
        phase: seed * Math.PI * 2,
        speed: 0.45 + seed * 0.8,
      });
    }

    // PARTICLE FIELD
    const particleCount = 320;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (random(i * 2.1) - 0.4) * 9.5;
      particlePositions[i * 3 + 1] = (random(i * 3.7) - 0.5) * 8.5;
      particlePositions[i * 3 + 2] = (random(i * 4.8) - 0.5) * 5;
      particleSizes[i] = 0.02 + random(i * 5.3) * 0.045;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(particleSizes, 1));

    // SHADER FOR SPARK PARTICLES
    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,

      uniforms: {
        uTime: { value: 0 },
      },

      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        varying float vAlpha;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float pulse = 0.65 + 0.35 * sin(uTime * 1.8 + position.x * 2.0 + position.y);
          gl_PointSize = aSize * 115.0 * pulse * (8.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vAlpha = pulse;
        }
      `,

      fragmentShader: `
        varying float vAlpha;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float distanceFromCenter = length(uv);
          float glow = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);
          vec3 gold = vec3(0.85, 0.55, 0.12);
          gl_FragColor = vec4(gold, glow * vAlpha * 0.9);
        }
      `,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ANIMATION CONTROLLER WITH GSAP TIMELINE SYNCHRONIZATION
    const animObj = animationRef.current;
    const timeline = gsap.timeline({ repeat: -1 });

    const notifyPhase = (p: number) => {
      if (onPhaseChange) onPhaseChange(p);
    };

    timeline
      .set(animObj, { state: HANGING, progress: 0, onComplete: () => notifyPhase(HANGING) })
      .to(animObj, { progress: 1, duration: 2.5, ease: "power1.inOut" })
      .set(animObj, { state: SWEEP, progress: 0, onComplete: () => notifyPhase(SWEEP) })
      .to(animObj, { progress: 1, duration: 2.2, ease: "power2.inOut" })
      .set(animObj, { state: FAN, progress: 0, onComplete: () => notifyPhase(FAN) })
      .to(animObj, { progress: 1, duration: 2.4, ease: "power2.inOut" })
      .set(animObj, { state: RING, progress: 0, onComplete: () => notifyPhase(RING) })
      .to(animObj, { progress: 1, duration: 2.6, ease: "power2.inOut" })
      .to(animObj, { progress: 1, duration: 1.0, ease: "sine.inOut" });

    // MOUSE PARALLAX
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = (event.clientX - rect.left) / rect.width - 0.5;
      mouse.targetY = (event.clientY - rect.top) / rect.height - 0.5;
    };

    container.addEventListener("pointermove", handlePointerMove);

    // RESIZE
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", resize);

    // RENDER LOOP
    const clock = new THREE.Clock();
    let frame = 0;

    const render = () => {
      frame = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.035;
      mouse.y += (mouse.targetY - mouse.y) * 0.035;

      camera.position.x += (mouse.x * 0.22 - camera.position.x) * 0.018;
      camera.position.y += (-mouse.y * 0.15 - camera.position.y) * 0.018;
      camera.lookAt(0, 0, 0);

      group.rotation.y = mouse.x * 0.09 + Math.sin(elapsed * 0.15) * 0.018;
      group.rotation.x = -mouse.y * 0.05 + Math.cos(elapsed * 0.12) * 0.012;
      group.position.y = Math.sin(elapsed * 0.2) * 0.025;

      particleMaterial.uniforms.uTime.value = elapsed;
      particles.rotation.y = elapsed * 0.014;
      particles.rotation.x = Math.sin(elapsed * 0.08) * 0.025;

      const state = animObj.state;
      const current = Math.floor(state);
      const next = Math.min(current + 1, RING);
      const amount = smoother(animObj.progress);

      for (const fiber of fibers) {
        const from = fiber.states[current];
        const to = fiber.states[next];

        const position = fiber.line.geometry.getAttribute("position") as THREE.BufferAttribute;
        const glowPosition = fiber.glow.geometry.getAttribute("position") as THREE.BufferAttribute;

        for (let p = 0; p < POINTS; p++) {
          const index = p * 3;
          const wave = Math.sin(elapsed * fiber.speed + fiber.phase + p * 0.16) * 0.014;
          const waveStrength = Math.sin((p / (POINTS - 1)) * Math.PI);

          const x = THREE.MathUtils.lerp(from[index], to[index], amount) + wave * waveStrength;
          const y = THREE.MathUtils.lerp(from[index + 1], to[index + 1], amount) + wave * waveStrength;
          const z = THREE.MathUtils.lerp(from[index + 2], to[index + 2], amount);

          position.array[index] = x;
          position.array[index + 1] = y;
          position.array[index + 2] = z;

          glowPosition.array[index] = x;
          glowPosition.array[index + 1] = y;
          glowPosition.array[index + 2] = z;
        }

        position.needsUpdate = true;
        glowPosition.needsUpdate = true;

        const shimmer = 0.5 + 0.5 * Math.sin(elapsed * fiber.speed * 1.4 + fiber.phase);
        (fiber.line.material as THREE.LineBasicMaterial).opacity = 0.6 + fiber.seed * 0.35 + shimmer * 0.1;
        (fiber.glow.material as THREE.LineBasicMaterial).opacity = 0.25 + shimmer * 0.1;
      }

      renderer.render(scene, camera);
    };

    render();

    // CLEANUP
    return () => {
      cancelAnimationFrame(frame);
      timeline.kill();
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointerMove);

      fibers.forEach((fiber) => {
        fiber.line.geometry.dispose();
        (fiber.line.material as THREE.Material).dispose();
        fiber.glow.geometry.dispose();
        (fiber.glow.material as THREE.Material).dispose();
      });

      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onPhaseChange]);

  return (
    <div
      ref={containerRef}
      className="sgcs-generative-hero"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
