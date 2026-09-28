import { useEffect, useRef } from "react";
import { createWorld } from "../three/world";
import { name, orbitSkills, experiences, projects } from "../content";

const World = ({ onRoom }) => {
  const canvasRef = useRef();
  const flashRef = useRef();
  const meterRef = useRef();

  useEffect(() => {
    let world;
    let cancelled = false;
    // canvas textures need the web fonts, so wait for them
    document.fonts.ready.then(() => {
      if (cancelled) return;
      world = createWorld(
        canvasRef.current,
        { name, skills: orbitSkills, experiences, projects },
        {
          onRoom,
          onFlash: (v) => (flashRef.current.style.opacity = v),
          onProgress: (p) => (meterRef.current.style.transform = `scaleX(${p})`),
        }
      );
    });
    return () => {
      cancelled = true;
      world?.dispose();
    };
  }, [onRoom]);

  return (
    <>
      <canvas className="world" ref={canvasRef} aria-hidden="true" />
      <div className="flash" ref={flashRef} />
      <div className="meter" ref={meterRef} />
    </>
  );
};

export default World;
