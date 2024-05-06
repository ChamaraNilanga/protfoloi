import { useRef } from "react";
import "./portfolio.scss";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Cleaner from "../../images/cleaner.jpg";
import Medpeeps from "../../images/medi.jpg";
import Learny from "../../images/lms.jpg";
import Jobmart from "../../images/job.jpg";
import Niro from "../../images/niro.jpg";
import Qms from "../../images/qms.jpg";

const items = [
  {
    id: 1,
    title: "QMS",
    desc: "Introduced a web-based solution to streamline the queue management system at the Department for Registration of Persons in Sri Lanka.",
    role: "Full Stack Developer",
    tech:"React, Node, Express, MySQL",
    img: Qms,
  },
  {
    id: 2,
    title: "Cleaner Connect",
    desc: "Developed a streamlined platform connecting cleaners, customers, and service admins for efficient cleaning service management.",
    role: "Full Stack Developer",
    tech:"React, Node, Express, MySQL",
    img: Cleaner,
  },
  {
    id: 3,
    title: "MedPeeps",
    desc: "A worldwide medical student app lets administrators share top-notch study materials, promoting collaboration and offering comprehensive resources to enhance users academic experience.",
    role: "Mobile Developer",
    tech:"Flutter,Firebase",
    img: Medpeeps,
  },
  {
    id: 4,
    title: "Learny",
    desc: "The aim of this project is to develop a well interactive and user-friendly platform with enormous advantages by reducing difficulties of distance education between the teacher and the student.",
    role: "Full Stack Developer",
    tech:"React,Node,PostgreSQL,Express,AWS S3",
    img: Learny,
  },
  {
    id: 5,
    title: "JobMart",
    desc: "The JobMart.lk is a commercial web application that provides the opportunities to post available vacancies in an organization and, also to find available vacancies, for those interested to find a new job for their own qualifications.",
    img: Jobmart,
    role: "Full Stack Developer",
    tech:"React, SpringBoot, MySQL"
  },
  {
    id: 6,
    title: "NIROUSDT",
    desc: "NIROUSDT.com has been developed to provide a facility for customers to activate their plans, collect referrals, and interact easily with its customers in Forex Trading.",
    img: Niro,
    role: "Full Stack Developer",
    tech:"HTML,CSS,MySQL,PHP"
  },
];

const Single = ({ item }) => {
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

const Portfolio = () => {
  const ref = useRef();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  return (
    <div className="portfolio" ref={ref}>
      <div className="progress">
        <h1>Featured Works</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>
      {items.map((item) => (
        <Single item={item} key={item.id} />
      ))}
    </div>
  );
};

export default Portfolio;
