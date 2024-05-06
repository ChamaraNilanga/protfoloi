import { useEffect, useRef, useState } from "react";
import "./services.scss";
import "../portfolio/portfolio.scss";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import Edu from "../../images/edu.jpeg";

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

const education = [
  {
    id: 1,
    title: "Queue Management System",
    desc: "Introduced a web-based solution to streamline the queue management system at the Department for Registration of Persons in Sri Lanka.",
    role: "Full Stack Developer",
    tech:"React, Node, Express, MySQL",
    img: "https://images.pexels.com/photos/18073372/pexels-photo-18073372/free-photo-of-young-man-sitting-in-a-car-on-a-night-street.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
  },
  {
    id: 2,
    title: "Cleaner Connect",
    desc: "Developed a streamlined platform connecting cleaners, customers, and service admins for efficient cleaning service management.",
    role: "Full Stack Developer",
    tech:"React, Node, Express, MySQL",
    img: "https://images.pexels.com/photos/18023772/pexels-photo-18023772/free-photo-of-close-up-of-a-person-holding-a-wristwatch.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
  }
];

const experiences = [
  {
    companyName: 'Department for Registration of Persons, Sri Lanka',
    title: 'Queue Management System',
    description: 'Introduced a web-based solution to streamline the queue management system.',
    position: 'Full Stack Developer',
    time: '2022 Dec - 2023 Jun',
    tech: 'React, Node, Express, MongoDB'
  },
  // Add more experiences as needed
];

const exp = [
  {
    id: 1,
    title: "Queue Management System",
    desc: "Introduced a web-based solution to streamline the queue management system at the Department for Registration of Persons in Sri Lanka.",
    role: "Full Stack Developer",
    tech:"React, Node, Express, MySQL",
    img: "https://images.pexels.com/photos/18073372/pexels-photo-18073372/free-photo-of-young-man-sitting-in-a-car-on-a-night-street.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
  },
  {
    id: 2,
    title: "Cleaner Connect",
    desc: "Developed a streamlined platform connecting cleaners, customers, and service admins for efficient cleaning service management.",
    role: "Full Stack Developer",
    tech:"React, Node, Express, MySQL",
    img: "https://images.pexels.com/photos/18023772/pexels-photo-18023772/free-photo-of-close-up-of-a-person-holding-a-wristwatch.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
  }
];

const SingleEdu = ({ item,scrollYProgress }) => {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  // Check if the component is in view
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true, // Only trigger once
    threshold: 0.5, // Trigger when at least 50% of the component is visible
  });

  useEffect(() => {
    // Update the visibility state
    setIsVisible(inView);
  }, [inView]);

  // Adjust y position based on visibility
  const y = useTransform(scrollYProgress, [0, 1], [-300, isVisible ? 300 : 0]);

  return (
    <section ref={inViewRef}>
      <div className="container">
        <div className="wrapper">
          <div className="imageContainer" ref={ref}>
            <img src={item.img} alt="" />
          </div>
          <motion.div className="textContainer" style={{ y }}>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <p>
              <b>Role : {item.role}</b>
            </p>
            <p>
              <b>Technologies : {item.tech}</b>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ExperienceCard = ({ experience }) => {
  return (
    <motion.div className="experience-card">
      <motion.div className="experience-year">{experience.time}</motion.div>
      <img src={experience.companyLogo} alt={experience.companyName} className="company-logo" />
      <motion.div className="experience-details">
        <motion.h3>{experience.companyName}</motion.h3>
        <motion.p><strong>Position:</strong> {experience.position}</motion.p>
        <motion.p><strong>Company:</strong> {experience.companyName}</motion.p>
        <motion.p>{experience.description}</motion.p>
        <motion.p><strong>Technologies:</strong> {experience.tech}</motion.p>
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
      style={{marginTop: "20px"}}
    >
      <motion.div className="textContainer" variants={variants}>
        <hr/>
      <motion.div className="titleContainer" onClick={toggleSection} variants={variants}>
        <div className="title">
          <img src={showEducation ? Edu : "/people.webp"} alt="" />
          <h1>
            <motion.b whileHover={{ color: "orange" }}>{showEducation ? "Education" : "Work Experiance"}</motion.b>
          </h1>
        </div>
      </motion.div>
        <hr />
      </motion.div>
        {showEducation ? (
          <motion.div className="experiences mt-5">
          <motion.div className="timeline">
            {experiences.map((experience, index) => (
              <ExperienceCard key={index} experience={experience} />
            ))}
          </motion.div>
        </motion.div>
        ) : (
          <motion.div
            className="box"
            whileHover={{ background: "lightgray", color: "black" }}
          >
            <h2>Experience</h2>
            <p>Description of Experience</p>
            <button>Go</button>
          </motion.div>
        )}
      </motion.div>
  );
};

export default Services;