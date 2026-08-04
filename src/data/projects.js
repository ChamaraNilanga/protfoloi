import Cleaner from "../images/cleaner.jpg";
import Medpeeps from "../images/medi.jpg";
import Learny from "../images/lms.jpg";
import Jobmart from "../images/job.jpg";
import Niro from "../images/niro.jpg";
import Qms from "../images/qms.jpg";

// Featured, stack-representative work. Descriptions are written generically
// pending real write-ups for each engagement — swap in specifics as available.
export const featuredProjects = [
  {
    id: "crib",
    title: "CRIB",
    tagline: "Payments & subscription platform",
    desc: "Recurring billing and payments, built on a resilient microservices core with CyberSource for card processing.",
    tech: ["Java", "Spring Boot", "PostgreSQL", "CyberSource", "Kubernetes"],
    highlights: [
      "Recurring billing & subscription lifecycle",
      "PCI-conscious CyberSource integration",
    ],
  },
  {
    id: "enic",
    title: "ENIC",
    tagline: "Biometric national ID verification",
    desc: "Matches biometric data against national ID records to authenticate citizens for secure digital services.",
    tech: ["Java", "Spring Boot", "Biometric SDKs", "PostgreSQL", "Keycloak"],
    highlights: [
      "1:1 / 1:N biometric matching workflows",
      "Keycloak-backed identity federation",
    ],
  },
  {
    id: "auth-suite",
    title: "Auth Suite",
    tagline: "Keycloak & OAuth2/PKCE solutions",
    desc: "Centralized auth on Keycloak, with OAuth2 Authorization Code + PKCE across web and mobile clients.",
    tech: ["Keycloak", "OAuth2", "PKCE", "Spring Security", "Flutter"],
    highlights: [
      "OAuth2/PKCE for web + Flutter clients",
      "Role & permission-based API gateways",
    ],
  },
  {
    id: "webflux-services",
    title: "Reactive Services",
    tagline: "Spring WebFlux implementations",
    desc: "Non-blocking backend services handling high-throughput, low-latency workloads across event-driven microservices.",
    tech: ["Spring WebFlux", "Java", "PostgreSQL (R2DBC)", "Kubernetes"],
    highlights: [
      "Reactive, non-blocking API pipelines",
      "Backpressure-aware streaming endpoints",
    ],
  },
];

// Real shipped projects from earlier engagements.
export const otherProjects = [
  {
    id: 1,
    title: "QMS",
    desc: "Web-based queue management system streamlining citizen services at the Department for Registration of Persons in Sri Lanka.",
    role: "Full Stack Developer",
    tech: "React, Node, Express, MySQL",
    img: Qms,
  },
  {
    id: 2,
    title: "Cleaner Connect",
    desc: "Platform connecting cleaners, customers, and service admins for efficient cleaning service management.",
    role: "Full Stack Developer",
    tech: "React, Node, Express, MySQL",
    img: Cleaner,
  },
  {
    id: 3,
    title: "MedPeeps",
    desc: "Worldwide medical student app letting administrators share study materials and collaborate on academic resources.",
    role: "Mobile Developer",
    tech: "Flutter, Firebase",
    img: Medpeeps,
  },
  {
    id: 4,
    title: "Learny",
    desc: "Interactive distance-education platform narrowing the gap between teachers and students.",
    role: "Full Stack Developer",
    tech: "React, Node, PostgreSQL, Express, AWS S3",
    img: Learny,
  },
  {
    id: 5,
    title: "JobMart",
    desc: "Commercial job board for posting and discovering vacancies across organizations.",
    role: "Full Stack Developer",
    tech: "React, Spring Boot, MySQL",
    img: Jobmart,
  },
  {
    id: 6,
    title: "NIROUSDT",
    desc: "Customer portal for activating trading plans, tracking referrals, and support in Forex trading.",
    role: "Full Stack Developer",
    tech: "HTML, CSS, MySQL, PHP",
    img: Niro,
  },
];
