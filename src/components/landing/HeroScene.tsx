import React from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import StrandField from "./StrandField";

interface HeroSceneProps {
  activePose: number;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ activePose }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // Transparent canvas background
        }}
      >
        {/* Soft Ambient Lighting */}
        <ambientLight intensity={1.1} color="#ffffff" />

        {/* Warm Directional Key Light */}
        <directionalLight position={[6, 8, 5]} intensity={2.5} color="#ffe5b4" />

        {/* Metallic Strand Tip Point Lights */}
        <pointLight position={[1.2, -1.2, 3.5]} intensity={3.5} color="#e59e35" distance={10} />
        <pointLight position={[-2.5, 2.5, 2.0]} intensity={2.2} color="#c88a32" distance={8} />

        {/* 3D Tube Strand Field with GSAP Morphing */}
        <StrandField activePose={activePose} />

        {/* @react-three/postprocessing Bloom Glow Pipeline */}
        <EffectComposer disableNormalPass>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.85}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default HeroScene;
