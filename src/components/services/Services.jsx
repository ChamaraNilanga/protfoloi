import { useRef, useState } from "react";
import "./services.scss";
import "../portfolio/portfolio.scss";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
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

const SingleEdu = ({ item }) => {
  const ref = useRef();

  const { scrollYProgress } = useScroll({
    target: ref,
  });

  const y = useTransform(scrollYProgress, [0, 1], [-300, 300]);

  return (
    <section >
      <div className="container">
        <div className="wrapper">
          <div className="imageContainer" ref={ref}>
            <img src={item.img} alt="" />
          </div>
          <motion.div className="textContainer" style={{y}}>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <p><b>Role : {item.role}</b></p>
            <p><b>Technologies : {item.tech}</b></p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const ref = useRef();
  const [showEducation, setShowEducation] = useState(false);

  const isInView = useInView(ref, { margin: "-100px" });

  const toggleSection = () => {
    setShowEducation(!showEducation);
  };

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
        {/* <motion.div className="titleContainer" variants={variants}>
        <div className="title">
          <button onClick={toggleSection}> {showEducation ? "Experiances" : "Education"}</button>
        </div>
      </motion.div> */}
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
      {/* <motion.div className="titleContainer" onClick={toggleSection} variants={variants}>
        <div className="title">
          <img src={showEducation ? Edu : "/people.webp"} alt="" />
          <h1>
            <motion.b whileHover={{ color: "orange" }}>{showEducation ? "Education" : "Work Experiance"}</motion.b>
          </h1>
        </div>
      </motion.div> */}
        {showEducation ? (
          <div className="portfolio" ref={ref}>
            {education.map((item) => (
              <SingleEdu item={item} key={item.id} />
            ))}
          </div>
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