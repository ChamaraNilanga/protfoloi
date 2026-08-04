import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experience, education } from "../../data/experience";
import SectionAccent from "../common/SectionAccent";
import "./experience.scss";

const TABS = [
  { id: "experience", label: "Work Experience" },
  { id: "education", label: "Education" },
];

const ExperienceItem = ({ item, index }) => (
  <motion.div
    className="timeline-item"
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
  >
    <div className="timeline-marker">
      <img src={item.img} alt="" loading="lazy" />
    </div>
    <div className="timeline-card glass-panel">
      <span className="time-badge">{item.time}</span>
      <h3>{item.company}</h3>
      <h4>{item.position}</h4>
      <p>{item.desc}</p>
      <p className="role-line">
        <strong>Role:</strong> {item.role}
      </p>
    </div>
  </motion.div>
);

const EducationItem = ({ item, index }) => (
  <motion.div
    className="timeline-item"
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
  >
    <div className="timeline-marker">
      <img src={item.img} alt="" loading="lazy" />
    </div>
    <div className="timeline-card glass-panel">
      <span className="time-badge">{item.time}</span>
      <h3>{item.companyName}</h3>
      <h4>{item.institute}</h4>
      <p>
        <strong>{item.header1}</strong> &mdash; {item.text1}
      </p>
      {item.header2 && (
        <p>
          <strong>{item.header2}</strong> &mdash; {item.text2}
        </p>
      )}
    </div>
  </motion.div>
);

const Experience = () => {
  const [tab, setTab] = useState("experience");

  return (
    <section id="experience" className="experience">
      <div className="section-container">
        <SectionAccent color="#5eead4" baseYaw={0.5} corner="top-right" />
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="eyebrow">Career Progression</span>
          <h2>Experience &amp; Education</h2>
          <p>An interactive look at where I&apos;ve worked and studied.</p>
        </motion.div>

        <div className="tabs" role="tablist" aria-label="Experience or Education">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <div className="timeline-line" aria-hidden="true" />
            {tab === "experience"
              ? experience.map((item, i) => <ExperienceItem key={item.id} item={item} index={i} />)
              : education.map((item, i) => <EducationItem key={item.id} item={item} index={i} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Experience;
