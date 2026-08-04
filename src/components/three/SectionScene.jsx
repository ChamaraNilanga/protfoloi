import { Canvas } from "@react-three/fiber";
import CodeBlock from "./CodeBlock";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const SectionScene = ({ color = "#9d6bff", baseYaw = -0.4 }) => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.9} />
      <pointLight position={[3, 3, 3]} intensity={1.4} color="#a78bfa" />
      <pointLight position={[-3, -2, -2]} intensity={1} color="#ff9d2f" />
      <CodeBlock reducedMotion={reducedMotion} color={color} scale={0.75} baseYaw={baseYaw} swayAmount={0.25} />
    </Canvas>
  );
};

export default SectionScene;
