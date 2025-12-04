/**
 * Composant 3D d'un ordinateur animé
 * Utilise react-three-fiber et drei pour le rendu WebGL
 * Placeholder : cube avec rotation représentant un PC
 */
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

// Composant interne : le modèle 3D de l'ordinateur
function ComputerModel() {
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.Mesh>(null)

  // Animation de rotation douce
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
    // Effet de pulsation sur l'écran
    if (screenRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      screenRef.current.material = new THREE.MeshStandardMaterial({
        color: '#22c55e',
        emissive: '#22c55e',
        emissiveIntensity: pulse * 0.3,
      })
    }
  })

  return (
    <group ref={groupRef}>
      {/* Boîtier de l'ordinateur (tour) */}
      <RoundedBox args={[1.2, 1.8, 0.8]} radius={0.05} position={[-1.5, 0, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.7} />
      </RoundedBox>

      {/* Détails du boîtier - LED */}
      <mesh position={[-1.5, 0.7, 0.41]}>
        <circleGeometry args={[0.05, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </mesh>

      {/* Moniteur - cadre */}
      <RoundedBox args={[2, 1.5, 0.1]} radius={0.02} position={[0.5, 0.2, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </RoundedBox>

      {/* Moniteur - écran */}
      <mesh ref={screenRef} position={[0.5, 0.2, 0.06]}>
        <planeGeometry args={[1.8, 1.3]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>

      {/* Texte sur l'écran */}
      <Text
        position={[0.5, 0.2, 0.07]}
        fontSize={0.15}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
      >
        NIRD
      </Text>

      {/* Pied du moniteur */}
      <RoundedBox args={[0.3, 0.4, 0.2]} radius={0.02} position={[0.5, -0.7, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
      </RoundedBox>

      {/* Base du moniteur */}
      <RoundedBox args={[0.8, 0.05, 0.4]} radius={0.02} position={[0.5, -0.9, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
      </RoundedBox>

      {/* Clavier */}
      <RoundedBox args={[1.4, 0.08, 0.5]} radius={0.02} position={[0.5, -0.95, 0.6]}>
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
      </RoundedBox>

      {/* Souris */}
      <RoundedBox args={[0.2, 0.08, 0.3]} radius={0.04} position={[1.5, -0.95, 0.6]}>
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
      </RoundedBox>
    </group>
  )
}

// Composant principal exporté
export default function Computer3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        {/* Éclairage */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#22c55e" />

        {/* Modèle 3D */}
        <ComputerModel />

        {/* Contrôles de la caméra */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Fond */}
        <color attach="background" args={['#0f172a']} />
      </Canvas>
    </div>
  )
}
