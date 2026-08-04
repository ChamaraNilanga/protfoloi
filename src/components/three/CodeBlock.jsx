import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";

// A single, consistent 3D motif reused everywhere: a floating "code editor"
// panel — a window with traffic-light controls and syntax-highlighted lines.
// Built entirely from primitive geometry (no external model/font asset).
const CODE_LINES = [
  { width: 0.5, x: -0.62, color: "#c084fc" },
  { width: 0.78, x: -0.48, color: "#e2e8f0" },
  { width: 0.36, x: -0.69, color: "#5eead4" },
  { width: 0.86, x: -0.44, color: "#e2e8f0" },
  { width: 0.58, x: -0.58, color: "#ff9d2f" },
  { width: 0.68, x: -0.53, color: "#e2e8f0" },
];

const DOTS = [
  { x: -0.78, color: "#ff5f56" },
  { x: -0.66, color: "#ffbd2e" },
  { x: -0.54, color: "#27c93f" },
];

const CodeBlock = ({ reducedMotion, color = "#9d6bff", scale = 1, baseYaw = -0.4, swayAmount = 0.3 }) => {
  const group = useRef();

  useFrame((state) => {
    if (group.current && !reducedMotion) {
      // Gentle side-to-side sway rather than a full spin, so the code
      // content stays in view instead of showing the panel edge-on.
      group.current.rotation.y = baseYaw + Math.sin(state.clock.elapsedTime * 0.4) * swayAmount;
      group.current.rotation.x = 0.08 + Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
    }
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={0} floatIntensity={reducedMotion ? 0 : 1.1}>
      <group ref={group} scale={scale}>
        {/* Panel body */}
        <RoundedBox args={[2, 1.3, 0.1]} radius={0.07} smoothness={4}>
          <meshStandardMaterial color="#12122a" emissive={color} emissiveIntensity={0.35} roughness={0.55} metalness={0.15} />
        </RoundedBox>

        {/* Header bar */}
        <mesh position={[0, 0.56, 0.052]}>
          <boxGeometry args={[1.92, 0.16, 0.01]} />
          <meshStandardMaterial color="#1c1c38" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Traffic-light controls */}
        {DOTS.map((dot) => (
          <mesh key={dot.x} position={[dot.x, 0.56, 0.06]}>
            <circleGeometry args={[0.03, 16]} />
            <meshBasicMaterial color={dot.color} />
          </mesh>
        ))}

        {/* Syntax-highlighted code lines */}
        {CODE_LINES.map((line, i) => (
          <mesh key={i} position={[line.x, 0.28 - i * 0.15, 0.052]}>
            <boxGeometry args={[line.width, 0.05, 0.006]} />
            <meshBasicMaterial color={line.color} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

export default CodeBlock;
