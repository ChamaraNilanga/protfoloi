import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./cursor.scss";

const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch || shouldReduceMotion) return;

    const mouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const mouseLeave = () => setVisible(false);

    window.addEventListener("mousemove", mouseMove);
    document.documentElement.addEventListener("mouseleave", mouseLeave);
    return () => {
      window.removeEventListener("mousemove", mouseMove);
      document.documentElement.removeEventListener("mouseleave", mouseLeave);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className="cursor-glow"
      aria-hidden="true"
      animate={{ x: position.x, y: position.y, opacity: visible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 40, mass: 0.4 }}
    />
  );
};

export default Cursor;
