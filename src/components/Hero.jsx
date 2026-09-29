import Animate from "./Animate";
import { KF } from "../world/createWorld";
import Photo from "../images/my2.png";

// The profile as the code an engineer would write for it. Every value is
// real; the tokens are coloured like an editor would.
const CODE = [
  [["kw", "const "], ["id", "engineer"], ["op", " = {"]],
  [["key", "  name"], ["op", ": "], ["str", '"Chamara Karunarathna"'], ["op", ","]],
  [["key", "  role"], ["op", ": "], ["str", '"Software Engineer"'], ["op", ","]],
  [["key", "  at"], ["op", ": "], ["str", '"Onsys International"'], ["op", ","]],
  [["key", "  stack"], ["op", ": ["], ["str", '"Spring Boot"'], ["op", ", "], ["str", '"React"'], ["op", ", "], ["str", '"K8s"'], ["op", "],"]],
  [["key", "  degree"], ["op", ": "], ["str", '"BSc (Hons) IT, UoM"'], ["op", ","]],
  [["key", "  shipping"], ["op", ": "], ["kw", "true"], ["op", ","]],
  [["op", "};"]],
];

const DevWindow = () => (
  <Animate delay={800} direction="scale" className="dev-wrap">
    <div className="dev-window">
      <div className="dev-bar">
        <span className="dev-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="dev-tab active">engineer.ts</span>
        <span className="dev-tab">README.md</span>
      </div>
      <div className="dev-body">
        <pre className="dev-code" aria-label="Profile written as code">
          {CODE.map((line, i) => (
            <span key={i} className="dev-line" style={{ animationDelay: `${1200 + i * 140}ms` }}>
              <span className="ln">{i + 1}</span>
              {line.map(([t, text], k) => (
                <span key={k} className={`tk-${t}`}>
                  {text}
                </span>
              ))}
            </span>
          ))}
          <span className="dev-line" style={{ animationDelay: `${1200 + CODE.length * 140}ms` }}>
            <span className="ln">{CODE.length + 1}</span>
            <span className="caret" />
          </span>
        </pre>
        <div className="dev-glow" aria-hidden="true" />
      </div>
      <div className="dev-status">
        <span>⎇ main</span>
        <span>TypeScript</span>
        <span>Ln 9, Col 1</span>
      </div>
      <img className="dev-photo" src={Photo} alt="Chamara Karunarathna" />
    </div>
    <div className="dev-chip chip-a">
      <b>$</b> git push origin main
    </div>
    <div className="dev-chip chip-b">@SpringBootApplication</div>
    <div className="dev-chip chip-c">
      <b>kubectl</b> get pods <span className="ok">Running</span>
    </div>
  </Animate>
);

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
      <DevWindow />
    </div>
    <Animate delay={1500} direction="up" className="scroll-hint">
      <span>Scroll to begin the journey</span>
      <i />
    </Animate>
  </section>
);

export default Hero;
