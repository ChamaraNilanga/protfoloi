import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { contact } from "../content";

const Contact = () => {
  const formRef = useRef();
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard?.writeText(contact.email).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => {}
    );
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("Sending…");
    emailjs.sendForm("service_ez0lcjw", "template_c2s9c2s", formRef.current, "tLrIodQ4YCsFFs0lx").then(
      () => {
        setStatus("Message sent. I'll reply by email.");
        formRef.current.reset();
      },
      () => setStatus(`Couldn't send the message. Email me at ${contact.email} instead.`)
    );
  };

  return (
    <div className="glass contact-card reveal">
      <dl className="contact-lines">
        <div>
          <dt>Email</dt>
          <dd>
            <output>{contact.email}</output>
            <button type="button" className="chip-btn" onClick={copyEmail}>
              {copied ? "Copied" : "Copy"}
            </button>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <output>{contact.phone}</output>
          </dd>
        </div>
        <div>
          <dt>Social</dt>
          <dd>
            <a href={contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </dd>
        </div>
      </dl>
      <form className="contact-form" ref={formRef} onSubmit={sendEmail}>
        <input id="name" name="name" type="text" required placeholder="Your name" aria-label="Your name" />
        <input id="email" name="email" type="email" required placeholder="Your email" aria-label="Your email" />
        <textarea id="message" name="message" rows={4} required placeholder="What are we building?" aria-label="Message" />
        <div className="form-foot">
          <button className="cta-solid">Send message</button>
          <small role="status">{status}</small>
        </div>
      </form>
    </div>
  );
};

export default Contact;
