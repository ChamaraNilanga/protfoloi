const CLASSES = {
  up: "animate-fade-up",
  down: "animate-fade-down",
  left: "animate-fade-left",
  right: "animate-fade-right",
  scale: "animate-fade-scale",
};

// Entrance animation wrapper: starts hidden, revealed by a CSS keyframe.
const Animate = ({ children, delay = 0, className = "", direction = "up" }) => (
  <div className={`pre-anim ${CLASSES[direction]} ${className}`} style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

export default Animate;
