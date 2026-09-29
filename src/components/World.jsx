import { useEffect, useRef } from "react";
import { createWorld } from "../world/createWorld";
import { name, orbitSkills, experiences, projects } from "../content";
import Crest from "../images/uom.png";

const World = ({ onPlace }) => {
  const ref = useRef();
  const fadeRef = useRef();

  useEffect(() => {
    let world;
    let cancelled = false;
    // canvas labels and signs use the web fonts, so wait for them
    document.fonts.ready.then(() => {
      if (cancelled) return;
      world = createWorld(
        ref.current,
        { name, skills: orbitSkills, experiences, projects, crest: Crest },
        {
          onPlace,
          onFade: (v, color) => {
            const el = fadeRef.current;
            el.style.opacity = v;
            if (color) el.style.backgroundColor = color;
          },
        }
      );
    });
    return () => {
      cancelled = true;
      world?.dispose();
    };
  }, [onPlace]);

  return (
    <>
      <canvas className="sky" ref={ref} aria-hidden="true" />
      <div className="scrim" aria-hidden="true" />
      <div className="fade" ref={fadeRef} aria-hidden="true" />
    </>
  );
};

export default World;
