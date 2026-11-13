# Maynard Nay-osan — Medieval Gothic Portfolio Website

Personal portfolio for **Maynard Nay-osan**, aspiring software developer and first-year BS Computer Science student at the **University of the Cordilleras (Baguio City, Philippines)**.

Built around an **Ancient Gothic Library / Sunlit Scriptorium** dual-theme aesthetic with a **fixed-screen desktop layout (`100dvh`)**, an interactive **Canvas 2D smoke cursor trail**, and **strictly three main pages**.

---

## Three-Page Structure

1. **01 — Homepage (`#home`)**:
   - Features Maynard's updated headshot portrait (`assets/profile-picture.png`) framed inside the animated celestial astrolabe.
   - Displays core identity, academic program (BS Computer Science · 1st Year, University of the Cordilleras), location (Sadanga, Mountain Province / Baguio City, PH), introductory summary, active learning focus (**Java** & **Python**), and quick actions.
2. **02 — Personal Info (`#personal-info`)**:
   - **Player Info (Left Column)**: Full Name, Gender (`Male`), Birthday (`May 20, 2008`), Age (`18`), Location (`Sadanga, Mountain Province`), Status (`Single`), Phone (`09272977135`), University (`University of the Cordilleras`), Program (`BS Computer Science`), Year Level (`First Year`), and Class / Role (`Aspiring Software Developer`).
   - **Section Selector (3 Sections)**: Independently switch between **More About Me**, **Skills & Knowledge** (5 compact cards in a balanced 3-column, 2-row desktop grid), and **My Advancement** (4 milestones).
3. **03 — Achievements (`#achievements`)**:
   - Presents all five chronological educational milestones simultaneously on **one viewport page** on desktop (`1366 × 768`, `1440 × 900`, `1920 × 1080`) and stacks cleanly on tablet and mobile without hiding cards:
     1. **01 — Elementary Education**: Sadanga Central School (`Certificate of Elementary School Completion`, Department of Education, Philippines · April 3, 2020)
     2. **02 — Junior High School**: Sadanga National Technical-Vocational & Skills Training High School (`Certificate of Junior High School Completion`, Grades 7–10, Department of Education, Philippines · May 29, 2024)
     3. **03 — Senior High School**: Sadanga National Technical-Vocational & Skills Training High School (`Senior High School Diploma`, Academic Track — HUMSS, Grades 11–12, Department of Education, Philippines · March 31, 2026)
     4. **04 — National Certificate II (NC II)**: TESDA Carpentry Qualification (Issued March 10, 2026 · Valid Until March 9, 2031), with an interactive **View Qualification Details** modal listing all **21 Units of Competency** (9 Basic, 4 Common, 8 Core)
     5. **05 — University of the Cordilleras**: Bachelor of Science in Computer Science (`First Year | AY 2026–2027`, labeled **Currently Enrolled** with front Student ID supporting evidence)
   - Includes a clickable certificate & Student ID **Lightbox Viewer** preserving the authentic uploaded document photographs cleanly via `object-fit: contain`.

---

## Navigation & Theme Controls

- **Top Navigation**: `01 — Homepage`, `02 — Personal Info`, `03 — Achievements` plus Dark/Light Gothic theme toggle.
- **Footer Controls**: `Previous` button (disabled on Page 01), numbered quick selectors (`01`, `02`, `03`), page counter (`01 / 03`), and `Continue` button (disabled on Page 03).
- **Keyboard Shortcuts**: Navigate between the three pages with Left (`←`) and Right (`→`) Arrow keys (or inspect/close modals with `←`/`→`/`Escape`).

---

## Repository Structure

```
├── index.html                   # 3-page fixed-screen portfolio (Homepage, Personal Info, Achievements)
├── about.html                   # Redirect helper to index.html#personal-info
├── css/
│   └── style.css                # Dual-theme Medieval Gothic stylesheet (100dvh desktop + responsive mobile)
├── js/
│   ├── smoke.js                 # Interactive Canvas 2D smoke cursor trail
│   └── main.js                  # 3-page router, modals, section filters, theme & dust canvas
├── assets/
│   ├── profile-picture.png              # Formal portrait headshot
│   ├── achievements/                    # Authoritative original educational certificates, diploma, and UC Student ID (front)
│   │   ├── elementary-school.jpg
│   │   ├── junior-high-school.jpg
│   │   ├── senior-high-school.jpg
│   │   ├── tesda-nc2.jpg
│   │   └── uc-student-id-front.jpg
│   ├── medieval-interior-dark.webp      # Dark Gothic library interior background
│   ├── medieval-interior-light.webp     # Sunlit Gothic scriptorium background
│   ├── medieval-interior-dark.jpg       # High-res JPG fallback
│   ├── medieval-interior-light.jpg      # High-res JPG fallback
│   └── maynard-portfolio-medieval.zip   # Complete downloadable portfolio archive
└── README.md                            # Project overview and deployment instructions
```

---

## Updating Your GitHub Pages Repository

1. Download `assets/maynard-portfolio-medieval.zip` or copy the updated root files (`index.html`, `about.html`, `css/style.css`, `js/main.js`, `js/smoke.js`, `assets/`, and `README.md`).
2. Commit and push to your GitHub Pages branch (`main`).
