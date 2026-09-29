import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Animate from "./Animate";
import { contact } from "../content";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Experience", href: "#experience" },
  { label: "Work", href: "#work", more: true },
];

export const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 256 256" fill="none" className="logo-mark" aria-hidden="true">
    {/* a C and a K sharing one stem */}
    <path
      d="M 128 0 L 128 256 C 57.3 256 0 198.7 0 128 C 0 57.3 57.3 0 128 0 Z M 148 0 L 256 0 L 176 128 L 256 256 L 148 256 Z"
      fill="white"
    />
  </svg>
);

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // tuck the nav away while scrolling down, bring it back on the way up
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      setHidden(y > lastY && y > 120);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <nav className={`nav${hidden && !isOpen ? " tucked" : ""}`}>
        <Animate delay={0} direction="down">
          <a className="brand" href="#home">
            <Logo />
            <span>Chamara</span>
          </a>
        </Animate>

        <Animate delay={100} direction="down" className="desk-only">
          <div className="nav-pill">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className="nav-link">
                {l.label}
                {l.more && <ChevronDown className="chev" />}
              </a>
            ))}
          </div>
        </Animate>

        <Animate delay={200} direction="down" className="desk-only">
          <div className="auth-pill">
            <a className="auth-ghost" href={contact.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="auth-solid" href="#contact">
              Let&apos;s talk
            </a>
          </div>
        </Animate>

        <Animate delay={100} direction="down" className="mob-only">
          <button className="burger" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" aria-expanded={isOpen}>
            <span className="burger-icons">
              <Menu className={`burger-icon ${isOpen ? "is-out" : "is-in"}`} />
              <X className={`burger-icon ${isOpen ? "is-in" : "is-out-x"}`} />
            </span>
          </button>
        </Animate>
      </nav>

      <div className={`mob-menu ${isOpen ? "open" : ""}`}>
        <div className="mob-backdrop" onClick={() => setIsOpen(false)} />
        <div className="mob-panel">
          <div className="mob-links">
            {LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className="mob-link"
                style={{ transitionDelay: isOpen ? `${100 + i * 50}ms` : "0ms" }}
                onClick={() => setIsOpen(false)}
              >
                {l.label}
                {l.more && <ChevronDown className="mob-chev" />}
              </a>
            ))}
          </div>
          <div className="mob-divider" />
          <div className="mob-ctas" style={{ transitionDelay: isOpen ? "350ms" : "0ms" }}>
            <a className="mob-solid" href="#contact" onClick={() => setIsOpen(false)}>
              Let&apos;s talk
            </a>
            <a className="mob-ghost" href={contact.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;
