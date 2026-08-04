import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiDownload, FiGithub, FiLinkedin, FiMenu, FiX } from "react-icons/fi";
import { useActiveSection } from "../../hooks/useActiveSection";
import "./navbar.scss";

const links = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const sectionIds = links.map((l) => l.id);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-inner">
        <a
          href="#home"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("home");
          }}
        >
          Chamara<span className="dot">.</span>
        </a>

        <nav className="links-desktop" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(link.id);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="actions">
          <a className="icon-link" href="https://github.com/ChamaraNilanga" target="_blank" rel="noreferrer" aria-label="GitHub profile">
            <FiGithub />
          </a>
          <a className="icon-link" href="http://www.linkedin.com/in/chamarank" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
            <FiLinkedin />
          </a>
          <a className="resume-btn" href={`${import.meta.env.BASE_URL}resume.pdf`} download>
            <FiDownload /> <span>Resume</span>
          </a>

          <button
            className="hamburger"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={active === link.id ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.id);
                }}
              >
                {link.label}
              </a>
            ))}
            <a className="resume-btn" href={`${import.meta.env.BASE_URL}resume.pdf`} download onClick={() => setOpen(false)}>
              <FiDownload /> Download Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
