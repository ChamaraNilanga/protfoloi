import { lazy, Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowDown, FiDownload } from "react-icons/fi";
import "./hero.scss";

const HeroCanvas = lazy(() => import("../three/HeroCanvas"));

const textVariants = {
  initial: { y: 30, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, staggerChildren: 0.12 },
  },
};

const Hero = () => {
  const shouldReduceMotion = useReducedMotion();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="hero">
      <div className="canvas-bg" aria-hidden="true">
        <Suspense fallback={<div className="canvas-fallback" />}>
          <HeroCanvas />
        </Suspense>
      </div>

      <div className="hero-wrapper">
        <motion.div
          className="hero-content"
          variants={textVariants}
          initial={shouldReduceMotion ? undefined : "initial"}
          animate="animate"
        >
          <motion.span className="eyebrow" variants={textVariants}>
            Full-Stack Software Engineer &middot; Colombo, Sri Lanka
          </motion.span>

          <motion.h1 variants={textVariants}>
            Hi, I&apos;m <span className="gradient-text">Chamara Karunarathna</span>
          </motion.h1>

          <motion.p className="lede" variants={textVariants}>
            I build production-grade platforms with <strong>Java Spring Boot</strong>,{" "}
            <strong>React / Next.js</strong> and <strong>Flutter</strong> &mdash; from
            payment systems and biometric identity verification to secure OAuth2/Keycloak
            authentication, backed by PostgreSQL and shipped on Kubernetes.
          </motion.p>

          <motion.div className="hero-cta" variants={textVariants}>
            <button className="btn btn-primary" onClick={() => scrollTo("projects")}>
              View My Work
            </button>
            <button className="btn btn-outline" onClick={() => scrollTo("contact")}>
              Get In Touch
            </button>
            <a className="btn btn-outline resume-link" href={`${import.meta.env.BASE_URL}resume.pdf`} download>
              <FiDownload /> Resume
            </a>
          </motion.div>

          <motion.button
            className="scroll-cue"
            variants={textVariants}
            onClick={() => scrollTo("about")}
            aria-label="Scroll to About section"
          >
            <motion.span
              animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <FiArrowDown />
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
