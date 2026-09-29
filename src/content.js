import Onsys from "./images/onsys.jpeg";
import Hasthiya from "./images/hasthiya.jpeg";
import Intervest from "./images/intervest.jpeg";
import Qms from "./images/qms.jpg";
import Cleaner from "./images/cleaner.jpg";
import Medpeeps from "./images/medi.jpg";
import Learny from "./images/lms.jpg";
import Jobmart from "./images/job.jpg";
import Niro from "./images/niro.jpg";

export const name = "Chamara Karunarathna";

export const stack = [
  { group: "Backend", items: ["Java", "Spring Boot", "Node.js", "Express"], hot: ["Spring Boot"] },
  { group: "Frontend", items: ["React", "JavaScript", "HTML/CSS"], hot: ["React"] },
  { group: "Mobile", items: ["Flutter", "Firebase"] },
  { group: "Data", items: ["PostgreSQL", "MySQL", "AWS S3"] },
  { group: "Platform", items: ["Kubernetes", "Keycloak", "MinIO", "Microservices"], hot: ["Kubernetes"] },
];

// labels that orbit the CPU core in the 3D scene
export const orbitSkills = [
  "Spring Boot",
  "React",
  "Kubernetes",
  "Node.js",
  "PostgreSQL",
  "Flutter",
  "Keycloak",
  "Java",
  "MinIO",
  "Express",
  "MySQL",
  "Firebase",
];

export const experiences = [
  {
    company: "Onsys International",
    position: "Software Engineer / Associate Software Engineer",
    time: "Apr 2024 — now",
    desc: "Lead development of web applications with Spring Boot, React and PostgreSQL in a microservices architecture, integrated with Kubernetes, MinIO and Keycloak for scalable, secure delivery.",
    img: Onsys,
  },
  {
    company: "Hasthiya IT",
    position: "Associate Software Engineer",
    time: "Jun 2023 — Apr 2024",
    desc: "Built web products with Node.js, Express, React and MySQL, and contributed to mobile apps with Flutter and Firebase.",
    img: Hasthiya,
  },
  {
    company: "Intervest Software",
    position: "Software Engineer Intern",
    time: "Dec 2022 — Jun 2023",
    desc: "Full-stack work with Spring Boot, Java, JavaScript, SQL and Enonic CMS, learning industry practice end to end.",
    img: Intervest,
  },
];

export const projects = [
  {
    title: "QMS",
    desc: "A web-based queue management system for the Department for Registration of Persons in Sri Lanka.",
    role: "Full Stack Developer",
    tech: "React · Node · Express · MySQL",
    img: Qms,
  },
  {
    title: "Cleaner Connect",
    desc: "A platform connecting cleaners, customers and service admins to run cleaning jobs efficiently.",
    role: "Full Stack Developer",
    tech: "React · Node · Express · MySQL",
    img: Cleaner,
  },
  {
    title: "MedPeeps",
    desc: "A worldwide app where administrators share study material with medical students.",
    role: "Mobile Developer",
    tech: "Flutter · Firebase",
    img: Medpeeps,
  },
  {
    title: "Learny",
    desc: "An interactive learning platform that closes the distance between teachers and students.",
    role: "Full Stack Developer",
    tech: "React · Node · PostgreSQL · AWS S3",
    img: Learny,
  },
  {
    title: "JobMart",
    desc: "JobMart.lk lets organisations post vacancies and candidates find jobs that fit their qualifications.",
    role: "Full Stack Developer",
    tech: "React · Spring Boot · MySQL",
    img: Jobmart,
  },
  {
    title: "NIROUSDT",
    desc: "A customer portal for activating forex trading plans, collecting referrals and staying in touch.",
    role: "Full Stack Developer",
    tech: "HTML · CSS · PHP · MySQL",
    img: Niro,
  },
];

export const contact = {
  email: "chamaranilanga1999@gmail.com",
  phone: "+94 70 27 45 462",
  linkedin: "http://www.linkedin.com/in/chamarank",
  github: "https://github.com/ChamaraNilanga",
};

// drives the hero card: one bar per month, height = role level
export const career = [
  { short: "Intervest", from: new Date(2022, 11, 1), to: new Date(2023, 4, 1), level: 40 },
  { short: "Hasthiya", from: new Date(2023, 5, 1), to: new Date(2024, 2, 1), level: 65 },
  { short: "Onsys", from: new Date(2024, 3, 1), to: null, level: 100 },
];
