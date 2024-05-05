import { useRef } from "react";
import "./portfolio.scss";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const items = [
  {
    id: 1,
    title: "QMS",
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
  },
  {
    id: 3,
    title: "MedPeeps",
    desc: "A worldwide medical student app lets administrators share top-notch study materials, promoting collaboration and offering comprehensive resources to enhance users academic experience.",
    role: "Mobile Developer",
    tech:"Flutter,Firebase",
    img: "https://images.pexels.com/photos/6894528/pexels-photo-6894528.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
  },
  {
    id: 4,
    title: "Learny",
    desc: "The aim of this project is to develop a well interactive and user-friendly platform with enormous advantages by reducing difficulties of distance education between the teacher and the student.",
    role: "Full Stack Developer",
    tech:"React,Node,PostgreSQL,Express,AWS S3",
    img: "https://images.pexels.com/photos/18540208/pexels-photo-18540208/free-photo-of-wood-landscape-water-hill.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: 5,
    title: "JobMart",
    desc: "The JobMart.lk is a commercial web application that provides the opportunities to post available vacancies in an organization and, also to find available vacancies, for those interested to find a new job for their own qualifications.",
    img: "https://images.pexels.com/photos/18540208/pexels-photo-18540208/free-photo-of-wood-landscape-water-hill.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    role: "Full Stack Developer",
    tech:"React, SpringBoot, MySQL"
  },
  {
    id: 6,
    title: "NIROUSDT",
    desc: "NIROUSDT.com has been developed to provide a facility for customers to activate their plans, collect referrals, and interact easily with its customers in Forex Trading.",
    img: "https://images.pexels.com/photos/18540208/pexels-photo-18540208/free-photo-of-wood-landscape-water-hill.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
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
