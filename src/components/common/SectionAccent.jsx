import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useInViewOnce } from "../../hooks/useInViewOnce";
import "./sectionAccent.scss";

const SectionScene = lazy(() => import("../three/SectionScene"));

const SectionAccent = ({ color, baseYaw, corner = "top-right", size = "default" }) => {
  const [ref, inView] = useInViewOnce({ threshold: 0.2 });

  return (
    <div ref={ref} className={`section-accent accent-${corner} size-${size}`} aria-hidden="true">
      {inView && (
        <motion.div
          className="section-accent-canvas"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Suspense fallback={null}>
            <SectionScene color={color} baseYaw={baseYaw} />
          </Suspense>
        </motion.div>
      )}
    </div>
  );
};

export default SectionAccent;
