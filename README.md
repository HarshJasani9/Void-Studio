# VOID Studio — Creative Development & Digital Design

VOID Studio is a high-fidelity, high-contrast brutalist agency portfolio website built to showcase premium digital design and creative web development. Powered by modern, lightweight technologies and the industry-standard **GreenSock Animation Platform (GSAP)**, the website features immersive scroll-driven behaviors, smooth typography transitions, and a solid responsive baseline.

---

## 🎨 Visual Identity & Design Aesthetics

VOID Studio follows a modern **brutalist dark-mode theme**:
* **Palette:** Ultra-dark background (`#0a0a0a`), balanced bone white text (`#ededed`), and a vibrant neon-lime accent color (`#c8ff00`).
* **Typography:** Bold display headers using **Outfit** paired with crisp body styling in **Inter**.
* **Interactions:** Subtle vertical glow scanning scanlines, custom mouse-following ring cursors, and responsive magnetic link states.

---

## ⚡ Key Features & Creative Tech

### 1. Multi-Phase Resource-Synced Preloader
Unlike standard timed preloaders, VOID Studio's preloader syncs with the browser load events:
* Ticks from `0%` to `90%` during initial DOM parsing.
* Holds at `90%` if assets (heavy images, fonts, styles) are still loading.
* Fast-tracks to `100%` the instant the browser fires `window.onload`, followed by a staggered, vertical dual-panel curtain wipe.
* Automatically bypassed if the client prefers reduced motion.

### 2. Full-Screen Details View (GSAP FLIP Transitions)
Project cards open into a full-bleed details modal overlay:
* Uses the **GSAP Flip Plugin** to animate preview layouts seamlessly across different parent coordinates.
* Features a custom exit-curtain layer that stops Lenis scrolling during modal viewing and resumes it on close.

### 3. Infinite Marquee Loops
* Uses dual-staged ticker timelines that slide infinitely on the horizontal axis with transform properties.

### 4. Asymmetric Culture Grid
* Multi-column layout presenting grayscale-to-color transitions and scale reveals linked directly to viewport scroll coordinates.

### 5. Performance & Accessibility First
* **Compositor-Only Transitions:** Layout-triggering transitions (like `width`) are replaced with hardware-accelerated GPU values (such as `transform: scaleX`).
* **Prefers-Reduced-Motion:** Respects operating system motion settings. When enabled, preloader countdowns, smooth scrolling, cursor follows, and letter splitting are immediately bypassed for instant layouts.
* **Mobile Hover Guard:** All hover animations (line drawing, card scale increases, saturation shifts) are wrapped inside `@media (hover: hover)` rules to prevent sticky touch focus issues on mobile devices.
* **Lazy Loading:** All below-the-fold media elements are configured with `loading="lazy"` and `decoding="async"`.

---

## 🛠️ Tech Stack

* **Bundler:** Vite
* **Core:** HTML5, CSS3 (Vanilla Variable Tokens)
* **Animation Library:** GSAP (ScrollTrigger, Flip)
* **Text Processing:** SplitType
* **Smooth Scrolling:** Lenis

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/HarshJasani9/Void-Studio.git
   cd Void-Studio
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the development server on `http://localhost:3000`:
```bash
npm run dev
```

### Production Build
To compile and optimize the assets into the `dist/` directory:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment Guidelines

The project builds to a fully static bundle inside the `dist/` directory, allowing it to be hosted on any static platform.

### A. Deploying to Vercel (Recommended)
Vercel automatically detects Vite configurations and requires zero setup:
1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and import the repository.
3. Keep default settings:
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Click **Deploy**.

### B. Deploying to Netlify
1. Sign in to [Netlify](https://netlify.com).
2. Select **Import from Git** and choose the repository.
3. Configure settings:
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
4. Click **Deploy Site**.

### C. Deploying to GitHub Pages (Automated Workflow)
To deploy automatically on every push to `main` using GitHub Actions:
1. Create a workflow file at `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Set up Node
           uses: actions/configure-pages@v4
           with:
             static_site_generator: vite

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

         - name: Deploy
           id: deployment
           uses: actions/deploy-pages@v4
   ```
2. *Note:* If your GitHub Pages site is a project repository (e.g. `https://<username>.github.io/Void-Studio/`), make sure to configure a `base` prefix path in `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/Void-Studio/', // Match your repository name
     // ... rest of config
   });
   ```
