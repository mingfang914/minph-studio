# Minh Phuong — Digital Specimen Archive 🌌

Welcome to the **Digital Specimen Archive**, a highly creative, premium developer portfolio designed and engineered with high-fidelity graphics, physics simulations, and advanced motion design.

This repository hosts a production-grade portfolio that merges engineering logic with visual design instincts, showcasing interactive components, custom WebGL shaders, real-time physics, and custom typography.

---

## 🛠️ Tech Stack & Key Engines

- **Bundler & Core**: [Vite](https://vitejs.dev/) / HTML5 / Javascript (ES Modules)
- **3D & Shaders**: [Three.js](https://threejs.org/) (WebGL) for liquid simulations and shaders
- **Animation Suite**: [GSAP (GreenSock)](https://greensock.com/) & [ScrollTrigger](https://greensock.com/scrolltrigger/) for advanced scroll timelines, entry staggered animations, and kinetic skews
- **2D Physics Engine**: [Matter.js](https://brm.io/matter-js/) for the interactive specimen card physics lab
- **Typography & Styling**: Vanilla CSS (CSS Variables) with dynamic typography (`Outfit`, `DM Mono`, `Manrope`, `Playfair Display`)

---

## 🌟 Core Interactive Features & Architecture

The project is structured around a modular, class-based architecture located in `src/modules/`:

```
src/
├── main.js                   # Application entry-point, orchestrates all shaders and modules
├── style.css                 # Premium custom design system and layout styling
└── modules/
    ├── FluidHoverShader.js   # WebGL fluid trail + continuous segment ripples shader
    ├── NoiseShader.js        # Full-screen menu displacement shader
    ├── PhysicsLab.js         # Matter.js-based card dropping and cursor deflector simulation
    ├── Preloader.js          # Loader grid sequence and staggered reveal timelines
    ├── ScrollEngine.js       # GSAP scroll animations controller
    ├── ChapterTransition.js  # Chapter shutter transitions and meta indicators
    ├── I18n.js               # Dual-language translator (EN/VI) with text scrambling
    ├── Menu.js               # Radial drag/select menu overlay
    └── Work.js               # Showcase slider controller
```

### 1. WebGL Continuous Ripples & Fluid Trail (`FluidHoverShader`)
Located in `src/modules/FluidHoverShader.js`:
- **Continuous Capsule Impulse**: Uses line segment distance equations (`sdSegment` inside the GLSL simulation shader) to bridge pointer coordinates between frames, ensuring smooth, gap-free wave trails even during high-velocity cursor movements.
- **Fluid displacement & RGB Chromatic Dispersion**: Distorts the texture coordinate based on pointer-path tangent velocity fields and ripple heights, adding split-channel RGB chromatic aberration in the direction of the fluid drag.
- **Interactive Bioluminescent Glow**: Blends specular highlights (boosted to `2.2x` for deep dark environments) with emissive glows based on wave height (`ripple.x`) and slope magnitude (`length(rippleGradient)`).

### 2. Specimen Cards Physics Lab (`PhysicsLab`)
Located in `src/modules/PhysicsLab.js`:
- Creates a low-gravity physical world (restitution `0.55`, friction `0.08`) using **Matter.js**.
- Spawns physical specimen cards on cursor movement with custom horizontal and floating upward impulses.
- Employs an interactive **diagnostic deflector field** (a dashed sci-fi collision circle at the cursor position) to bounce cards dynamically out of the cursor's path.

### 3. Scroll Dynamics & Kinetic Skew (`ScrollEngine`)
- Utilizes custom smooth scrolling pipelines.
- Implements kinetic text skewing (line skews are mapped to the scroll speed and velocity vector, clamped from `-12` to `12` degrees and damped with ease-outs) on scroll triggers.

### 4. GLSL Noise Menu & Text Scrambler
- `#menu-canvas` runs a custom `NoiseShader` simulating procedural organic wave displacement.
- Language switching (English / Vietnamese) triggers a **digital glitch scramble transition**, replacing text characters procedurally with matrix-style glyphs (`▓▒░/<>[]{}01`) that decrypt back into translation strings frame-by-frame.

---

## 💻 Local Development Setup

To run this project on your local machine, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Dev Server (HMR Enabled)
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 3. Build Production Bundle
```bash
npm run build
```
Vite will compile and optimize all assets into the `dist/` directory, splitting vendor modules (`three`, `gsap`, `lenis`) into dedicated, cached chunks for optimal load times.

---

## 🎨 Visual Aesthetics & Layout Rules
- **Pure Dark-Mode Cohesion**: The entire archive uses a unified dark theme (`#070707` black) accented with electric blue (`#315cff`) and acid neon chanh (`#d9ff43`), while the Contact section features glowing red-orange embers (`#ff4d2e`) over a dark charcoal layout.
- **Harmonious Typography**: Structured layout utilizing monospace grids for sci-fi diagnostic layouts and high-end condensed sans-serif headings.
