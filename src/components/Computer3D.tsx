/**
 * Composant 3D d'un ordinateur animé - Version améliorée
 * Effet de zoom immersif pour entrer dans le jeu
 */
import { useRef, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  RoundedBox, 
  Text, 
  Float,
  Sparkles,
  MeshDistortMaterial,
  Environment
} from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'

interface ComputerModelProps {
  onScreenClick: () => void
  isZooming: boolean
}

// Composant interne : le modèle 3D de l'ordinateur
function ComputerModel({ onScreenClick, isZooming }: ComputerModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()

  // Animation de zoom vers l'écran
  useFrame((state) => {
    if (groupRef.current && !isZooming) {
      // Animation de flottement douce
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }

    // Animation de zoom immersif
    if (isZooming && screenRef.current) {
      const targetPosition = new THREE.Vector3(0.5, 0.2, 2)
      camera.position.lerp(targetPosition, 0.05)
      camera.lookAt(0.5, 0.2, 0)
    }

    // Effet de pulsation sur l'écran
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial
      const intensity = hovered ? 0.8 : 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      material.emissiveIntensity = intensity
    }
  })

  return (
    <group ref={groupRef}>
      {/* Particules autour de l'ordinateur */}
      <Sparkles
        count={50}
        scale={6}
        size={2}
        speed={0.4}
        color="#22c55e"
      />

      {/* Boîtier de l'ordinateur (tour) avec effet métallique */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <RoundedBox args={[1.2, 1.8, 0.8]} radius={0.08} position={[-1.8, 0, 0]}>
          <meshStandardMaterial 
            color="#1e293b" 
            metalness={0.8} 
            roughness={0.2}
          />
        </RoundedBox>
        
        {/* Ventilateur lumineux */}
        <mesh position={[-1.8, 0.5, 0.41]}>
          <circleGeometry args={[0.25, 32]} />
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>
        
        {/* LEDs RGB */}
        {[0.6, 0.3, 0, -0.3, -0.6].map((y, i) => (
          <mesh key={i} position={[-1.8, y, 0.41]}>
            <boxGeometry args={[0.8, 0.02, 0.01]} />
            <meshStandardMaterial 
              color={['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'][i]}
              emissive={['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'][i]}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </Float>

      {/* Moniteur - cadre avec effet premium */}
      <RoundedBox args={[2.4, 1.7, 0.12]} radius={0.05} position={[0.5, 0.2, 0]}>
        <meshStandardMaterial 
          color="#0f172a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </RoundedBox>

      {/* Bordure lumineuse du moniteur */}
      <mesh position={[0.5, 0.2, 0.05]}>
        <ringGeometry args={[1.05, 1.1, 4]} />
        <meshStandardMaterial 
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Moniteur - écran interactif */}
      <mesh 
        ref={screenRef} 
        position={[0.5, 0.2, 0.07]}
        onClick={onScreenClick}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[2.1, 1.4]} />
        <MeshDistortMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.4}
          distort={hovered ? 0.1 : 0}
          speed={2}
        />
      </mesh>

      {/* Texte sur l'écran */}
      <Text
        position={[0.5, 0.35, 0.08]}
        fontSize={0.15}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        VILLAGE NUMÉRIQUE
      </Text>
      
      <Text
        position={[0.5, 0.15, 0.08]}
        fontSize={0.2}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
      >
        🌿 NIRD 🌿
      </Text>

      <Text
        position={[0.5, -0.1, 0.08]}
        fontSize={0.08}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
      >
        [ Cliquez pour entrer ]
      </Text>

      {/* Pied du moniteur - design moderne */}
      <RoundedBox args={[0.15, 0.5, 0.15]} radius={0.02} position={[0.5, -0.55, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Base du moniteur */}
      <mesh position={[0.5, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.05, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Clavier mécanique RGB */}
      <RoundedBox args={[1.6, 0.1, 0.6]} radius={0.03} position={[0.5, -0.85, 0.8]}>
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </RoundedBox>
      
      {/* Touches du clavier avec rétroéclairage */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => (
          <mesh 
            key={`${row}-${col}`} 
            position={[-0.2 + col * 0.12, -0.78, 0.55 + row * 0.12]}
          >
            <boxGeometry args={[0.08, 0.04, 0.08]} />
            <meshStandardMaterial
              color="#0f172a"
              emissive={['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b'][(row + col) % 4]}
              emissiveIntensity={0.2}
            />
          </mesh>
        ))
      )}

      {/* Souris gaming */}
      <RoundedBox args={[0.25, 0.1, 0.4]} radius={0.05} position={[1.6, -0.85, 0.8]}>
        <meshStandardMaterial 
          color="#1e293b" 
          metalness={0.7} 
          roughness={0.2}
        />
      </RoundedBox>
      <mesh position={[1.6, -0.78, 0.75]}>
        <boxGeometry args={[0.15, 0.02, 0.1]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

interface Computer3DProps {
  onEnterGame?: () => void
}

// Composant principal exporté
export default function Computer3D({ onEnterGame }: Computer3DProps) {
  const [isZooming, setIsZooming] = useState(false)
  const navigate = useNavigate()

  const handleScreenClick = useCallback(() => {
    setIsZooming(true)
    // Attendre la fin de l'animation puis naviguer
    setTimeout(() => {
      if (onEnterGame) {
        onEnterGame()
      }
      navigate('/game')
    }, 1500)
  }, [navigate, onEnterGame])

  return (
    <div className={`w-full h-full ${isZooming ? 'zoom-transition' : ''}`}>
      <Canvas
        camera={{ position: [0, 1, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Éclairage amélioré */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-3, 3, 3]} intensity={0.8} color="#22c55e" />
        <pointLight position={[3, -2, -3]} intensity={0.5} color="#06b6d4" />
        <spotLight
          position={[0, 5, 0]}
          angle={0.5}
          penumbra={1}
          intensity={0.5}
          color="#8b5cf6"
        />

        {/* Environnement pour reflets réalistes */}
        <Environment preset="night" />

        {/* Modèle 3D */}
        <ComputerModel onScreenClick={handleScreenClick} isZooming={isZooming} />

        {/* Contrôles de la caméra */}
        {!isZooming && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>

      {/* Overlay de flash lors du zoom */}
      {isZooming && (
        <div className="fixed inset-0 bg-green-400 flash-overlay pointer-events-none z-50" />
      )}
    </div>
  )
}
