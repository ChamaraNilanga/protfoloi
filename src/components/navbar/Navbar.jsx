import Sidebar from "../sidebar/Sidebar";
import "./navbar.scss";
import { motion } from "framer-motion";
import Github from "../../images/githubr.png";
import Linkedin from "../../images/linkedinr.png";
import Facebook from "../../images/fbr.png";

const Navbar = () => {
  return (
    <div className="navbar">
      {/* Sidebar */}
      <Sidebar/>
      <div className="wrapper">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
        </motion.span>
        <div className="social">
          <a href="http://www.linkedin.com/in/chamarank">
            <img src={Linkedin} alt="Linkedin" />
          </a>
          <a href="https://github.com/ChamaraNilanga">
            <img src={Github} alt="Github" />
          </a>
          <a href="https://www.facebook.com/chamara.nilanga.9400?mibextid=LQQJ4d">
            <img src={Facebook} style={{width:"30px"}} alt="Facebook" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
