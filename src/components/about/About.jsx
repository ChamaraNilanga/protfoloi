import { motion } from "framer-motion";
import { FaCode, FaCloud, FaMobileAlt, FaShieldAlt } from "react-icons/fa";
import myPhoto from "../../images/my2.png";
import TiltCard from "../common/TiltCard";
import SectionAccent from "../common/SectionAccent";
import StatsRow from "../stats/StatsRow";
import "./about.scss";

const highlights = [
  {
    icon: FaCode,
    title: "Full-stack delivery",
    text: "End-to-end features across Java Spring Boot APIs and React / Next.js frontends.",
  },
  {
    icon: FaShieldAlt,
    title: "Secure by design",
    text: "Keycloak, OAuth2/PKCE authentication and CyberSource payment integrations.",
  },
  {
    icon: FaCloud,
    title: "Cloud-native",
    text: "Containerized microservices deployed and scaled on Kubernetes.",
  },
  {
    icon: FaMobileAlt,
    title: "Cross-platform mobile",
    text: "Flutter apps sharing a single codebase across iOS and Android.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08 },
  }),
};

const TiltPhoto = () => {
  return (
    <TiltCard className="photo-frame glass-panel" maxTilt={10}>
      <img src={myPhoto} alt="Portrait of Chamara Karunarathna" loading="lazy" />
      <span className="badge">3+ Years Experience</span>
    </TiltCard>
  );
};

const About = () => {
  return (
    <section id="about" className="about">
      <div className="section-container">
        <SectionAccent color="#9d6bff" baseYaw={0.2} corner="top-right" />
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="eyebrow">About Me</span>
          <h2>Engineering reliable software, end to end</h2>
          <p>
            A snapshot of the experience, principles, and technical range I bring to every
            engagement.
          </p>
        </motion.div>

        <div className="about-grid">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <TiltPhoto />
          </motion.div>

          <div className="about-copy">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              I&apos;m a Full-Stack Software Engineer with <strong>3+ years of experience</strong> at
              Onsys Technologies (Colombo, Sri Lanka) &mdash; BSc (Hons) IT, University of
              Moratuwa. I build resilient Spring Boot services, React/Next.js &amp; Flutter
              interfaces, and secure identity/payment flows with Keycloak, OAuth2/PKCE, and
              CyberSource, deployed on Kubernetes.
            </motion.p>

            <div className="highlight-grid">
              {highlights.map((h, i) => (
                <motion.div
                  key={h.title}
                  className="highlight-card glass-panel"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={i}
                  whileHover={{ y: -6 }}
                >
                  <h.icon className="highlight-icon" />
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <StatsRow />
      </div>
    </section>
  );
};

export default About;
