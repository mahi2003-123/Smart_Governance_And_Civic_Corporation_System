import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";

export const STRAND_COUNT = 80;
export const POINTS_PER_STRAND = 6;
export const PARTICLE_COUNT = 100;

export const POSE_DESCENDING_BUNDLE = 0;
export const POSE_BRANCHING_ROOTS = 1;
export const POSE_TWISTING_HELIX = 2;
export const POSE_RADIAL_ARCH_FIELD = 3;

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

// Generate control points for the 4 exact reference image poses
function generateReferencePoses() {
  const descendingBundle: THREE.Vector3[][] = [];
  const branchingRoots: THREE.Vector3[][] = [];
  const twistingHelix: THREE.Vector3[][] = [];
  const radialArchField: THREE.Vector3[][] = [];

  for (let s = 0; s < STRAND_COUNT; s++) {
    const norm = s / (STRAND_COUNT - 1);
    const r1 = pseudoRandom(s * 13.1 + 1);
    const r2 = pseudoRandom(s * 29.3 + 2);
    const r3 = pseudoRandom(s * 47.7 + 3);

    // -------------------------------------------------------------
    // POSE 0: DESCENDING FIBER BUNDLE (Ref Image 1 & 5)
    // Vertical tight bundle from top-center diagonally to center-right
    // -------------------------------------------------------------
    const strand0: THREE.Vector3[] = [];
    const topCenterX = 0.2 + (r1 - 0.5) * 0.8;
    const botCenterX = 1.0 + (r2 - 0.5) * 1.1;
    for (let p = 0; p < POINTS_PER_STRAND; p++) {
      const t = p / (POINTS_PER_STRAND - 1);
      const topY = 3.6 + r1 * 0.5;
      const botY = -0.8 - r3 * 0.8;
      const y = THREE.MathUtils.lerp(topY, botY, t);
      const x = THREE.MathUtils.lerp(topCenterX, botCenterX, t) + Math.sin(t * Math.PI) * (0.2 + r2 * 0.3);
      const z = (r3 - 0.5) * 1.4 + Math.sin(t * Math.PI) * 0.25;
      strand0.push(new THREE.Vector3(x, y, z));
    }
    descendingBundle.push(strand0);

    // -------------------------------------------------------------
    // POSE 1: BRANCHING ROOT SPREAD (Ref Image 2)
    // Bundle opens up downwards into spreading root legs left & right
    // -------------------------------------------------------------
    const strand1: THREE.Vector3[] = [];
    const side = norm < 0.5 ? -1 : 1;
    const branchNorm = (norm % 0.5) * 2;
    for (let p = 0; p < POINTS_PER_STRAND; p++) {
      const t = p / (POINTS_PER_STRAND - 1);
      const startX = 0.0 + (r1 - 0.5) * 0.6;
      const startY = 3.4;
      const spreadX = side * (0.8 + branchNorm * 2.2 + r2 * 0.6);
      const endY = -2.2 - r3 * 0.6;
      const x = THREE.MathUtils.lerp(startX, spreadX, t);
      const y = THREE.MathUtils.lerp(startY, endY, t) - Math.sin(t * Math.PI * 0.8) * 0.4;
      const z = (r2 - 0.5) * 1.5;
      strand1.push(new THREE.Vector3(x, y, z));
    }
    branchingRoots.push(strand1);

    // -------------------------------------------------------------
    // POSE 2: VERTICAL TWISTING HELIX COLUMN (Ref Image 3)
    // Compact vertical S-curve helix in the center
    // -------------------------------------------------------------
    const strand2: THREE.Vector3[] = [];
    const helixPhase = norm * Math.PI * 3 + r1 * Math.PI;
    for (let p = 0; p < POINTS_PER_STRAND; p++) {
      const t = p / (POINTS_PER_STRAND - 1);
      const y = THREE.MathUtils.lerp(2.8, -2.0, t);
      const radius = Math.sin(t * Math.PI) * (0.65 + r2 * 0.4);
      const angle = helixPhase + t * Math.PI * 2.2;
      const x = 0.2 + Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius * 0.8 + (r3 - 0.5) * 0.5;
      strand2.push(new THREE.Vector3(x, y, z));
    }
    twistingHelix.push(strand2);

    // -------------------------------------------------------------
    // POSE 3: HORIZONTAL RADIAL ARCH FIELD (Ref Image 4)
    // Wide crescent arch field spanning horizontally with tips facing up
    // -------------------------------------------------------------
    const strand3: THREE.Vector3[] = [];
    const archX = THREE.MathUtils.lerp(-3.4, 3.4, norm);
    for (let p = 0; p < POINTS_PER_STRAND; p++) {
      const t = p / (POINTS_PER_STRAND - 1);
      const archCenterDist = Math.abs(norm - 0.5) * 2;
      const archY = 0.8 - archCenterDist * 1.8;
      const fiberLen = 1.4 + r1 * 0.8;
      const y = archY + t * fiberLen;
      const x = archX + Math.sin(t * Math.PI) * (r2 - 0.5) * 0.4;
      const z = (r3 - 0.5) * 1.2 + Math.sin(t * Math.PI) * 0.3;
      strand3.push(new THREE.Vector3(x, y, z));
    }
    radialArchField.push(strand3);
  }

  return [descendingBundle, branchingRoots, twistingHelix, radialArchField];
}

// Bright glowing tip sphere/ring texture matching reference images
function createTipGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Soft outer yellow glow
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 220, 1.0)");
  grad.addColorStop(0.2, "rgba(255, 215, 80, 0.95)");
  grad.addColorStop(0.5, "rgba(235, 140, 30, 0.6)");
  grad.addColorStop(0.85, "rgba(180, 70, 10, 0.2)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  // Inner bright solid glowing core
  ctx.beginPath();
  ctx.arc(32, 32, 7, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 240, 1.0)";
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface StrandFieldProps {
  activePose: number;
}

export const StrandField: React.FC<StrandFieldProps> = ({ activePose }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const poses = useMemo(() => generateReferencePoses(), []);
  const tipTexture = useMemo(() => createTipGlowTexture(), []);

  const currentPointsRef = useRef<THREE.Vector3[][]>(
    poses[0].map((strand) => strand.map((pt) => pt.clone()))
  );

  const morphRef = useRef({ progress: 1, fromPose: 0, toPose: 0 });

  const strandMeshesRef = useRef<THREE.Mesh[]>([]);
  const tipSpritesRef = useRef<THREE.Sprite[]>([]);

  // Floating spark particles array
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (pseudoRandom(i * 3.1) - 0.5) * 7.5 + 0.4;
      pos[i * 3 + 1] = (pseudoRandom(i * 7.3) - 0.5) * 5.5;
      pos[i * 3 + 2] = (pseudoRandom(i * 11.7) - 0.5) * 2.8;
    }
    return pos;
  }, []);

  // Initialize 3D Tube Meshes and Glowing Tip Sprites
  useEffect(() => {
    const meshGroup = meshGroupRef.current;
    if (!meshGroup) return;

    while (meshGroup.children.length > 0) {
      meshGroup.remove(meshGroup.children[0]);
    }

    strandMeshesRef.current = [];
    tipSpritesRef.current = [];

    // Dark glossy bronze and warm amber color palette from reference screenshots
    const darkChocolate = new THREE.Color("#1f140a");
    const deepBronze = new THREE.Color("#362312");
    const warmAmber = new THREE.Color("#b57926");

    for (let s = 0; s < STRAND_COUNT; s++) {
      const pts = currentPointsRef.current[s];
      const curve = new THREE.CatmullRomCurve3(pts);
      const radius = 0.028 + pseudoRandom(s * 5.1) * 0.016;
      const geometry = new THREE.TubeGeometry(curve, 32, radius, 8, false);

      const colorMix = pseudoRandom(s * 9.3);
      let color = deepBronze;
      if (colorMix < 0.45) color = darkChocolate;
      else if (colorMix > 0.8) color = warmAmber;

      const material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.84,
        roughness: 0.24,
      });

      const mesh = new THREE.Mesh(geometry, material);
      meshGroup.add(mesh);
      strandMeshesRef.current.push(mesh);

      // Bright yellow/orange glowing tip sprite
      const spriteMaterial = new THREE.SpriteMaterial({
        map: tipTexture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      const tipPos = pts[pts.length - 1];
      sprite.position.copy(tipPos);
      sprite.scale.set(0.48, 0.48, 0.48);
      meshGroup.add(sprite);
      tipSpritesRef.current.push(sprite);
    }
  }, [tipTexture]);

  // Morph Trigger when activePose changes
  useEffect(() => {
    const fromP = morphRef.current.toPose;
    const toP = activePose;

    if (fromP === toP) return;

    morphRef.current.fromPose = fromP;
    morphRef.current.toPose = toP;
    morphRef.current.progress = 0;

    gsap.to(morphRef.current, {
      progress: 1,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, [activePose]);

  // Per-frame geometry regeneration & subtle organic wave motion
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Gentle idle float rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.18) * 0.05;
      groupRef.current.rotation.x = Math.cos(time * 0.14) * 0.03;
    }

    // Spark particles drift
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.0025;
        positions[i * 3] += Math.cos(time * 0.8 + i) * 0.0018;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    const { progress, fromPose, toPose } = morphRef.current;
    const fromPData = poses[fromPose];
    const toPData = poses[toPose];

    for (let s = 0; s < STRAND_COUNT; s++) {
      const strandPts = currentPointsRef.current[s];
      const fromPts = fromPData[s];
      const toPts = toPData[s];

      for (let p = 0; p < POINTS_PER_STRAND; p++) {
        const wave = Math.sin(time * 1.6 + s * 0.14 + p * 0.35) * 0.012;
        strandPts[p].x = THREE.MathUtils.lerp(fromPts[p].x, toPts[p].x, progress) + wave;
        strandPts[p].y = THREE.MathUtils.lerp(fromPts[p].y, toPts[p].y, progress) + wave;
        strandPts[p].z = THREE.MathUtils.lerp(fromPts[p].z, toPts[p].z, progress);
      }

      const mesh = strandMeshesRef.current[s];
      const sprite = tipSpritesRef.current[s];

      if (mesh) {
        mesh.geometry.dispose();
        const curve = new THREE.CatmullRomCurve3(strandPts);
        const radius = 0.028 + pseudoRandom(s * 5.1) * 0.016;
        mesh.geometry = new THREE.TubeGeometry(curve, 32, radius, 8, false);
      }

      if (sprite) {
        const tipPos = strandPts[strandPts.length - 1];
        sprite.position.copy(tipPos);
        sprite.material.opacity = 0.82 + 0.18 * Math.sin(time * 3 + s);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={meshGroupRef} />

      {/* Floating Spark Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          color="#ffca42"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default StrandField;
