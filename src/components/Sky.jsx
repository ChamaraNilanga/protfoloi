import { useEffect, useRef } from "react";
import { createSky } from "../sky/createSky";

const Sky = ({ onChapter }) => {
  const ref = useRef();
  useEffect(() => {
    const sky = createSky(ref.current, { onChapter });
    return () => sky.dispose();
  }, [onChapter]);
  return (
    <>
      <canvas className="sky" ref={ref} aria-hidden="true" />
      <div className="scrim" aria-hidden="true" />
    </>
  );
};

export default Sky;
