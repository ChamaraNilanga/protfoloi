import { motion } from "framer-motion";
import { otherProjects } from "../../data/projects";
import SectionAccent from "../common/SectionAccent";
import "./moreProjects.scss";

const MoreProjects = () => {
  return (
    <section id="more-projects" className="more-projects">
      <div className="section-container">
        <SectionAccent color="#5eead4" baseYaw={-0.2} corner="top-right" />
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="eyebrow">More Projects</span>
          <h2>Earlier work, shipped and live</h2>
          <p>A selection of past engagements — swipe to browse.</p>
        </motion.div>

        <div className="other-scroll">
          {otherProjects.map((project, i) => (
            <motion.div
              key={project.id}
              className="other-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              whileHover={{ y: -6 }}
            >
              <div className="other-img">
                <img src={project.img} alt={project.title} loading="lazy" />
              </div>
              <div className="other-body">
                <h4>{project.title}</h4>
                <p>{project.desc}</p>
                <span className="tech">{project.tech}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoreProjects;
