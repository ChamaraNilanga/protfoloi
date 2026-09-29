import { useState } from "react";
import "./styles.css";
import World from "./components/World";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Contact from "./components/Contact";
import { KF } from "./world/createWorld";
import { stack, experiences, projects } from "./content";
import Crest from "./images/uom.png";

const Eyebrow = ({ n, children }) => (
  <div className="eyebrow reveal">
    <span>{String(n).padStart(2, "0")}</span>
    {children}
  </div>
);

const Project = ({ p }) => (
  <article className="glass work">
    <figure>
      <img src={p.img} alt="" loading="lazy" />
    </figure>
    <div className="work-body">
      <div className="work-top">
        <h3>{p.title}</h3>
        <span>{p.role}</span>
      </div>
      <p>{p.desc}</p>
      <p className="work-tech">{p.tech}</p>
    </div>
  </article>
);

// first job first: the street is walked in order
const roles = [...experiences].reverse();

const App = () => {
  const [place, setPlace] = useState("Deep space");

  return (
    <>
      <World onPlace={setPlace} />
      <div className="layer-hud" aria-live="polite">
        <span className="layer-n">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" fill="currentColor" />
          </svg>
        </span>
        <span className="layer-name">{place}</span>
      </div>
      <div className="page">
        <header className="top">
          <Nav />
        </header>

        <Hero />

        <main>
          <section className="chapter center" id="about" data-kf={KF.about}>
            <Eyebrow n={1}>About</Eyebrow>
            <h2 className="statement reveal">
              I turn <em>tangled requirements</em> into software that feels <em>simple</em> to the people using it.
            </h2>
            <div className="facts reveal">
              <div className="glass fact">
                <b>Since 2022</b>
                <span>Shipping production code</span>
              </div>
              <div className="glass fact">
                <b>3 teams</b>
                <span>Intervest, Hasthiya, Onsys</span>
              </div>
              <div className="glass fact">
                <b>6 projects</b>
                <span>Government, health, education, jobs</span>
              </div>
              <div className="glass fact">
                <b>Full stack</b>
                <span>Web, mobile and cloud</span>
              </div>
            </div>
          </section>

          <section className="chapter split" id="stack" data-kf={KF.stack}>
            <div className="split-spacer" aria-hidden="true" />
            <div className="split-body">
              <Eyebrow n={2}>Stack</Eyebrow>
              <h2 className="title reveal">
                The stack I <em>ship with</em>
              </h2>
              <p className="lede reveal">Each satellite in orbit is a tool I use in production.</p>
              <div className="stack-grid">
                {stack.map((s) => (
                  <div key={s.group} className="glass stack-card reveal">
                    <p className="stack-group">{s.group}</p>
                    <div className="chips">
                      {s.items.map((it) => (
                        <span key={it} className={`chip${s.hot?.includes(it) ? " hot" : ""}`}>
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="stop-caption" data-kf={KF.landing}>
            <span className="glass pill-caption">
              Touching down in <em>Katubedda, Moratuwa</em>
            </span>
          </div>

          <section className="chapter right-side" id="education" data-kf={KF.education}>
            <article className="glass edu-card reveal">
              <Eyebrow n={3}>Education</Eyebrow>
              <div className="edu-head">
                <img src={Crest} alt="University of Moratuwa crest" />
                <div>
                  <h2 className="edu-title">
                    BSc (Hons) in <em>Information Technology</em>
                  </h2>
                  <p className="muted-line">Faculty of Information Technology, University of Moratuwa</p>
                </div>
              </div>
              <div className="edu-stats">
                <div>
                  <b>2020 – 2024</b>
                  <span>Four-year honours degree</span>
                </div>
                <div>
                  <b>3.48</b>
                  <span>Final GPA</span>
                </div>
              </div>
              <div className="edu-school">
                <p>
                  <b>Sivali Central College, Ratnapura</b>
                </p>
                <p>GCE A/L Physical Science (2018): A, 2B · GCE O/L (2015): 7A, 2B</p>
              </div>
            </article>
          </section>

          <section className="chapter center" id="experience" data-kf={KF.street}>
            <Eyebrow n={4}>Experience</Eyebrow>
            <h2 className="title reveal">
              Three offices, <em>one</em> career
            </h2>
            <p className="lede center-lede reveal">Walk into every company I&apos;ve worked for, in the order I joined them.</p>
          </section>

          {roles.map((e, i) => (
            <section key={e.company} className="chapter right-side" data-kf={KF.roles[i]}>
              <article className="glass role-card reveal">
                <div className="role-head">
                  <img src={e.img} alt="" />
                  <span className="role-time">{e.time}</span>
                </div>
                <p className="role-step">
                  Office {i + 1} of {roles.length}
                </p>
                <h3>{e.company}</h3>
                <p className="role-pos">{e.position}</p>
                <p className="role-desc">{e.desc}</p>
              </article>
            </section>
          ))}

          <section className="chapter center short" id="work" data-kf={KF.projects}>
            <Eyebrow n={5}>Work</Eyebrow>
            <h2 className="title reveal">
              Selected <em>projects</em>
            </h2>
            <p className="lede center-lede reveal">Six projects hang in the gallery. Here&apos;s what each one does.</p>
          </section>
          {[0, 2, 4].map((n, i) => (
            <section key={n} className="chapter low" data-kf={KF.pairs[i]}>
              <div className="pair">
                <Project p={projects[n]} />
                <Project p={projects[n + 1]} />
              </div>
            </section>
          ))}

          <section className="chapter center short" id="contact" data-kf={KF.contact}>
            <Eyebrow n={6}>Contact</Eyebrow>
            <h2 className="finale reveal">
              Let&apos;s build <em>something</em> together
            </h2>
          </section>
          <section className="chapter center" data-kf={KF.form}>
            <Contact />
          </section>
        </main>

        <footer className="foot">
          <span>© {new Date().getFullYear()} Chamara Karunarathna</span>
          <span>Built with React and three.js</span>
        </footer>
      </div>
    </>
  );
};

export default App;
