import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, Sparkles } from "@react-three/drei";

const GOLD = "#D4B16A";

function Gem({ position = [0, 0, 0], size = 0.3, color = "#4b7dff", squash = 0.85 }) {
  return (
    <mesh position={position} scale={[1, squash, 1]}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color={color} metalness={1} roughness={0.04} envMapIntensity={2.4} flatShading />
    </mesh>
  );
}

function Ring() {
  const group = useRef();
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const scroll = window.scrollY || 0;
    // spins on its own, tilts with mouse, and reacts to page scroll
    g.rotation.y += delta * 0.5 + scroll * 0.00004;
    g.rotation.x += (0.35 + state.pointer.y * 0.3 + scroll * 0.0009 - g.rotation.x) * 0.06;
    g.rotation.z += (state.pointer.x * -0.15 - g.rotation.z) * 0.05;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.08;
  });

  const side = [-0.62, -0.34, 0.34, 0.62];
  return (
    <group ref={group} scale={1.35}>
      {/* band */}
      <mesh>
        <torusGeometry args={[1, 0.11, 48, 160]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.16} envMapIntensity={1.7} />
      </mesh>
      {/* setting */}
      <mesh position={[0, 1.07, 0]}>
        <cylinderGeometry args={[0.24, 0.15, 0.24, 32]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.18} envMapIntensity={1.7} />
      </mesh>
      {/* main stone */}
      <Gem position={[0, 1.4, 0]} size={0.36} color="#5b86ff" />
      {/* small side stones on the band */}
      {side.map((a, i) => (
        <Gem
          key={i}
          position={[Math.sin(a) * 1.08, Math.cos(a) * 1.08, 0]}
          size={0.075}
          color="#dfe9ff"
          squash={1}
        />
      ))}
    </group>
  );
}

export default function Hero3D() {
  const lite = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas camera={{ position: [0, 0.2, lite ? 6.6 : 5.6], fov: 38 }} dpr={lite ? [1, 1.5] : [1, 1.75]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.35} />
      <spotLight position={[4, 6, 5]} angle={0.5} penumbra={1} intensity={60} color="#fff1cf" />
      <Environment resolution={lite ? 128 : 256}>
        <color attach="background" args={["#141c3a"]} />
        <Lightformer form="rect" intensity={6} color="#fff4d6" position={[0, 6, 3]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={3} color="#9bb8ff" position={[-6, 1, -4]} scale={[6, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={4} color="#ffe2a8" position={[6, 2, 2]} scale={[4, 8, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={4} color="#ffffff" position={[0, 0, -6]} scale={6} />
      </Environment>

      <Ring />

      <Float speed={1.8} rotationIntensity={1.4} floatIntensity={1.6}>
        <Gem position={[-2.4, 1.4, -0.5]} size={0.2} color="#6aa7ff" />
      </Float>
      <Float speed={1.4} rotationIntensity={1.2} floatIntensity={1.3}>
        <Gem position={[2.5, -1.2, -0.3]} size={0.26} color="#F1DDA5" />
      </Float>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.8}>
        <Gem position={[2.1, 1.7, -1]} size={0.14} color="#ffffff" />
      </Float>
      <Float speed={1.6} rotationIntensity={1.1} floatIntensity={1.4}>
        <Gem position={[-2.1, -1.5, 0]} size={0.17} color="#4b7dff" />
      </Float>

      <Sparkles count={lite ? 30 : 70} scale={[7, 5, 4]} size={3} speed={0.35} color="#F1DDA5" />
    </Canvas>
  );
}