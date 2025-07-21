// File: KiwiScene.js (3D scene component)
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import * as THREE from 'three';

const modelUrl = 'KiwiScee.js'; // Direct GLB download

function Model({ color, isStartled }) {
  const { scene } = useGLTF(modelUrl);
  const ref = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(colorMap[color] || 0x8b4513);
      }
    });
  }, [color]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      if (isStartled) {
        ref.current.position.x = Math.sin(state.clock.elapsedTime * 10) * 0.2;
      }
    }
  });

  return <primitive ref={ref} object={scene} scale={1} position={[0, -1, 0]} />;
}

export default function KiwiScene({ color, isStartled }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Model color={color} isStartled={isStartled} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={10} />
    </Canvas>
  );
}

const colorMap = {
  brown: 0x8b4513,
  gray: 0x808080,
  spotted: 0x000000,
  white: 0xffffff,
};