import { useRef, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  RoundedBox, 
  Text, 
  Float,
  Sparkles,
  Environment,
  Html
} from '@react-three/drei'
import * as THREE from 'three'

interface ComputerModelProps {
  onScreenClick: () => void
  isZooming: boolean
}

// Loader pendant le chargement
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        <p className="text-green-400 text-lg font-medium">Chargement...</p>
      </div>
    </Html>
  )
}

// Composant de l'écran avec effet terminal
function Screen({ onClick, hovered, setHovered }: { 
  onClick: () => void
  hovered: boolean
  setHovered: (h: boolean) => void 
}) {
  const screenRef = useRef<THREE.Mesh>(null)
  const scanlineRef = useRef(0)

  useFrame((state) => {
    // Animation scanline
    scanlineRef.current = (scanlineRef.current + 0.008) % 1
    
    // Pulsation de l'écran
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial
      const baseIntensity = hovered ? 0.7 : 0.35
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.15
      material.emissiveIntensity = baseIntensity + pulse
    }
  })

  return (
    <group>
      {/* Écran principal - zone cliquable */}
      <mesh
        ref={screenRef}
        position={[0, 0.25, 0.08]}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[2.6, 1.7]} />
        <meshStandardMaterial
          color="#1E1E1E"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Contenu de l'écran - style terminal */}
      <group position={[0, 0.25, 0.09]}>
        {/* Lignes de code */}
        <Text
          position={[-1.1, 0.55, 0]}
          fontSize={0.07}
          color="#00FF41"
          anchorX="left"
        >
          {`$ ./la_nuit_de_l_info_2025 --init`}
        </Text>
        <Text
          position={[-1.1, 0.42, 0]}
          fontSize={0.06}
          color="#00FF41"
          anchorX="left"
        >
          {`> ./nird_village --init`}
        </Text>
        <Text
          position={[-1.1, 0.30, 0]}
          fontSize={0.06}
          color="#00FF41"
          anchorX="left"
        >
          {`> Recycled hardware: READY`}
        </Text>
        <Text
          position={[-1.1, 0.18, 0]}
          fontSize={0.06}
          color="#00FF41"
          anchorX="left"
        >
          {`> System operational ✓`}
        </Text>

        {/* Titre central */}
        <Text
          position={[0, -0.05, 0]}
          fontSize={0.16}
          color="#00FF41"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          Recondi_Tech.apk
        </Text>

        {/* Instruction */}
        <Text
          position={[0, -0.50, 0]}
          fontSize={0.055}
          color={hovered ? "#22c55e" : "#00FF41"}
          anchorX="center"
          anchorY="middle"
        >
          {hovered ? ">>> CLIQUEZ POUR ENTRER <<<" : "[ Cliquez sur l'écran ]"}
        </Text>
      </group>
    </group>
  )
}

// Modèle de l'ordinateur complet
function ComputerModel({ onScreenClick, isZooming }: ComputerModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()
  const zoomProgress = useRef(0)

  useFrame((state) => {
    if (!groupRef.current) return

    if (!isZooming) {
      // Animation de flottement
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.12
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08
    } else {
      // Animation de zoom vers l'écran
      zoomProgress.current += 0.018
      const t = Math.min(zoomProgress.current, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      
      const startPos = new THREE.Vector3(0, 0, 4.5)
      const endPos = new THREE.Vector3(0, 0.25, 0.3)
      camera.position.lerpVectors(startPos, endPos, eased)
      camera.lookAt(0, 0.25, 0)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Particules ambiantes */}
      <Sparkles
        count={80}
        scale={7}
        size={3}
        speed={0.25}
        color="#00FF41"
        opacity={0.5}
      />

      {/* === MONITEUR === */}
      <Float speed={1.2} rotationIntensity={0.015} floatIntensity={0.04}>
        {/* Cadre du moniteur */}
        <RoundedBox args={[3, 2.1, 0.15]} radius={0.08} position={[0, 0.25, 0]}>
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={0.9} 
            roughness={0.1}
          />
        </RoundedBox>

        {/* Bordure lumineuse extérieure */}
        <mesh position={[0, 0.25, 0.076]}>
          <planeGeometry args={[2.75, 1.85]} />
          <meshStandardMaterial 
            color="#0a1628"
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Écran interactif */}
        <Screen 
          onClick={onScreenClick} 
          hovered={hovered} 
          setHovered={setHovered} 
        />

        {/* Base du moniteur */}
        <mesh position={[0, -0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.65, 0.04, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.15} />
        </mesh>
      </Float>

      {/* === CLAVIER === */}
      <group position={[0, -0.95, 0.85]}>
        <RoundedBox args={[2.2, 0.07, 0.65]} radius={0.02}>
        <meshStandardMaterial 
          color="#0f172a"
          metalness={0.9}
          roughness={0.1}
        />
</RoundedBox>
        
        {/* Touches avec rétroéclairage */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 14 }).map((_, col) => (
            <mesh 
              key={`${row}-${col}`} 
              position={[-0.95 + col * 0.14, 0.045, -0.22 + row * 0.14]}
            >
              <boxGeometry args={[0.11, 0.025, 0.11]} />
              <meshStandardMaterial 
                color="#0f172a"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))
        )}
      </group>

      {/* === SOURIS === */}
      <group position={[1.4, -0.95, 0.85]}>
        <RoundedBox args={[0.22, 0.055, 0.38]} radius={0.04}>
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
        </RoundedBox>
        {/* LED souris */}
        <mesh position={[0, 0.035, -0.04]}>
          <boxGeometry args={[0.14, 0.012, 0.08]} />
          <meshStandardMaterial 
            color="#0f172a"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>

      
    </group>
  )
}

interface Computer3DProps {
  onEnterGame: () => void
}

// Composant principal
export default function Computer3D({ onEnterGame }: Computer3DProps) {
  const [isZooming, setIsZooming] = useState(false)

  const handleScreenClick = useCallback(() => {
    if (isZooming) return
    setIsZooming(true)
    
    // Attendre l'animation puis naviguer
    setTimeout(() => {
      onEnterGame()
    }, 2000)
  }, [isZooming, onEnterGame])

  return (
    <div className="w-full h-full">
      <Canvas 
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        style={{ 
          background: '#0000',
          position: 'relative',
          zIndex: 1 
         }}
      >
        {/* Éclairage */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <pointLight position={[-3, 2, 4]} intensity={0.55} color="#22c55e" />
        <pointLight position={[3, -1, 2]} intensity={0.35} color="#06b6d4" />
        <spotLight
          position={[0, 5, 2]}
          angle={0.4}
          penumbra={1}
          intensity={0.45}
          color="#8b5cf6"
        />

        {/* Environnement pour reflets */}
        <Environment preset="sunset" />

        {/* Modèle avec loader */}
        <Suspense fallback={<Loader />}>
          <ComputerModel 
            onScreenClick={handleScreenClick} 
            isZooming={isZooming} 
          />
        </Suspense>
      </Canvas>

      {/* Overlay de transition lors du zoom */}
      {isZooming && (
        <div 
          className="fixed inset-0 pointer-events-none z-50"
          style={{ animation: 'terminalBoot 1.8s ease-in-out forwards' }}
        >
          <style>{`
            @keyframes terminalBoot {
              0% {
                background: transparent;
                opacity: 0;
              }
              40% {
                background: rgba(0, 255, 65, 0.10);
                opacity: 0.4;
              }
              75% {
                background: rgba(0, 255, 65, 0.22);
                opacity: 0.7;
                filter: contrast(130%) brightness(120%);
              }
              100% {
                background: black;
                opacity: 1;
                filter: contrast(100%) brightness(100%);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
