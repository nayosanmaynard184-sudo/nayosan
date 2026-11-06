# Maynard K. Nay-osan — Medieval Gothic Portfolio Website

A sophisticated personal portfolio rebuild for **Maynard K. Nay-osan**, aspiring software developer and first-year Computer Science student at the **University of the Cordilleras (Baguio City, Philippines)**.

Featuring an **Ancient Gothic Library / Medieval Castle Study** interior aesthetic, a **fixed-screen desktop layout (100dvh)** with zero vertical page scrolling, and an interactive **Canvas 2D organic smoke cursor trail**.

---

## 🏰 Major Architectural Updates

1. **Interactive Smoke Cursor Trail Animation**:
   - Continuous organic smoke trail that emerges directly from the mouse pointer and tracks cursor movement.
   - Interpolates emission (`emitBetween`) so even rapid mouse flicks create an unbroken, continuous ribbon of swirling smoke.
   - Dual-theme color grading:
     - **Dark Mode**: Soft warm cream, ivory, warm gray, and subtle antique gold tones that blend naturally into the dark stone backdrop.
     - **Light Mode**: Soft translucent charcoal/sepia tones.
   - Organic multi-lobed puff sprites, sinusoidal micro-turbulence, thermal upward buoyancy, and natural dispersion.
   - Canvas has `pointer-events: none` and does not obstruct clicks, buttons, or text.
2. **Fixed-Screen Desktop Layout (100dvh)**:
   - Fits entirely within the visible browser viewport on desktop.
   - Zero vertical page scrolling.
   - Navigation bar (fixed height: 68px) and footer pager (fixed height: 44px) stay visible at all times.
   - Section switching replaces content in-place with smooth transitions without moving the page.
   - Intelligent responsive layout for mobile and tablet devices.
3. **Immediate Visibility of Essential Information**:
   - **Full Name**: Maynard K. Nay-osan
   - **Title**: Aspiring Software Developer
   - **Academic Status**: First-Year Computer Science Student at the University of the Cordilleras (Baguio City)
   - **Hometown**: Sadanga, Mountain Province, Philippines
   - **Core Languages**: Java and Python
   - **Direct Actions**: Explore About, GitHub Profile, and Contact Me
4. **All 5 Navigation Categories Implemented**:
   - **01 / Home**: Immediate identity, framed portrait with Gothic astrolabe, summary cards, and contact links.
   - **02 / About**: Biography, personal narrative, creative pursuits (drawing, chess, manhwa, anime), and learning goals.
   - **03 / Education**: Academic timeline (University of the Cordilleras, Sadanga National Tech-Voc High School, Sadanga Central School).
   - **04 / Skills**: Clearly distinguished studied languages (Java, Python), fundamentals, developer tools (Git, GitHub), and active learning areas.
   - **05 / Projects**: Curated project cards (Coursework Algorithms Lab, Student Workflow Utility Tool, and this Medieval Gothic Portfolio).
5. **Keyboard & Pager Navigation**:
   - Navigate sections using **Left (`←`) and Right (`→`) Arrow Keys**.
   - Footer pager (`01 / 05`) with interactive "Continue →" stepper.

---

## 📁 Repository Structure

```
├── index.html                   # Unified 5-section fixed-screen portfolio
├── about.html                   # Redirect helper to index.html#about
├── css/
│   └── style.css                # Medieval Gothic stylesheet (100dvh layout, dark/light variables)
├── js/
│   ├── smoke.js                 # Interactive Canvas 2D smoke cursor trail
│   └── main.js                  # Section router, keyboard navigation, theme switcher, and dust particles
├── assets/
│   ├── medieval-interior-dark.webp    # Dark Gothic library interior background
│   ├── medieval-interior-light.webp   # Sunlit Gothic scriptorium background
│   ├── medieval-interior-dark.jpg     # High-res JPG fallback
│   ├── medieval-interior-light.jpg    # High-res JPG fallback
│   ├── portrait.jpg                   # Maynard K. Nay-osan's authentic portrait
│   └── maynard-portfolio-medieval.zip # Complete downloadable ZIP package
└── README.md                    # Documentation & GitHub Pages deployment instructions
```

---

## 🚀 How to Update Your GitHub Repository (`sankura-san/sanraku-san`)

1. **Download the ZIP Package**:
   Download `assets/maynard-portfolio-medieval.zip` or click the download button on the Projects section.
2. **Replace Existing Files**:
   - Replace `index.html`
   - Replace `css/style.css`
   - Replace `js/smoke.js`
   - Replace `js/main.js`
   - Add/update `assets/` (keep `assets/portrait.jpg`)
3. **Commit & Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update portfolio: 100dvh fixed-screen layout and interactive smoke cursor trail"
   git push origin main
   ```
GitHub Pages will automatically serve the updated portfolio.
