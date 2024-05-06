import { useEffect, useRef, useState } from "react";
import "./services.scss";
import "../portfolio/portfolio.scss";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import Edu from "../../images/edu.jpeg";
import Scc from "../../images/scc.png";
import Uom from "../../images/uom.png";
import Hasthiya from "../../images/hasthiya.jpeg";
import Intervest from "../../images/intervest.jpeg";
import { AnimatePresence } from "framer-motion";
import People from "../../images/people.webp";

const variants = {
  initial: {
    x: -500,
    y: 100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      staggerChildren: 0.1,
    },
  },
};

const educations = [
  {
    companyName: 'Faculty of Information Technology',
    institute: 'University of Moratuwa',
    header1: 'BSc(Hons) in Information Technology',
    text1: 'GPA - 3.48',
    header2: '',
    text2: '',
    time: '2020 - 2024',
    img: Uom,
  },
  {
    companyName: 'Sivali Central College',
    institute: 'Rathnapura',
    header1: 'GCE Advanced Level - Physical Science Stream (2018)',
    text1: 'Results: A and 2B`s',
    header2: 'GCE Ordinary Level (2015)',
    text2: 'Results:7A`s and 2B`s',
    time: '2009 - 2018',
    img: Scc,
  },
];

const exp = [
  {
    id: 1,
    company: "Hasthiya IT",
    desc: "I spearheaded web development using NodeJS, ExpressJS, ReactJS, and MySQL, while also contributing to mobile apps with Flutter and Firebase.",
    role: "Full Stack Developer",
    position:"Associate Software Engineer",
    time: "2023 Jun - Present",
    img: Hasthiya,
  },
  {
    id: 2,
    company: "Intervest Software Technologies",
    desc: "This internship solidified my understanding of full-stack development and industry best practices, enhancing my ability to deliver comprehensive software solutions with Springboot,Java, Javascript, SQL and Enonic CMS.",
    role: "Full Stack Developer",
    position:"Software Engineer - Intern",
    time: "2023 Jun - Present",
    img: Intervest,
  }
];

const ExpCard = ({ experience }) => {
  return (
    <motion.div className="experience-card">
      <motion.div className="left-content-exp-card">
        <img src={experience.img} alt={experience.company} className="company-logo" />
        <motion.p><strong>{experience.time}</strong></motion.p>
      </motion.div>
      <motion.div className="right-content">
        <motion.h1>{experience.company}</motion.h1>
        <motion.div className="edu-body">
        <motion.h3>{experience.position}</motion.h3>
        <motion.p>{experience.desc}</motion.p>
        </motion.div>
        <motion.div className="edu-body">
        <motion.p> <strong>Role:</strong>{experience.role}</motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const EducationCard = ({ experience }) => {
  return (
    <motion.div className="experience-card">
      <motion.div className="left-content">
        <img src={experience.img} alt={experience.companyName} className="company-logo" />
      </motion.div>
      <motion.div className="right-content">
        <motion.h1>{experience.companyName}</motion.h1>
        <motion.h1>{experience.institute}</motion.h1>
        <motion.div className="edu-body">
        <motion.h3>{experience.header1}</motion.h3>
        <motion.p>{experience.text1}</motion.p>
        </motion.div>
        <motion.div className="edu-body">
        <motion.h3>{experience.header2}</motion.h3>
        <motion.p>{experience.text2}</motion.p>
        </motion.div>
        <motion.p>{experience.time}</motion.p>
      </motion.div>
    </motion.div>
  );
};

const Services = () => {
  const ref = useRef();
  const [showEducation, setShowEducation] = useState(false);

  const isInView = useInView(ref, { margin: "-100px" });

  const toggleSection = () => {
    setShowEducation(!showEducation);
  };

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });
  const y = useTransform(scrollYProgress, [0, 1], [-300, 300]);

  return (
    <motion.div
      className="services"
      variants={variants}
      initial="initial"
      ref={ref}
      animate={"animate"}
      style={{ marginTop: "20px" }}
    >
      <motion.div className="textContainer" variants={variants}>
        <hr />
        <motion.div
          className="titleContainer"
          onClick={toggleSection}
          variants={variants}
        >
          <div className="title">
            <img src={showEducation ? Edu : People} alt="" />
            <h1>
              <motion.b whileHover={{ color: "orange" }}>
                {showEducation ? "Education" : "Work Experience"}
              </motion.b>
              <motion.p style={{width:"110px",height:"30px",fontSize:"12px",color:"orange"}}><strong>{showEducation ? "See Experience >>" : "See Education >>"}</strong></motion.p>
            </h1>
          </div>
        </motion.div>
        <hr />
      </motion.div>
      <AnimatePresence>
        {showEducation ? (
          <motion.div
            key="education"
            className="experiences mt-5"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="initial"
          >
            <motion.div className="timeline">
              {educations.map((experience, index) => (
                <EducationCard key={index} experience={experience} />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="experience"
            className="experiences mt-5"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="initial"
          >
            <motion.div className="timeline">
              {exp.map((experience, index) => (
                <ExpCard key={index} experience={experience} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Services;