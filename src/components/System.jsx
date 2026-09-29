import { useEffect, useRef } from "react";
import { createSystem } from "../system/createSystem";
import { name, orbitSkills, experiences, projects } from "../content";

const System = ({ onChapter }) => {
  const ref = useRef();
  useEffect(() => {
    let world;
    let cancelled = false;
    // canvas labels use the web fonts, so wait for them
    document.fonts.ready.then(() => {
      if (cancelled) return;
      world = createSystem(ref.current, { name, skills: orbitSkills, experiences, projects }, { onChapter });
    });
    return () => {
      cancelled = true;
      world?.dispose();
    };
  }, [onChapter]);
  return (
    <>
      <canvas className="sky" ref={ref} aria-hidden="true" />
      <div className="scrim" aria-hidden="true" />
    </>
  );
};

export default System;
