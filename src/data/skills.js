import {
  SiSpringboot,
  SiReact,
  SiNextdotjs,
  SiFlutter,
  SiPostgresql,
  SiKubernetes,
  SiJsonwebtokens,
  SiDocker,
  SiTypescript,
  SiJavascript,
} from "react-icons/si";
import { TbFingerprint } from "react-icons/tb";
import { FaJava, FaLock, FaUserShield, FaServer, FaLaptopCode, FaCloud } from "react-icons/fa";

export const skillCategories = [
  {
    id: "backend",
    label: "Backend",
    icon: FaServer,
    color: "#9d6bff",
    skills: [
      { name: "Java", icon: FaJava },
      { name: "Spring Boot", icon: SiSpringboot },
      { name: "Spring WebFlux", icon: SiSpringboot },
      { name: "PostgreSQL", icon: SiPostgresql },
    ],
  },
  {
    id: "frontend",
    label: "Frontend & Mobile",
    icon: FaLaptopCode,
    color: "#ff9d2f",
    skills: [
      { name: "React", icon: SiReact },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "Flutter", icon: SiFlutter },
      { name: "TypeScript", icon: SiTypescript },
      { name: "JavaScript", icon: SiJavascript },
    ],
  },
  {
    id: "infra",
    label: "Infra & DevOps",
    icon: FaCloud,
    color: "#5eead4",
    skills: [
      { name: "Kubernetes", icon: SiKubernetes },
      { name: "Docker", icon: SiDocker },
    ],
  },
  {
    id: "security",
    label: "Identity & Security",
    icon: FaUserShield,
    color: "#f472b6",
    skills: [
      { name: "Keycloak", icon: FaUserShield },
      { name: "OAuth2 / PKCE", icon: SiJsonwebtokens },
      { name: "CyberSource", icon: FaLock },
      { name: "Biometric Systems", icon: TbFingerprint },
    ],
  },
];

export const skillsFlat = skillCategories.flatMap((c) => c.skills);
