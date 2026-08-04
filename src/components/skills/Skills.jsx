import { motion } from "framer-motion";
import { skillCategories } from "../../data/skills";
import SectionAccent from "../common/SectionAccent";
import "./skills.scss";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

const Skills = () => {
  return (
    <section id="skills" className="skills">
      <div className="section-container">
        <SectionAccent color="#ff9d2f" baseYaw={-0.7} corner="top-right" />
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="eyebrow">Skills</span>
          <h2>Technologies I build with</h2>
          <p>A stack spanning backend services, modern frontends, mobile, infrastructure, and security.</p>
        </motion.div>

        <div className="skills-categories">
          {skillCategories.map((category, ci) => (
            <motion.div
              key={category.id}
              className="category-card glass-panel"
              style={{ "--cat-color": category.color }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: ci * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="category-header">
                <span className="category-icon">
                  <category.icon />
                </span>
                <h3>{category.label}</h3>
              </div>

              <motion.div
                className="skill-chips"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {category.skills.map((skill) => (
                  <motion.div
                    key={skill.name}
                    className="skill-chip"
                    variants={item}
                    whileHover={{ y: -4, scale: 1.05 }}
                  >
                    <span className="chip-icon">
                      <skill.icon />
                    </span>
                    <span>{skill.name}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
