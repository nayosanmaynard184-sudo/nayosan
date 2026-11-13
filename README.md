# Maynard Nay-osan — Medieval Gothic Portfolio Website

Personal portfolio for **Maynard Nay-osan**, aspiring software developer and first-year BS Computer Science student at the **University of the Cordilleras (Baguio City, Philippines)**.

Built around an **Ancient Gothic Library / Sunlit Scriptorium** dual-theme aesthetic with a **fixed-screen desktop layout (`100dvh`)**, an interactive **Canvas 2D smoke cursor trail**, and **strictly three main pages**.

---

## Three-Page Structure

1. **01 — Homepage (`#home`)**:
   - Features Maynard's updated headshot portrait (`assets/profile-picture.png`) framed inside the animated celestial astrolabe.
   - Displays core identity, academic program (BS Computer Science · 1st Year, University of the Cordilleras), location (Sadanga, Mountain Province / Baguio City, PH), introductory summary, active learning focus (**Java** & **Python**), and quick actions.
2. **02 — Personal Info (`#personal-info`)**:
   - **1. Player Info (Left Column)**: Full Name, Gender, Birthday (`To be added` placeholder), Age (`18`), Location (`Sadanga, Mountain Province`), Birthplace (`Bontoc, Mountain Province`), Status (`Single`), University (`University of the Cordilleras`), Program (`BS Computer Science`), Year Level (`First Year`), and Class / Role (`Aspiring Software Developer`).
   - **2. More About Me**: Personal student bio covering BSCS coursework, Sadanga/Bontoc roots, Java & Python study, logical thinking, and creative hobbies (drawing & painting, chess, manhwa, anime).
   - **3. Skills & Technical Knowledge**: Five organized categories transferred into Personal Info — Programming Skills (`Java`, `Python`), Programming Fundamentals, Web Development (`HTML`, `CSS`, `JavaScript`), Development Tools (`Git`, `GitHub`, `VS Code`, `Terminal`), and Currently Developing.
   - **4. My Advancement**: Four milestone cards tracking First Steps, Programming Foundations, Coding Practice, and Portfolio Development.
3. **03 — Achievements (`#achievements`)**:
   - Dedicated showcase grid prepared with four placeholder frames (**Academic Achievements**, **Certificates**, **Activities & Events**, and **Academic Accomplishments**) marked `"Coming Soon"` with HTML comment instructions for adding future photographs, certificates, and supporting evidence.

---

## Navigation & Theme Controls

- **Top Navigation**: `01 — Homepage`, `02 — Personal Info`, `03 — Achievements` plus Dark/Light Gothic theme toggle.
- **Footer Controls**: `Previous` button (disabled on Page 01), numbered quick selectors (`01`, `02`, `03`), page counter (`01 / 03`), and `Continue` button (disabled on Page 03).
- **Keyboard Shortcuts**: Navigate between the three pages with Left (`←`) and Right (`→`) Arrow keys.

---

## Repository Structure

```
├── index.html                   # 3-page fixed-screen portfolio (Homepage, Personal Info, Achievements)
├── about.html                   # Redirect helper to index.html#personal-info
├── css/
│   └── style.css                # Dual-theme Medieval Gothic stylesheet (100dvh desktop + responsive mobile)
├── js/
│   ├── smoke.js                 # Interactive Canvas 2D smoke cursor trail
│   └── main.js                  # 3-page router, arrow/button navigation, section filters, theme & dust canvas
├── assets/
│   ├── profile-picture.png          # Updated formal portrait headshot
│   ├── medieval-interior-dark.webp  # Dark Gothic library interior background
│   ├── medieval-interior-light.webp # Sunlit Gothic scriptorium background
│   ├── medieval-interior-dark.jpg   # High-res JPG fallback
│   ├── medieval-interior-light.jpg  # High-res JPG fallback
│   └── maynard-portfolio-medieval.zip # Complete downloadable portfolio archive
└── README.md                    # Project overview and deployment instructions
```

---

## Updating Your GitHub Pages Repository

1. Download `assets/maynard-portfolio-medieval.zip` or copy the updated root files (`index.html`, `about.html`, `css/style.css`, `js/main.js`, `js/smoke.js`, `assets/`, and `README.md`).
2. When ready, replace the `Birthday` `"To be added"` placeholder in `index.html` under Player Info and insert real photograph/certificate images into the `#view-achievements` cards.
3. Commit and push to your GitHub Pages branch (`main`).
