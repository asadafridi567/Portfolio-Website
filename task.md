# Task: Build Muhammad Asad's Data Engineer Portfolio (v1, single page)

You are building a personal portfolio website for **Muhammad Asad, Data Engineer** (currently at Renewables First). It is a static, single-page site deployed on **GitHub Pages**. Version 2 will add a Blog, so structure the project so a blog can be added without a rewrite.

Work through the phases in order. Tick each checkbox when done. Do not skip the acceptance criteria at the end of each phase.

---

## 0. Decisions already made (do not re-open)

- **Design direction:** "Option B, Pipeline". Light theme, cobalt accent, a 3D isometric data pipeline as the hero.
- **Stack:** plain HTML, CSS and JavaScript (ES modules). No build step required, no framework. Three.js for 3D. This keeps GitHub Pages deployment trivial.
- **Libraries (pin exact versions, vendor them into `/assets/vendor/` so there is no runtime CDN dependency):**
  - `three` (use a recent stable release, loaded as an ES module)
  - `gsap` + `ScrollTrigger` (for scroll-driven parallax and reveals)
  - Optional: `lenis` for smooth scrolling. Only add it if scrolling still feels native and works with keyboard, anchors and reduced motion.
- **Fonts:** Hanken Grotesk (500, 800) and IBM Plex Mono (500). Self-host the font files (woff2) in `/assets/fonts/`. Always give a real fallback stack.
- **Page type:** one page with these sections, in order: Hero, About, Skills, Experience, Projects, Certifications, Education, Contact, Footer.
- **Blog:** NOT in v1. Only leave a nav link labelled "Blog" that is visibly marked "Soon" and not clickable (see Phase 8).

### Design tokens

```css
:root {
  --bg: #F7F8FA;
  --surface: #FFFFFF;
  --ink: #0E1330;
  --muted: #4B516B;
  --line: #D5D9E8;
  --cobalt: #2F4BFF;
  --cobalt-dark: #2237C2;
  --cobalt-light: #7E8FFF;
  --bronze: #E3A878;
  --silver: #E6E9EE;
  --gold: #FFD166;
  --radius: 10px;
  --radius-pill: 999px;
}
```

Define a dark-mode variant too (`prefers-color-scheme: dark`), but the light theme is the default and the design reference. Also support a manual `data-theme` attribute on `:root`.

### Visual reference

The approved mockup shows:
- Top bar: name on the left; links About, Skills, Experience, Projects; a cobalt **Download CV** button on the right.
- Hero left: mono eyebrow "DATA ENGINEER · ISLAMABAD" in cobalt, large headline "Pipelines, models and tests for data you can trust.", one sentence of supporting text ("Azure Data Factory, Databricks, PySpark, dbt and Airflow, from ingestion to Power BI.").
- Hero right: an **isometric 3D data pipeline on a raised grid platform**. Five stages left-to-right along a glowing cobalt track: **Source** (database cylinder), **Bronze** (1 slab), **Silver** (2 slabs), **Gold** (3 slabs), **Power BI** (cobalt block with 3 rising bars). Small cobalt cubes float along the track as data packets. Each stage has a floating pill label and a soft floor shadow.
- Bottom of hero: four pills: Medallion Architecture, Delta Live Tables, Unity Catalog, dbt + Airflow.

---

## Phase 1. Repository and project setup

- [x] Create the repo structure:

```
/
├── index.html
├── task.md
├── README.md
├── .nojekyll
├── 404.html                  (simple, matches the theme, links home)
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── sections.css
├── js/
│   ├── main.js               (entry, imports everything)
│   ├── nav.js
│   ├── parallax.js
│   ├── hero-scene.js         (Three.js scene)
│   ├── reveal.js
│   ├── resume-tabs.js
│   └── theme.js
├── data/
│   └── resume.json           (single source of truth for content, see Phase 3)
├── assets/
│   ├── fonts/
│   ├── vendor/               (three, gsap, ScrollTrigger)
│   ├── img/                  (favicon, og-image, any project images)
│   └── Muhammad_Asad_Data_Engineer.pdf   (the resume, see Phase 7)
└── blog/                     (empty placeholder folder with a README for v2)
```

- [x] Add `.nojekyll` so GitHub Pages serves folders starting with `_` and doesn't process files with Jekyll.
- [x] Add `README.md`: what the site is, how to run locally (`python3 -m http.server`), how to deploy, how to edit content via `data/resume.json`.
- [x] Use **relative paths everywhere** (e.g. `./assets/...`), because a project site on GitHub Pages is served from a sub-path.
- [x] Add a `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.

**Acceptance:** `python3 -m http.server` serves a blank styled page with fonts loading from local files and no console errors.

---

## Phase 2. Base styles and layout

- [x] `tokens.css`: the design tokens above, light and dark.
- [x] `base.css`: modern reset, `box-sizing: border-box`, `body` background `var(--bg)`, font stack, `scroll-behavior: smooth` (disabled under `prefers-reduced-motion`), `scroll-padding-top` equal to the sticky header height.
- [x] `layout.css`: a centred container (`max-width: 1200px`, horizontal padding that scales), section spacing, CSS grid helpers. Use relative units, flexbox and grid. No horizontal page scroll at any width.
- [x] Respect device safe areas: header and any fixed element add `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` to padding.
- [x] Breakpoints to design for: 360, 768, 1024, 1280, 1536 px.
- [x] Sticky header: transparent at top, becomes a white blurred bar with a bottom border after scrolling ~24px. Includes brand, section links, **Download CV** button, theme toggle, and a mobile menu button.

**Acceptance:** header works at all breakpoints; mobile menu opens and closes, traps focus while open, closes on Escape and on link click.

---

## Phase 3. Content as data

All text content lives in `data/resume.json` and is rendered by JS into the sections. Also include a `<noscript>` fallback that shows the essential content (name, role, contact, CV link) so the page is not empty without JS.

- [x] Create `data/resume.json` with these top-level keys: `profile`, `skills`, `experience`, `projects`, `certifications`, `education`, `contact`.
- [x] Populate it from the resume below. **Do not invent facts, numbers, dates or links.** Anything missing gets a clearly marked placeholder like `"TODO: confirm"` and is listed in the README under "Open questions".

**Profile**
- Name: Muhammad Asad. Title: Data Engineer. Location: Islamabad, Pakistan.
- Summary: Data Engineer building cloud-native ETL/ELT pipelines with Azure Data Factory, Databricks and PySpark. Designs Medallion Architecture lakehouses, uses Delta Live Tables, and enforces data governance with Unity Catalog. Strong foundation in data modeling, SQL and end-to-end analytics solutions.

**Skills (group exactly like this)**
- Cloud & Data Platforms: Azure Data Factory, Azure Data Lake Storage Gen2, Azure Databricks, Azure SQL Database, Unity Catalog, AWS (fundamentals), Microsoft Fabric
- Big Data & Processing: PySpark, Apache Spark, Delta Lake, Delta Live Tables, Autoloader, Spark Structured Streaming
- ETL/ELT & Warehousing: ETL/ELT pipeline design, Data lakehouse and warehouse concepts, Data quality and testing, Query optimization
- Languages & Frameworks: Python, SQL, DAX, Django, JavaScript, React
- DevOps & Tools: Git, CI/CD, Docker, Logic Apps, Power BI, PostgreSQL, Apache Airflow, dbt

**Experience (newest first)**
1. Data Engineer, **Renewables First**, current. Start date: `TODO: confirm`. Responsibilities: `TODO: ask the owner for 2-3 bullet points`.
2. Python Developer (Freelance), 2024 to 2026. Built Python solutions for clients and for projects from friends. Bullets: `TODO: ask the owner`.
3. Python Intern, **ZIGRON**, Islamabad, July 2024 to Sep 2024.
   - Built and maintained Python-based ETL scripts for backend data handling, automation and internal tooling.
   - Developed and optimized internal data tools, improving pipeline efficiency, code maintainability and reliability.
   - Assisted in debugging, testing and deploying Python-based services using Git best practices.
4. On-Page SEO Specialist, 2022 to 2024. Bullets: `TODO: ask the owner`.

**Projects (each has: title, stack tags, 2 to 3 bullets, optional GitHub link)**
1. **NYC Taxi End-to-End Data Engineering**: ADF, Databricks, PySpark, Delta Lake, Power BI
   - Cloud ETL/ELT pipeline orchestrated with Azure Data Factory, ADLS Gen2 as the data lake, Medallion Architecture (Bronze, Silver, Gold).
   - PySpark on Azure Databricks with Delta Lake for ACID transactions and time travel.
   - Databricks-to-Data Lake access secured with an Azure Service Principal; data quality validated across layers; curated data visualized in Power BI.
2. **Netflix Azure End-to-End Data Engineering**: ADF, ADLS Gen2, Databricks, DLT, Unity Catalog, Power BI
   - Parameterized ADF pipelines ingesting from HTTP/REST APIs into a Medallion lakehouse.
   - Databricks Autoloader for incremental ingestion; PySpark for schema casting and window-function transformations.
   - Gold-layer pipelines with Delta Live Tables and data quality Expectations; governance through Unity Catalog.
3. **Spotify Azure End-to-End Data Engineering**: ADF, Databricks, DLT, Unity Catalog, Logic Apps, CI/CD
   - Dynamic ADF pipelines with backfilling, moving data from Azure SQL Database to an ADLS Gen2 lakehouse.
   - Spark Structured Streaming with Autoloader and SCD Type 2 logic via Delta Live Tables.
   - Jinja-templated, metadata-driven SQL views; Logic Apps failure alerts; Databricks Asset Bundles for CI/CD.
4. **Walmart Data Engineering Pipeline**: PostgreSQL, dbt, Apache Airflow, Docker, Databricks SDK
   - ELT pipeline structured as Bronze/Silver/Gold using PostgreSQL, dbt and Airflow.
   - dbt models producing Silver business entities (customer, order, product, employee) and Gold fact and dimension tables.
   - Containerized Airflow DAGs that use the Databricks SDK to trigger a Databricks ingestion job.
5. **Flight Delay Prediction Pipeline**: Databricks, dbt, Airflow, Docker, FastAPI, Power BI
   - Medallion pipeline on BTS On-Time Performance data (10.5M+ flight records) with dbt-databricks and a self-determining incremental ingestion notebook that loads only missing months.
   - Gold star schema with SCD2 snapshots for airport and carrier dimensions; Dockerized Airflow DAGs with dbt snapshot/run/test and failure alerting.
   - Two consumers of the Gold layer: a FastAPI + LLM text-to-SQL agent with a Streamlit UI, and a Power BI DirectQuery dashboard.
6. **Merit Order ETL Pipeline**: Databricks, PySpark, Delta Lake, Unity Catalog, ai_parse_document
   - Bronze/Silver/Gold pipeline tracking plant-wise fuel costs on Pakistan's power grid from NTDC Merit Order reports; PDF links extracted from the source site's compiled Angular JS bundle.
   - Databricks `ai_parse_document` OCR for scanned report tables into a structured 8-column schema, then PySpark and Delta Lake validation and cost calculations in Silver.
   - Chained Databricks Job (Ingestion, Transformation, Insights) with per-fuel-type IQR outlier detection in Gold, separating market-wide cost shocks from plant-specific anomalies.

**Certifications**
- Microsoft Certified: Fabric Analytics Engineer Associate (DP-600)
- Microsoft Certified: Fabric Data Engineer Associate (DP-700)
- IBM Data Engineer Professional Certificate
- Microsoft Azure SQL Certificate
- Google IT Automation with Python

**Education**
- Bachelor in Software Engineering, HITEC University, Taxila, Pakistan (Sep 2021 to July 2025)
- Intermediate in Pre-Engineering, HITEC College, Taxila, Pakistan (2017 to 2019)

**Contact**
- Email: muasad007@gmail.com
- LinkedIn: https://linkedin.com/in/muhammad-asad-de
- GitHub: https://github.com/asadafridi
- Phone: **do not publish it on the page** (spam risk). Keep it only inside the downloadable CV. Ask the owner if they want it shown.

**Acceptance:** JSON validates; every section renders from it; changing a string in the JSON changes the page with no other edits.

---

## Phase 4. Hero and the 3D pipeline scene (Three.js)

Build `js/hero-scene.js`. It must look like the approved mockup but rendered in real 3D.

- [x] Renderer: `WebGLRenderer({ antialias: true, alpha: true })`, transparent background so the page color shows, `setPixelRatio(Math.min(devicePixelRatio, 2))`, `outputColorSpace = SRGBColorSpace`.
- [x] Camera: **orthographic**, isometric angle (rotate about 45 degrees around Y, look down about 35 degrees). Slightly adjustable by pointer (see below).
- [x] Lighting: one soft directional key light, one ambient/hemisphere fill, soft contact shadows under each stage (use a blurred shadow plane or `ShadowMaterial`).
- [x] Floor: a raised square platform with a visible grid on top and a thickness edge (two-tone sides, like the mockup).
- [x] Track: a glowing cobalt line running diagonally across the platform with a dashed white center line.
- [x] Five stages evenly spaced along the track, built from simple geometry and flat/lambert-style materials:
  1. **Source**: cylinder (database) with two horizontal highlight rings.
  2. **Bronze**: one wide slab (`--bronze`).
  3. **Silver**: two stacked slabs with a small gap (`--silver`).
  4. **Gold**: three stacked slabs with small gaps (`--gold`).
  5. **Power BI**: cobalt block with three rising white/light-blue bars on top.
- [x] Floating labels above each stage (HTML overlay elements positioned from the projected 3D position, not canvas text, so they stay crisp and accessible). Pill style: white, 1px `--line` border, mono 12px.
- [x] **Data packets:** small cobalt cubes that travel along the track from Source to Power BI on a loop, floating slightly above it, each with a small shadow. Gently bob up and down.
- [x] **Entrance animation:** stages rise from the floor one after another (stagger about 120 ms), then packets start flowing.
- [x] **Interactions:**
  - Pointer move tilts the whole scene a few degrees (see parallax in Phase 5).
  - Hovering a stage lifts it slightly and highlights its label.
  - Clicking a stage scrolls to the related section: Source -> About, Bronze/Silver/Gold -> Projects, Power BI -> Projects. Stages must also be reachable by keyboard through their HTML labels (buttons).
- [x] **Performance and fallbacks:**
  - Render only while the hero is visible (`IntersectionObserver`) and the tab is visible (`document.hidden`).
  - Cap at 60 fps, dispose geometries/materials on teardown, handle `resize` with `ResizeObserver`.
  - If WebGL is unavailable or `prefers-reduced-motion: reduce` is set, show a **static SVG/PNG of the scene** (`assets/img/hero-pipeline.svg`) instead of the animated canvas. Create that fallback image.
  - Target: hero scene under 600 KB of JS (excluding Three.js), steady 60 fps on a mid-range laptop and 30+ fps on a mid-range phone. Lower the pixel ratio on small screens.
- [x] Accessibility: canvas has `role="img"` and a descriptive `aria-label` ("Isometric data pipeline: Source, Bronze, Silver, Gold, Power BI"). Do not trap keyboard focus.

**Acceptance:** hero looks like the mockup, animates smoothly, labels follow stages on resize, fallback appears with reduced motion or WebGL disabled.

---

## Phase 5. Parallax (required)

Build `js/parallax.js`. Parallax must feel subtle and premium, never nauseating, and must be fully disabled for `prefers-reduced-motion: reduce`.

- [x] **Scroll parallax (layered):** use GSAP ScrollTrigger with `scrub`. Move elements with `transform: translate3d` only (never `top/left`) and `will-change: transform` only while active.
  - Hero: the 3D scene drifts upward more slowly than the page (about 0.85x speed); headline and text drift at about 1.0x; the background decor (large faint grid lines or soft shapes) drifts at about 0.6x.
  - Add 3 to 5 large, low-contrast decorative layers behind sections (soft isometric cube outlines, dotted grids, thin lines) with different depth values, via a `data-depth` attribute (e.g. `data-depth="0.2"`, `0.5`, `-0.3`). The script reads `data-depth` and applies the speed.
  - Section headings and cards: gentle upward reveal with a small translate (20 to 40 px) and fade, staggered inside a section.
- [x] **Mouse parallax (desktop only, pointer: fine):** the hero 3D scene tilts and the floating labels shift by a different amount than the scene to create depth. Use `lerp` smoothing (about 0.08) inside `requestAnimationFrame`, never jump.
- [x] **Device tilt on mobile:** do NOT use gyroscope/device orientation in v1. Mobile gets scroll parallax only, with reduced intensity.
- [x] **Projects section:** project cards have a light 3D hover tilt (max 6 degrees, `perspective` on the parent) on desktop only.
- [x] Respect `prefers-reduced-motion`: no parallax, no scrubbed animation, no tilt; content simply appears.
- [x] No layout shift, no horizontal scrollbar caused by transformed elements (`overflow: clip` on the wrapping sections where needed).
- [x] Provide config at the top of `parallax.js` (`INTENSITY`, `MOBILE_FACTOR`, `MOUSE_STRENGTH`) so intensity can be tuned in one place.

**Acceptance:** layers visibly move at different speeds while scrolling; scrolling is smooth with no jank (Chrome DevTools Performance shows no long frames from parallax); reduced-motion users see a static page.

---

## Phase 6. Resume sections (view different parts of the resume)

The user explicitly wants recruiters to **view different parts of the resume** on the page.

- [x] **About:** short summary, location, a "currently at Renewables First" badge, key numbers pulled from data (6 end-to-end projects, 10.5M+ flight records modeled, 2 Microsoft Fabric certifications). Do not add numbers that are not in the resume.
- [x] **Skills:** the five groups as cards. Each skill is a chip. Optional filter row to highlight chips by group. Add a subtle hover lift.
- [x] **Experience:** a vertical timeline, newest first, with the current role marked. Mono date labels. Collapsible bullets on mobile.
- [x] **Projects:** a responsive card grid (1 / 2 / 3 columns). Each card: title, stack tags, 2 to 3 bullets, "View on GitHub" link if present. Clicking a card opens an accessible **dialog** with the full details. A tag filter (All, Azure, Databricks, dbt/Airflow, Streaming) filters the cards without a page reload.
- [x] **Certifications:** badge-style cards with issuer and exam code.
- [x] **Education:** two simple entries.
- [x] **Resume tabs (quick view):** inside a "Resume" block in the About or Experience area, add tabs (Summary, Skills, Experience, Projects, Certifications, Education) that swap the content shown. Tabs follow the WAI-ARIA tabs pattern (`role="tablist"`, arrow-key navigation, `aria-selected`). Deep-link the active tab with the URL hash (e.g. `#resume=experience`).
- [x] **Active section highlight:** the header nav highlights the section in view (`IntersectionObserver`).

**Acceptance:** every part of the resume can be reached from the page in one or two clicks; tabs and filters work with keyboard and screen readers.

---

## Phase 7. Download CV

- [ ] Add the resume PDF at `assets/Muhammad_Asad_Data_Engineer.pdf`. The owner will supply the final file. Until then, use the uploaded `Muhammad_Asad_-_Data_Engineering-1.pdf` copied and renamed. Keep the filename stable so the link never breaks.
- [x] Download buttons (use a real `<a href="./assets/Muhammad_Asad_Data_Engineer.pdf" download="Muhammad_Asad_Data_Engineer.pdf">`, never a JS-only click handler):
  - header (primary cobalt button)
  - hero (secondary position under the supporting text)
  - contact section
  - mobile menu
- [x] Button shows a download icon (inline SVG, `aria-hidden`) and the text "Download CV". Add file info in a `title` or small caption: "PDF, about X KB" (compute the size at build time or hard-code after the file is final).
- [x] Track nothing by default. Do not add analytics unless the owner asks (see Phase 10, optional).

**Acceptance:** clicking any Download CV button downloads the PDF in one click on desktop and mobile; works from the GitHub Pages sub-path.

---

## Phase 8. Contact, footer, Blog placeholder

- [x] **Contact:** email (with a `mailto:` link and a "Copy email" button that shows a toast), LinkedIn, GitHub. No contact form in v1 (no backend). Optionally prepare a Formspree/Web3Forms integration behind a comment, but do not enable it.
- [x] **Footer:** name, small "Built with HTML, CSS, Three.js" line, back-to-top link, current year (rendered by JS with a static fallback).
- [x] **Blog (v1 placeholder):** nav item "Blog" with a small "Soon" pill, `aria-disabled="true"`, not focus-trapped, no navigation. Create `/blog/README.md` describing the v2 plan: one post per solved data problem, written in Markdown, rendered to static HTML by a tiny build script, with tags, reading time and an RSS feed. Keep the header and footer markup in reusable partials or a documented structure so a blog page can reuse them.

**Acceptance:** all contact links work; the Blog item is clearly "coming soon" and does not 404.

---

## Phase 9. Quality: accessibility, performance, SEO

**Accessibility (target WCAG 2.2 AA)**
- [x] Semantic landmarks (`header`, `nav`, `main`, `section` with headings, `footer`), one `h1`, logical heading order.
- [x] A "Skip to content" link as the first focusable element.
- [x] Visible focus styles on every interactive element (2px cobalt outline with offset).
- [ ] Contrast: body text 4.5:1 or better, large text 3:1 or better, in light and dark themes. Check the cobalt-on-light-gray eyebrow text and muted text in particular.
- [x] Touch targets at least 44x44 px.
- [x] Real `<button>` and `<a>` elements only; no clickable `div`s.
- [x] Every icon-only button has an `aria-label`; decorative SVGs get `aria-hidden="true"`.
- [x] Dialogs and menus manage focus and close on Escape.

**Performance**
- [ ] Lighthouse (mobile, throttled) targets: Performance 90+, Accessibility 100, Best Practices 100, SEO 100.
- [x] LCP under 2.5 s: the hero text is the LCP element; do not block it on Three.js. Load Three.js asynchronously (`import()`) after first paint and fade the scene in.
- [x] Preload the two critical font files; use `font-display: swap`; subset fonts to Latin.
- [x] No layout shift (CLS under 0.05): reserve the hero scene's space with an `aspect-ratio` box.
- [x] Images in AVIF/WebP/SVG where possible, with `width` and `height` set; lazy-load below the fold.
- [x] Total JS (excluding Three.js) under 150 KB gzipped.

**SEO and sharing**
- [x] `<title>`: "Muhammad Asad | Data Engineer". Meta description (150 to 160 chars).
- [x] Open Graph and Twitter card tags with an `og-image.png` (1200x630, designed in the same style as the hero).
- [x] JSON-LD `Person` schema (name, jobTitle, url, sameAs: LinkedIn and GitHub). Do not include the phone.
- [x] `robots.txt`, `sitemap.xml`, `<link rel="canonical">`, and favicon set (SVG + 32px + apple-touch-icon 180px).
- [x] `<meta name="theme-color">` for light and dark.

---

## Phase 10. Deployment to GitHub Pages

- [ ] Create a public repo. Recommended name: `asadafridi.github.io` (user site, served at the root) so paths are simple. If using a project repo instead, confirm relative paths still work.
- [ ] Deploy with **GitHub Actions** (`.github/workflows/pages.yml`) using `actions/configure-pages`, `actions/upload-pages-artifact` and `actions/deploy-pages`, triggered on pushes to `main`. Add a step that fails the build if `data/resume.json` is invalid JSON.
- [ ] Settings: Pages source = "GitHub Actions". Enforce HTTPS.
- [ ] Add a short "Deployment" section to the README with the live URL and the steps above.
- [ ] Optional, only if the owner asks: custom domain (add `CNAME`), and privacy-friendly analytics such as Plausible or GoatCounter.

**Acceptance:** pushing to `main` publishes the site; the live URL loads with working fonts, 3D scene, resume download and all links.

---

## Phase 11. Final QA checklist

- [ ] Test in latest Chrome, Safari (iOS and macOS), Firefox and Edge.
- [ ] Test at 360, 768, 1024, 1280 and 1536 px, portrait and landscape on mobile.
- [ ] Test with the keyboard only, and with a screen reader (VoiceOver or NVDA) on the header, tabs, project dialog and download button.
- [ ] Test with `prefers-reduced-motion` on, and with JavaScript disabled (noscript fallback shows content and CV link).
- [ ] Test with WebGL disabled (fallback image shows).
- [ ] Run Lighthouse and fix anything below targets. Run an automated accessibility check (axe).
- [ ] Verify no console errors or 404s, and that every external link has `rel="noopener noreferrer"` and `target="_blank"` only where appropriate.
- [ ] Verify the PDF downloads and opens correctly.
- [ ] Confirm all `TODO: confirm` items are either resolved or listed in the README under "Open questions".

---

## Open questions to ask the owner before finishing

1. Start date and 2 to 3 responsibility bullets for **Renewables First**.
2. Short bullets for the **freelance** and **On-Page SEO** roles (or confirm they should be shown only as one-line entries).
3. Final CV PDF file (and whether to keep the current filename).
4. Should the phone number appear on the site? (Default: no.)
5. Confirm GitHub repo name and whether to use a custom domain.
6. Links to GitHub repos for each project, if public.

## Out of scope for v1

- Blog pages (v2).
- Contact form backend.
- Gyroscope/device-orientation effects.
- Any tracking or analytics (unless requested).
