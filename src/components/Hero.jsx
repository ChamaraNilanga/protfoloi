import Animate from "./Animate";
import { career } from "../content";

// one bar per month in industry; height = role level at that company
const monthsBetween = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();

const CareerCard = () => {
  const now = new Date();
  const start = career[0].from;
  const bars = [];
  career.forEach((c, ci) => {
    const end = c.to ?? now;
    for (let d = new Date(c.from); d <= end && bars.length < 60; d.setMonth(d.getMonth() + 1)) {
      bars.push({ h: c.level, company: ci });
    }
  });
  const total = monthsBetween(start, now) + 1;
  const years = Math.floor(total / 12);
  const months = total % 12;
  const maxHeight = Math.max(...bars.map((b) => b.h));
  const firstYear = start.getFullYear();
  const axis = Array.from({ length: now.getFullYear() - firstYear + 1 }, (_, i) => `'${String(firstYear + i).slice(2)}`);

  return (
    <Animate delay={900} direction="scale" className="card-wrap">
      <div className="career-card">
        <p className="card-label">Time in industry</p>
        <p className="card-amount">
          <span>{years} yrs</span>
          <span className="dim"> {months} mo</span>
        </p>
        <div className="card-delta">
          <span className="badge">{career.length} teams</span>
          <span className="caption">{career.map((c) => c.short).join(" → ")}</span>
        </div>
        <div className="chart">
          <div className="bars">
            {bars.map((b, i) => (
              <div
                key={i}
                className={`bar animate-bar-grow${i === bars.length - 1 ? " now" : ""}`}
                style={{
                  height: `${(b.h / maxHeight) * 100}%`,
                  backgroundColor: b.company === career.length - 1 ? "white" : `rgba(255,255,255,${0.3 + b.company * 0.25})`,
                  animationDelay: `${1100 + i * 22}ms`,
                }}
              />
            ))}
          </div>
          <div className="gridlines">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="gridline" style={{ left: `${((i + 1) / 5) * 100}%` }} />
            ))}
          </div>
          <div className="axis">
            {axis.map((y, i) => (
              <span key={y} style={{ opacity: i === axis.length - 1 ? 0.4 : 1 }}>
                {y}
              </span>
            ))}
          </div>
        </div>
        <p className="card-note">Each bar is a month. Height is the role level.</p>
      </div>
    </Animate>
  );
};

const Hero = () => (
  <section className="hero" id="home" data-ch="0">
    <div className="hero-row">
      <div className="hero-copy">
        <Animate delay={300} direction="up">
          <h1 className="hero-title">
            I build software that feels <em>effortless</em>
          </h1>
        </Animate>
        <Animate delay={500} direction="up">
          <p className="hero-sub">Chamara Karunarathna, full-stack engineer at Onsys International, working in Spring Boot, React and Kubernetes.</p>
        </Animate>
        <Animate delay={700} direction="up">
          <div className="hero-ctas">
            <a className="cta-solid" href="#work">
              See my work
            </a>
            <a className="cta-ghost" href="#contact">
              Get in touch
            </a>
          </div>
        </Animate>
      </div>
      <CareerCard />
    </div>
    <Animate delay={1400} direction="up" className="scroll-hint">
      <span>Scroll to fly through</span>
      <i />
    </Animate>
  </section>
);

export default Hero;
