# Chamara Karunarathna — Portfolio

A futuristic, 3D-interactive portfolio built with React, Three.js (via
[react-three-fiber](https://docs.pmnd.rs/react-three-fiber) + [drei](https://github.com/pmndrs/drei)),
and Framer Motion, on top of Vite.

Live at: https://chamaranilanga.github.io/protfoloi/

## Tech stack

- **React 18 + Vite** — app shell and dev tooling
- **Three.js / @react-three/fiber / @react-three/drei** — the animated 3D hero and contact scenes
- **Framer Motion** — scroll reveals, hover/tap micro-interactions, animated counters
- **Sass** — theming via CSS custom properties + a small mixin set
- **EmailJS** — the contact form send (no backend required)
- **react-icons** — skill/tech and UI icons

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint      # eslint
```

## Project structure

```
public/
  resume.pdf         # placeholder — replace with your real resume (see below)
  favicon.svg, site.webmanifest, robots.txt, sitemap.xml
src/
  app.scss           # theme variables, mixins (mobile/tablet/desktop/reduced-motion), utility classes
  App.jsx            # page composition
  data/              # content: skills.js, projects.js, experience.js, stats.js
  hooks/              # useActiveSection, useMediaQuery, usePrefersReducedMotion
  components/
    navbar/           # sticky glass nav, mobile menu, active-section highlighting
    hero/             # 3D intro + CTAs
    about/            # summary, tilt photo card, highlight grid
    stats/             # animated counters
    skills/           # categorized skill chips
    projects/         # featured projects (tilt cards) + "more projects" grid
    experience/       # interactive Experience/Education timeline
    contact/          # copy-to-clipboard contact info, resume download, EmailJS form
    three/            # HeroCanvas.jsx / ContactScene.jsx — the WebGL scenes
    common/           # ScrollProgress, TiltCard (shared 3D hover-tilt wrapper)
    cursor/           # subtle cursor glow (desktop only, respects reduced motion)
    footer/
```

## Customizing content

Almost everything you'd want to change lives in `src/data/`:

- **`skills.js`** — categories and the tech chips shown in the Skills section.
- **`projects.js`** — `featuredProjects` (CRIB, ENIC, Auth Suite, Reactive Services) and
  `otherProjects` (the smaller project grid with screenshots).
- **`experience.js`** — `experience` and `education` arrays that feed the timeline.
- **`stats.js`** — the four counters shown under About.

> **Note:** the four featured projects (CRIB, ENIC, Auth Suite, Reactive Services) currently
> use generic, stack-accurate placeholder descriptions. Swap in your real project specifics
> (dates, measurable outcomes, screenshots) in `src/data/projects.js` when you have them ready.

Contact details (email/phone/social links) are set directly in
`src/components/contact/Contact.jsx` and `src/components/navbar/Navbar.jsx`/`Footer.jsx`.

### Replacing the resume

`public/resume.pdf` is a minimal placeholder PDF so the download buttons work out of the box.
Replace that file with your actual resume, keeping the same filename (`resume.pdf`), and every
download link (Navbar, Hero, Contact) will automatically serve the new file.

### Contact form (EmailJS)

The form in `Contact.jsx` uses your existing EmailJS service/template/public key. To point it at
a different EmailJS account, update the three IDs passed to `emailjs.sendForm(...)`.

## Theming

Colors, glass-panel styling, and buttons are defined once as CSS custom properties and utility
classes in `src/app.scss` (`--bg-base`, `--accent-purple`, `--accent-orange`, `.glass-panel`,
`.btn-primary`, `.btn-outline`, `.gradient-text`, etc.). Change the values at the top of that file
to re-theme the whole site consistently.

## Accessibility & performance notes

- Respects `prefers-reduced-motion`: Framer Motion animations are gated globally via
  `MotionConfig` in `main.jsx`, and the Three.js scenes / cursor glow / stat counters check
  `usePrefersReducedMotion` directly to freeze rotation and skip count-up tweens.
- The 3D canvases are lazy-loaded (`React.lazy` + `Suspense`) so `three`/`@react-three/fiber`
  are split into their own chunk instead of bloating the initial bundle.
- A skip-to-content link, `:focus-visible` outlines, semantic landmarks (`header`/`nav`/`main`/
  `section`/`footer`), and descriptive `alt`/`aria-label` attributes are in place throughout.
- Custom cursor glow and mouse-based 3D tilt are automatically disabled on touch devices.
- A few of the pre-existing "More Projects" screenshots in `src/images/` (e.g. `cleaner.jpg`,
  `qms.jpg`) are large, unoptimized files carried over from the previous design. They're
  `loading="lazy"`, but for best performance re-export them as compressed JPG/WebP (~150–300 kB)
  before shipping.

## Deployment

This repo is already wired for GitHub Pages via `gh-pages`:

```bash
npm run deploy
```

This runs `predeploy` (`vite build`) and pushes `dist/` to the `gh-pages` branch. The Vite
`base` in `vite.config.js` is set to `/protfoloi/` to match the GitHub Pages project path — update
it if you deploy elsewhere (e.g. a custom domain or Vercel, where `base: '/'` is usually correct).
