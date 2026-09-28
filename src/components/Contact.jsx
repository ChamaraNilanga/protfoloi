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
    <div className="panel contact">
      <div className="lines">
        <div>
          <span>mail</span>
          <output>{contact.email}</output>
          <button className="btn ghost" type="button" onClick={copyEmail}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div>
          <span>phone</span>
          <output>{contact.phone}</output>
        </div>
        <div>
          <span>linkedin</span>
          <a href={contact.linkedin} target="_blank" rel="noreferrer">
            in/chamarank
          </a>
        </div>
        <div>
          <span>github</span>
          <a href={contact.github} target="_blank" rel="noreferrer">
            ChamaraNilanga
          </a>
        </div>
      </div>
      <form className="msg" ref={formRef} onSubmit={sendEmail}>
        <input id="name" name="name" type="text" required placeholder="Your name" aria-label="Your name" />
        <input id="email" name="email" type="email" required placeholder="Your email" aria-label="Your email" />
        <textarea id="message" name="message" rows={4} required placeholder="What are we building?" aria-label="Message" />
        <div className="lines">
          <div>
            <button className="btn">Send message</button>
            <small className="muted" role="status">{status}</small>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Contact;
