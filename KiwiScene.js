// File: KiwiScene.js
import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber/native'
import { useGLTF, OrbitControls } from '@react-three/drei/native'
import * as THREE from 'three'

// ✅ Correct raw GLB file URL (not the GitHub blob URL)
const modelUrl =
  'https://raw.githubusercontent.com/greypebs/kiwi/800a040a42b27352613fbff90a5a54b99c1da47e/low_poly_kiwi_run.glb'

// ✅ Preload the model for performance
useGLTF.preload(modelUrl)

function Model({ color, isStartled }) {
  const { scene } = useGLTF(modelUrl)
  const ref = useRef()

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone() // clone to avoid shared state
        child.material.color = new THREE.Color(colorMap[color] || 0x8b4513)
      }
    })
  }, [scene, color])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5
      if (isStartled) {
        ref.current.position.x = Math.sin(state.clock.elapsedTime * 10) * 0.2
      }
    }
  })

  return <primitive ref={ref} object={scene} scale={1} position={[0, -1, 0]} />
}

export default function KiwiScene({ color = 'brown', isStartled = false }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Suspense fallback={null}>
        <Model color={color} isStartled={isStartled} />
      </Suspense>
      <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={10} />
    </Canvas>
  )
}

const colorMap = {
  brown: 0x8b4513,
  gray: 0x808080,
  spotted: 0x000000,
  white: 0xffffff,
}
