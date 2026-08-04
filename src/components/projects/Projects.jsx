import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import { featuredProjects } from "../../data/projects";
import TiltCard from "../common/TiltCard";
import SectionAccent from "../common/SectionAccent";
import "./projects.scss";

const Projects = () => {
  return (
    <section id="projects" className="projects">
      <div className="section-container">
        <SectionAccent color="#9d6bff" corner="top-right" />
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="eyebrow">Featured Projects</span>
          <h2>Systems I&apos;ve built and shipped</h2>
          <p>Recent work spanning payments, biometric identity, secure authentication, and reactive services.</p>
        </motion.div>

        <div className="featured-grid">
          {featuredProjects.map((project, i) => (
            <TiltCard
              key={project.id}
              className="featured-card glass-panel"
              maxTilt={5}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            >
              <div className="card-glow" aria-hidden="true" />
              <span className="tag">{project.tagline}</span>
              <h3>{project.title}</h3>
              <p className="desc">{project.desc}</p>

              <ul className="feature-list">
                {project.highlights.map((h) => (
                  <li key={h}>
                    <FiCheckCircle /> {h}
                  </li>
                ))}
              </ul>

              <div className="tech-row">
                {project.tech.map((t) => (
                  <span key={t} className="tech-pill">
                    {t}
                  </span>
                ))}
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
