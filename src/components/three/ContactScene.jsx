import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import CodeBlock from "./CodeBlock";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const ContactScene = () => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.9} />
      <pointLight position={[4, 4, 4]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[-4, -2, -3]} intensity={1.1} color="#ff9d2f" />
      <pointLight position={[0, 0, 5]} intensity={0.9} color="#ffffff" />
      <Suspense fallback={null}>
        <CodeBlock reducedMotion={reducedMotion} color="#ff9d2f" scale={1.1} baseYaw={0.3} />
      </Suspense>
    </Canvas>
  );
};

export default ContactScene;
