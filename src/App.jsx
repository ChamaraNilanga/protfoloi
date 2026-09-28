import { useCallback, useEffect, useState } from "react";
import "./journey.css";
import World from "./components/World";
import Contact from "./components/Contact";
import { ROOMS } from "./three/world";
import { stack, experiences, projects } from "./content";

const Path = ({ n, path }) => (
  <div className="path">
    <span className="n">{String(n).padStart(2, "0")}</span>
    <span className="cmd">$ cd</span>
    {path}
  </div>
);

const Role = ({ exp }) => (
  <article className="panel role">
    <header>
      <img src={exp.img} alt="" />
      <div>
        <h3>{exp.company}</h3>
        <div className="muted">{exp.position}</div>
      </div>
    </header>
    <div className="when">{exp.time}</div>
    <p>{exp.desc}</p>
  </article>
);

const Project = ({ p }) => (
  <article className="project">
    <figure>
      <img src={p.img} alt="" loading="lazy" />
    </figure>
    <div className="body">
      <div className="who">{p.role}</div>
      <h3>{p.title}</h3>
      <p>{p.desc}</p>
      <div className="meta">{p.tech}</div>
    </div>
  </article>
);

const App = () => {
  const [room, setRoom] = useState(0);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const s = document.documentElement.style;
    s.setProperty("--accent", ROOMS[room].accent);
    s.setProperty("--accent2", ROOMS[room].accent2);
  }, [room]);

  // never leave the boot screen up if WebGL is slow or unavailable
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <World onRoom={setRoom} onReady={onReady} />

      <div className={`boot${ready ? " done" : ""}`} aria-hidden="true">
        <div>
          <pre>
            {"> mounting ~/chamara\n> compiling shaders\n> "}
            <b>entering the machine</b>
          </pre>
          <div className="bar">
            <i />
          </div>
        </div>
      </div>

      <header className="topbar">
        <a className="brand" href="#home">
          <i />
          chamara<b>.dev</b>
        </a>
        <div className="cwd" aria-live="polite">
          <span className="count">
            {String(room + 1).padStart(2, "0")} / {String(ROOMS.length).padStart(2, "0")}
          </span>
          <span className="here">{ROOMS[room].path}</span>
        </div>
      </header>

      <nav aria-label="Sections">
        <ul className="rail">
          {ROOMS.map((r, i) => (
            <li key={r.id}>
              <a href={`#${r.id}`} aria-current={i === room}>
                {r.path}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="story">
        <section className="hero" id="home" data-kf="0">
          <div className="eyebrow">
            <i /> Colombo, Sri Lanka · Software Engineer at Onsys
          </div>
          <h1>
            <span className="solid">Chamara</span>
            <span className="outline">Karunarathna</span>
          </h1>
          <p>
            I build full-stack systems with <b>Spring Boot</b>, <b>React</b> and <b>Kubernetes</b>. Scroll to step
            through the screen and walk around what I work on.
          </p>
          <div className="ticks">
            <span>
              <b>3</b>companies
            </span>
            <span>
              <b>6</b>shipped projects
            </span>
            <span>
              <b>2022</b>writing production code
            </span>
          </div>
          <div className="cue">
            <i /> scroll to enter
          </div>
        </section>

        <section className="stop short" data-kf="1">
          <div className="terminal">
            $ <b>ssh guest@chamara.dev</b>
            <br />
            <span className="ok">connected.</span> opening the lid <span className="caret" />
          </div>
        </section>
        <div className="stop short" data-kf="2" aria-hidden="true" />

        <section className="stop short center" id="about" data-kf="3">
          <div className="terminal">
            $ <b>ls ~/</b>
            <br />
            <span className="ok">about stack experience projects contact</span>
          </div>
        </section>

        <section className="stop" data-kf="4">
          <div className="panel">
            <Path n={2} path="~/about" />
            <h2>
              An engineer who likes the <em>whole stack</em>
            </h2>
            <p className="muted">
              A quick learner who is self-motivated, hardworking and friendly, with good problem-solving skills and a
              taste for fast-paced teams. I&apos;ve shipped production software since 2022, from Flutter apps to
              microservices on Kubernetes.
            </p>
            <dl className="facts">
              <dt>Now</dt>
              <dd>Software Engineer, Onsys International</dd>
              <dt>Degree</dt>
              <dd>BSc (Hons) Information Technology, University of Moratuwa, 2020–2024 · GPA 3.48</dd>
              <dt>School</dt>
              <dd>Sivali Central College, Ratnapura · A/L Physical Science</dd>
            </dl>
          </div>
        </section>

        <section className="stop right" id="stack" data-kf="5">
          <div className="panel">
            <Path n={3} path="~/stack" />
            <h2>
              The <em>core</em> I run on
            </h2>
            <p className="muted">The labels orbiting the chip are the tools I use in production.</p>
            <dl className="stack">
              {stack.map((s) => (
                <div key={s.group}>
                  <dt>{s.group}</dt>
                  <dd>
                    {s.items.map((it) => (
                      <span key={it} className={`chip${s.hot?.includes(it) ? " hot" : ""}`}>
                        {it}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <div className="stop short" data-kf="6" aria-hidden="true" />

        <section className="stop center" id="experience" data-kf="7">
          <div className="panel">
            <Path n={4} path="~/experience" />
            <h2>
              Three towers, <em>three teams</em>
            </h2>
            <p className="muted">Each lit building on the board is a company I&apos;ve built software with.</p>
          </div>
        </section>
        {experiences.map((exp, i) => (
          <section key={exp.company} className={`stop${i % 2 ? "" : " right"}`} data-kf={8 + i}>
            <Role exp={exp} />
          </section>
        ))}

        <section className="stop center" id="projects" data-kf="11">
          <div className="panel">
            <Path n={5} path="~/projects" />
            <h2>
              Racks of <em>shipped work</em>
            </h2>
            <p className="muted">Six projects, from a government queue system to a study app for medical students.</p>
          </div>
        </section>
        {[0, 2, 4].map((n, i) => (
          <section key={n} className="stop low" data-kf={12 + i}>
            <div className="pair">
              <Project p={projects[n]} />
              <Project p={projects[n + 1]} />
            </div>
          </section>
        ))}

        <section className="stop" id="contact" data-kf="15">
          <div className="contact intro">
            <Path n={6} path="~/contact" />
            <h2 className="contact-hero">
              Let&apos;s build <em>something.</em>
            </h2>
            <p className="muted">The amber beacon on the globe is Colombo. The arcs are where your message could come from.</p>
          </div>
        </section>
        <section className="stop" data-kf="16">
          <Contact />
        </section>
      </main>

      <footer className="foot">© {new Date().getFullYear()} Chamara Karunarathna · built with three.js</footer>
    </>
  );
};

export default App;
