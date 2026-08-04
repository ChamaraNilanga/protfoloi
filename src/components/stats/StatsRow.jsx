import { useEffect, useRef } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { stats } from "../../data/stats";
import "./statsRow.scss";

const Counter = ({ value, suffix }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const node = ref.current;

    if (shouldReduceMotion) {
      node.textContent = `${value}${suffix}`;
      return;
    }

    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = `${Math.round(latest)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [isInView, value, suffix, shouldReduceMotion]);

  return <span ref={ref}>0{suffix}</span>;
};

const StatsRow = () => {
  return (
    <div className="stats-row">
      {stats.map((s, i) => (
        <motion.div
          key={s.id}
          className="stat-card glass-panel"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
        >
          <h3 className="stat-value">
            <Counter value={s.value} suffix={s.suffix} />
          </h3>
          <p>{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsRow;
