import "./app.scss";
import Cursor from "./components/cursor/Cursor";
import Navbar from "./components/navbar/Navbar";
import ScrollProgress from "./components/common/ScrollProgress";
import Hero from "./components/hero/Hero";
import About from "./components/about/About";
import Skills from "./components/skills/Skills";
import Projects from "./components/projects/Projects";
import MoreProjects from "./components/projects/MoreProjects";
import Experience from "./components/experience/Experience";
import Contact from "./components/contact/Contact";
import Footer from "./components/footer/Footer";

const App = () => {
  return (
    <div>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Cursor />
      <ScrollProgress />
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <MoreProjects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
