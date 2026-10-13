# Muhammad Asad — Data Engineer Portfolio

A responsive, single-page portfolio built with plain HTML, CSS and JavaScript modules. Three.js powers the isometric data-pipeline illustration; GSAP and ScrollTrigger add restrained scroll motion. All runtime libraries and fonts are self-hosted, and the site has no build step.

## Run locally

From the repository root, start Python's static file server:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. Use a local HTTP server rather than opening `index.html` directly because the page loads its resume data as JSON.

## Content

Edit [`data/resume.json`](./data/resume.json) to update the profile, skills, experience, projects, certifications, education and contact details. The page renders its resume sections from this file; keep its JSON valid.

The downloadable portfolio CV is copied from the PDF supplied in `data/` to [`assets/Muhammad_Asad_Data_Engineer.pdf`](./assets/Muhammad_Asad_Data_Engineer.pdf); download links point to that stable asset filename.

Project repository links were matched against the public repositories on [github.com/asadafridi567](https://github.com/asadafridi567). The NYC Taxi, Netflix and Spotify cards deep-link to their individual folders in the shared Azure Data Engineering Projects repository.

## Deployment

The intended project-site URL is <https://asadafridi567.github.io/Portfolio-Website/>. The `.github/workflows/pages.yml` workflow validates the resume JSON and deploys the repository root when changes reach `main`. In the GitHub repository, select **Settings → Pages → Build and deployment → GitHub Actions** as the Pages source and ensure HTTPS is enforced.

All site asset and navigation links use relative paths so the project also works beneath the GitHub Pages repository subpath.

## Open questions

- Confirm the Renewables First start date. The current role description now records the Central Data Repository in Microsoft Fabric and ETL/ELT work provided by the owner.
- Freelance and On-Page SEO descriptions and technology stacks are generic summaries; confirm or replace them with exact project details, employer and location if desired.
- Confirm whether the public project/profile account `asadafridi567` is the preferred contact-profile link; the uploaded CV lists `asadafridi`.
- Confirm certification issuer/exam-code details marked TODO in the JSON.
- Provide public GitHub repository links for projects, if available.
- Confirm the GitHub Pages repository name and whether a custom domain is wanted. The phone number is intentionally not published.

## Local assets

- Three.js `0.186.1`
- GSAP and ScrollTrigger `3.15.0`
- Hanken Grotesk and IBM Plex Mono WOFF2 files from Fontsource `5.3.0`
- Vendor notices and font OFL notices are included next to the vendored assets; GSAP `3.15.0` uses its standard no-charge license.
- Blog content is intentionally deferred to v2; see [`blog/README.md`](./blog/README.md).
