import Animate from "./Animate";

// An illustrative trace of one request through the stack I work in.
// Offsets and widths are shares of the request's lifetime, not measurements.
const SPANS = [
  { layer: "Client", tech: "React", from: 0, to: 100 },
  { layer: "Auth", tech: "Keycloak", from: 5, to: 21 },
  { layer: "API", tech: "Spring Boot", from: 21, to: 90 },
  { layer: "Query", tech: "PostgreSQL", from: 32, to: 61 },
  { layer: "Object", tech: "MinIO", from: 63, to: 82 },
  { layer: "Runtime", tech: "Kubernetes", from: 3, to: 97 },
];

const TraceCard = () => (
  <Animate delay={900} direction="scale" className="card-wrap">
    <div className="career-card">
      <p className="card-label">Anatomy of a request</p>
      <p className="card-amount">
        <span>{SPANS.length}</span>
        <span className="dim">/{SPANS.length} layers</span>
      </p>
      <div className="card-delta">
        <span className="badge">End to end</span>
        <span className="caption">Every layer here is one I&apos;ve shipped</span>
      </div>
      <div className="trace">
        <div className="gridlines">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="gridline" style={{ left: `${((i + 1) / 5) * 100}%` }} />
          ))}
        </div>
        {SPANS.map((s, i) => (
          <div key={s.layer} className="span-row">
            <span className="span-name">
              {s.layer} <em>{s.tech}</em>
            </span>
            <div className="span-track">
              <div
                className="span-bar animate-span-grow"
                style={{
                  left: `${s.from}%`,
                  width: `${s.to - s.from}%`,
                  backgroundColor: i === 2 ? "white" : `rgba(255,255,255,${i === SPANS.length - 1 ? 0.12 : 0.45})`,
                  animationDelay: `${1100 + i * 110}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="axis">
        <span>request in</span>
        <span style={{ opacity: 0.4 }}>response out</span>
      </div>
    </div>
  </Animate>
);

const Hero = () => (
  <section className="hero" id="home" data-ch="0">
    <div className="hero-row">
      <div className="hero-copy">
        <Animate delay={200} direction="up">
          <p className="hero-kicker">
            <span className="dot" /> Chamara Karunarathna · Software Engineer
          </p>
        </Animate>
        <Animate delay={300} direction="up">
          <h1 className="hero-title">
            I build systems that <em>scale</em> from the first click to the cluster
          </h1>
        </Animate>
        <Animate delay={500} direction="up">
          <p className="hero-sub">Full-stack engineer at Onsys International. Spring Boot microservices, React front ends, shipped on Kubernetes.</p>
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
      <TraceCard />
    </div>
    <Animate delay={1500} direction="up" className="scroll-hint">
      <span>Scroll to follow a request</span>
      <i />
    </Animate>
  </section>
);

export default Hero;
