import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface SGCSVideoHeroCanvasProps {
  videoUrl?: string;
}

export const SGCSVideoHeroCanvas: React.FC<SGCSVideoHeroCanvasProps> = ({
  videoUrl = "/referencess/hero_animation.mp4",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create hidden HTML5 Video Element
    const video = document.createElement("video");
    video.src = videoUrl;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    videoRef.current = video;

    // Play video
    video.play().catch((err) => {
      console.warn("Autoplay deferred:", err);
    });

    // THREE.js Scene & Renderer with Alpha (Transparent Canvas for White Theme)
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // 100% transparent

    container.appendChild(renderer.domElement);

    // Video Texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    // Custom Keying Shader: Key out black/dark background while preserving gold fibers
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTexture: { value: videoTexture },
        uThreshold: { value: 0.08 },
        uSmoothness: { value: 0.18 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float uThreshold;
        uniform float uSmoothness;

        void main() {
          vec4 color = texture2D(uTexture, vUv);
          // Calculate brightness/luminance
          float brightness = max(color.r, max(color.g, color.b));
          
          // Smooth transparency transition for black background
          float alpha = smoothstep(uThreshold, uThreshold + uSmoothness, brightness);
          
          // Boost warmth & contrast for gold fibers on white studio theme
          vec3 enhancedColor = color.rgb * 1.15;

          gl_FragColor = vec4(enhancedColor, color.a * alpha);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Render Loop
    let animationFrameId: number;
    const render = () => {
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        videoTexture.needsUpdate = true;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      video.pause();
      video.removeAttribute("src");
      video.load();

      geometry.dispose();
      material.dispose();
      videoTexture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [videoUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default SGCSVideoHeroCanvas;
