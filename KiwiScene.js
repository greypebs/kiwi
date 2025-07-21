// File: KiwiScene.js (3D scene for the kiwi bird using @react-three/fiber/native and expo-gl)
import React from 'react';
import { Canvas } from '@react-three/fiber/native';
import { useFrame } from '@react-three/fiber';
import { Mesh, SphereGeometry, MeshStandardMaterial } from 'three'; // Explicit imports for tree-shaking

function KiwiModel({ color, isStartled, isIncubating, happiness, hunger }) {
  const mesh = React.useRef();

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta; // Simple rotation animation
      if (isStartled) {
        mesh.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.1; // Shake if startled
      }
    }
  });

  // Adjust scale based on happiness/hunger (example)
  const scale = (happiness / 100) * (100 - hunger) / 100 + 0.5;

  return (
    <mesh ref={mesh} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} /> {/* Simple sphere as placeholder for kiwi model */}
      <meshStandardMaterial color={isIncubating ? 'gray' : color} />
    </mesh>
  );
}

export default function KiwiScene(props) {
  return (
    <Canvas style={{ width: 300, height: 300 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <KiwiModel {...props} />
    </Canvas>
  );
}