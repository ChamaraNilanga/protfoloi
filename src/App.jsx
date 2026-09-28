import { useState } from "react";
import "./journey.css";
import World from "./components/World";
import Contact from "./components/Contact";
import { ROOMS } from "./three/world";
import { stack, experiences, projects } from "./content";

const Role = ({ exp }) => (
  <article className="panel role">
    <header>
      <img src={exp.img} alt="" />
      <div>
        <h3>{exp.company}</h3>
        <div className="meta">{exp.time}</div>
      </div>
    </header>
    <p className="muted">{exp.position}</p>
    <p>{exp.desc}</p>
  </article>
);

const Project = ({ p }) => (
  <article className="project">
    <h3>{p.title}</h3>
    <div className="who">{p.role}</div>
    <p>{p.desc}</p>
    <div className="meta">{p.tech}</div>
  </article>
);

const App = () => {
  const [room, setRoom] = useState(0);

  return (
    <>
      <World onRoom={setRoom} />

      <header className="topbar">
        <a className="brand" href="#home">
          chamara<b>.dev</b>
        </a>
        <div className="cwd" aria-live="polite">
          you are in <span>{ROOMS[room].path}</span>
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
          <div className="eyebrow">Colombo, Sri Lanka · Software Engineer</div>
          <h1>
            Chamara <em>Karunarathna</em>
          </h1>
          <p>
            I build full-stack systems with Spring Boot, React and Kubernetes. Scroll to step inside the machine and
            walk through what I work on.
          </p>
          <div className="cue">
            <i /> scroll to enter
          </div>
        </section>

        <section className="stop short" data-kf="1">
          <div className="terminal">
            $ <b>ssh guest@chamara.dev</b>
            <br />
            <span className="ok">connected.</span> opening the lid…
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
            <div className="path">~/about</div>
            <h2>An engineer who likes the whole stack</h2>
            <p>
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
            <div className="path">~/stack</div>
            <h2>The core I run on</h2>
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
            <div className="path">~/experience</div>
            <h2>Three towers, three teams</h2>
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
            <div className="path">~/projects</div>
            <h2>Racks of shipped work</h2>
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
          <div className="panel contact">
            <div className="path">~/contact</div>
            <h2>Let&apos;s build something.</h2>
            <p className="muted">The amber beacon on the globe is Colombo. The arcs are where a message could come from.</p>
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
