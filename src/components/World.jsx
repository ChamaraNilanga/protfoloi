import { useEffect, useRef } from "react";
import { createWorld } from "../three/world";
import { name, orbitSkills, experiences, projects } from "../content";

const fmt = (n) => (n < 0 ? "−" : " ") + Math.abs(n).toFixed(2).padStart(6, "0");

const World = ({ onRoom, onReady }) => {
  const canvasRef = useRef();
  const flashRef = useRef();
  const meterRef = useRef();
  const hudRef = useRef();

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
          onReady,
          onFlash: (v) => (flashRef.current.style.opacity = v),
          onProgress: (p, cam) => {
            meterRef.current.style.transform = `scaleX(${p})`;
            const [x, y, z] = hudRef.current.children;
            x.lastChild.textContent = fmt(cam.x);
            y.lastChild.textContent = fmt(cam.y);
            z.lastChild.textContent = fmt(cam.z);
          },
        }
      );
    });
    return () => {
      cancelled = true;
      world?.dispose();
    };
  }, [onRoom, onReady]);

  return (
    <>
      <canvas className="world" ref={canvasRef} aria-hidden="true" />
      <div className="flash" ref={flashRef} />
      <div className="meter" ref={meterRef} />
      <div className="hud" ref={hudRef} aria-hidden="true">
        <span>
          <b>x</b>
          <span />
        </span>
        <span>
          <b>y</b>
          <span />
        </span>
        <span>
          <b>z</b>
          <span />
        </span>
      </div>
    </>
  );
};

export default World;
