import "./hero.scss";
import { motion } from "framer-motion";
import myPng from "../../images/my2.png";
import Scroll from "../../images/scroll.png";

const textVariants = {
  initial: {
    x: -500,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 1,
      staggerChildren: 0.1,
    },
  },
  scrollButton: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};
const sliderVariants = {
  initial: {
    x: 0,
  },
  animate: {
    x: "-220%",
    transition: {
      repeat: Infinity,
      repeatType:"mirror",
      duration: 20,
    },
  },
};

const Hero = () => {
  return (
    <div className="hero">
      <div className="wrapper">
        <motion.div
          className="textContainer"
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          <motion.h2 variants={textVariants}>CHAMARA KARUNARATHNA</motion.h2>
          <motion.h1 variants={textVariants}>
            Software Engineer
          </motion.h1>
          <motion.p variants={textVariants}>
              A quick learner who is self-motivated, hardworking, responsible, and friendly,
              with good problem-solving abilities and a willingness to take on new challenges
              in a fast-paced environment.
          </motion.p>
          <motion.img
            variants={textVariants}
            animate="scrollButton"
            src={Scroll}
            alt=""
          />
        </motion.div>
      </div>
      <motion.div
        className="slidingTextContainer"
        variants={sliderVariants}
        initial="initial"
        animate="animate"
      >
        Full Stack Web Developer
      </motion.div>
      <div className="imageContainer">
        <img src={myPng} alt="" />
      </div>
    </div>
  );
};

export default Hero;
