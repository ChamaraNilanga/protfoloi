import { useState } from "react";
import "./styles.css";
import Sky from "./components/Sky";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Contact from "./components/Contact";
import { stack, experiences, projects } from "./content";

const CHAPTER_NAMES = ["Dusk", "Golden hour", "Blue hour", "Nebula", "Aurora", "Sunrise"];

const Eyebrow = ({ n, children }) => (
  <div className="eyebrow reveal">
    <span>{String(n).padStart(2, "0")}</span>
    {children}
  </div>
);

const App = () => {
  const [chapter, setChapter] = useState(0);

  return (
    <>
      <Sky onChapter={setChapter} />
      <div className="page">
        <header className="top">
          <Nav />
        </header>

        <Hero />

        <main>
          <section className="chapter center" id="about" data-ch="1">
            <Eyebrow n={1}>About</Eyebrow>
            <h2 className="statement reveal">
              I turn <em>tangled requirements</em> into software that feels <em>simple</em> to the people using it.
            </h2>
            <div className="facts reveal">
              <div className="glass fact">
                <b>BSc (Hons) IT</b>
                <span>University of Moratuwa, 2020–2024</span>
              </div>
              <div className="glass fact">
                <b>GPA 3.48</b>
                <span>Faculty of Information Technology</span>
              </div>
              <div className="glass fact">
                <b>Since 2022</b>
                <span>Shipping production code</span>
              </div>
            </div>
          </section>

          <section className="chapter split" id="stack" data-ch="2">
            <div className="split-head">
              <Eyebrow n={2}>Stack</Eyebrow>
              <h2 className="title reveal">
                The tools I <em>reach for</em>
              </h2>
              <p className="lede reveal">Backend in Java and Node, interfaces in React and Flutter, running on Kubernetes with Keycloak and MinIO.</p>
            </div>
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
          </section>

          <section className="chapter" id="experience" data-ch="3">
            <Eyebrow n={3}>Experience</Eyebrow>
            <h2 className="title reveal">
              Where I&apos;ve <em>shipped</em>
            </h2>
            <div className="roles">
              {experiences.map((e) => (
                <article key={e.company} className="glass role reveal">
                  <div className="role-head">
                    <img src={e.img} alt="" />
                    <span className="role-time">{e.time}</span>
                  </div>
                  <h3>{e.company}</h3>
                  <p className="role-pos">{e.position}</p>
                  <p className="role-desc">{e.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="chapter" id="work" data-ch="4">
            <Eyebrow n={4}>Work</Eyebrow>
            <h2 className="title reveal">
              Selected <em>projects</em>
            </h2>
            <div className="work-grid">
              {projects.map((p) => (
                <article key={p.title} className="glass work reveal">
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
              ))}
            </div>
          </section>

          <section className="chapter center" id="contact" data-ch="5">
            <Eyebrow n={5}>Contact</Eyebrow>
            <h2 className="finale reveal">
              Let&apos;s build <em>something</em> together
            </h2>
            <Contact />
          </section>
        </main>

        <footer className="foot">
          <span>© {new Date().getFullYear()} Chamara Karunarathna</span>
          <span aria-live="polite">Sky: {CHAPTER_NAMES[chapter]}</span>
        </footer>
      </div>
    </>
  );
};

export default App;
