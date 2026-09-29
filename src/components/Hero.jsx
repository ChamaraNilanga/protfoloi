import Animate from "./Animate";
import { KF } from "../world/createWorld";

const Hero = () => (
  <section className="hero" id="home" data-kf={KF.hero}>
    <div className="hero-row">
      <div className="hero-copy">
        <Animate delay={200} direction="up">
          <p className="hero-kicker">
            <span className="dot" /> Hi, I&apos;m Chamara Karunarathna
          </p>
        </Animate>
        <Animate delay={300} direction="up">
          <h1 className="hero-title">
            Software engineer building systems that <em>scale</em>
          </h1>
        </Animate>
        <Animate delay={500} direction="up">
          <p className="hero-sub">Full-stack at Onsys International: Spring Boot microservices, React front ends, shipped on Kubernetes.</p>
        </Animate>
        <Animate delay={700} direction="up">
          <div className="hero-ctas">
            <a className="cta-solid" href="#work">
              View projects
            </a>
            <a className="cta-ghost" href="#contact">
              Contact me
            </a>
          </div>
        </Animate>
      </div>
    </div>
    <Animate delay={1300} direction="up" className="portrait-tag">
      <span>Chamara Karunarathna</span>
      <em>Software Engineer</em>
    </Animate>
    <Animate delay={1500} direction="up" className="scroll-hint">
      <span>Scroll to begin the journey</span>
      <i />
    </Animate>
  </section>
);

export default Hero;
