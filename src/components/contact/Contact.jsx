import { lazy, Suspense, useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { FiCheck, FiCopy, FiDownload, FiGithub, FiLinkedin, FiMail, FiPhone } from "react-icons/fi";
import "./contact.scss";

const ContactScene = lazy(() => import("../three/ContactScene"));

const CONTACT_EMAIL = "onsystechnologies@gmail.com";
const CONTACT_PHONE = "+94 70 27 45 462";

const CopyField = ({ icon: Icon, label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable; silently ignore.
    }
  };

  return (
    <button className="copy-field" onClick={handleCopy} aria-label={`Copy ${label}`}>
      <span className="copy-icon">
        <Icon />
      </span>
      <span className="copy-text">
        <span className="copy-label">{label}</span>
        <span className="copy-value">{value}</span>
      </span>
      <span className="copy-status">{copied ? <FiCheck /> : <FiCopy />}</span>
    </button>
  );
};

const Contact = () => {
  const formRef = useRef();
  const [status, setStatus] = useState("idle");

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("sending");

    emailjs
      .sendForm("service_ez0lcjw", "template_c2s9c2s", formRef.current, "tLrIodQ4YCsFFs0lx")
      .then(
        () => {
          setStatus("success");
          formRef.current.reset();
        },
        () => setStatus("error")
      );
  };

  return (
    <section id="contact" className="contact">
      <div className="canvas-bg contact-canvas" aria-hidden="true">
        <Suspense fallback={null}>
          <ContactScene />
        </Suspense>
      </div>

      <div className="section-container">
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="eyebrow">Contact</span>
          <h2>Let&apos;s work together</h2>
          <p>Have a project in mind, or just want to talk shop? Reach out below.</p>
        </motion.div>

        <div className="contact-grid">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <CopyField icon={FiMail} label="Email" value={CONTACT_EMAIL} />
            <CopyField icon={FiPhone} label="Phone" value={CONTACT_PHONE} />

            <div className="social-row">
              <a href="https://github.com/ChamaraNilanga" target="_blank" rel="noreferrer" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="http://www.linkedin.com/in/chamarank" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
            </div>

            <a className="btn btn-outline resume-download" href={`${import.meta.env.BASE_URL}resume.pdf`} download>
              <FiDownload /> Download Resume
            </a>
          </motion.div>

          <motion.form
            ref={formRef}
            className="contact-form glass-panel"
            onSubmit={sendEmail}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" required placeholder="Your name" name="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required placeholder="you@example.com" name="email" />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows={3} required placeholder="Tell me about your project" name="message" />
            </div>

            <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && <p className="form-status success">Message sent — thank you!</p>}
            {status === "error" && <p className="form-status error">Something went wrong. Please try again.</p>}
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
