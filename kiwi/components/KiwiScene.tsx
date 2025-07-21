import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';

interface KiwiSceneProps {
  color: string;
  gender: string;
  happiness: number;
  hunger: number;
  isIncubating: boolean;
  isStartled: boolean;
}

function KiwiModel(props: KiwiSceneProps) {
  const { scene } = useGLTF(require('../assets/low_poly_kiwi_run.glb')); // Load GLB model
  const meshRef = React.useRef<THREE.Group>(null);

  // Basic material tint for color (assumes model has MeshStandardMaterial; customize as needed)
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.color.set(props.isIncubating ? 'gray' : props.color);
    }
  });

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta; // Rotate
      if (props.isStartled) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.1; // Shake
      }
    }
  });

  // Scale based on happiness/hunger
  const scale = (props.happiness / 100) * (100 - props.hunger) / 100 + 0.5;

  return <primitive ref={meshRef} object={scene} scale={scale} />;
}

export default function KiwiScene(props: KiwiSceneProps) {
  return (
    <Canvas style={{ width: 300, height: 300 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <KiwiModel {...props} />
    </Canvas>
  );
}

// Preload the model for better performance
useGLTF.preload(require('../assets/low_poly_kiwi_run.glb'));