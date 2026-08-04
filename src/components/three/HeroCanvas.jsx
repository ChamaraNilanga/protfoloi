import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import CodeBlock from "./CodeBlock";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const TiltGroup = ({ reducedMotion, children }) => {
  const group = useRef();

  useFrame((state) => {
    if (!group.current || reducedMotion) return;

    const targetX = state.pointer.y * 0.25;
    const targetY = state.pointer.x * 0.35;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (targetY * 0.2 - group.current.rotation.z) * 0.04;
  });

  return (
    <group ref={group} position={[2, 0.1, -0.6]}>
      {children}
    </group>
  );
};

const HeroCanvas = () => {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 738px)");

  return (
    <Canvas
      dpr={[1, isMobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.9} />
      <pointLight position={[5, 5, 5]} intensity={1.8} color="#a78bfa" />
      <pointLight position={[-5, -3, -4]} intensity={1.3} color="#ff9d2f" />
      <pointLight position={[0, 1, 6]} intensity={1} color="#ffffff" />

      <Suspense fallback={null}>
        <Stars
          radius={60}
          depth={40}
          count={isMobile ? 900 : 2200}
          factor={4}
          saturation={0}
          fade
          speed={reducedMotion ? 0 : 1}
        />
        <TiltGroup reducedMotion={reducedMotion}>
          <CodeBlock reducedMotion={reducedMotion} color="#9d6bff" scale={1.6} />
        </TiltGroup>
      </Suspense>
    </Canvas>
  );
};

export default HeroCanvas;
