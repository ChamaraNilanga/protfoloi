import { FiGithub, FiLinkedin } from "react-icons/fi";
import "./footer.scss";

const Footer = () => {
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Chamara Karunarathna. All rights reserved.</p>
      <div className="footer-social">
        <a href="https://github.com/ChamaraNilanga" target="_blank" rel="noreferrer" aria-label="GitHub">
          <FiGithub />
        </a>
        <a href="http://www.linkedin.com/in/chamarank" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <FiLinkedin />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
