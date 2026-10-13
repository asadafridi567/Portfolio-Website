import { initNavigation } from "./nav.js";
import { initTheme } from "./theme.js";
import { initResumeTabs } from "./resume-tabs.js";
import { initReveals } from "./reveal.js";
import { initParallax } from "./parallax.js";

const resumeResponse = await fetch("./data/resume.json");
if (!resumeResponse.ok) {
  throw new Error(`Unable to load resume content (${resumeResponse.status}).`);
}

const resume = await resumeResponse.json();
renderPortfolio(resume);
initNavigation();
initTheme();
initResumeTabs(resume);
initReveals();
initParallax();
initProjectInteractions(resume.projects);
initCopyEmail(resume.contact.email);
document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.requestAnimationFrame(() => {
    if (!("WebGLRenderingContext" in window)) {
      showStaticScene();
      return;
    }
    import("./hero-scene.js")
      .then(({ initHeroScene }) => initHeroScene())
      .catch(() => showStaticScene());
  });
}

function renderPortfolio(data) {
  document.title = `${data.profile.name} | ${data.profile.title}`;
  document.querySelectorAll("[data-profile-name]").forEach((element) => {
    element.textContent = data.profile.name;
  });
  document.querySelector("[data-hero-headline]").textContent = data.profile.heroHeadline;
  document.querySelector("[data-hero-supporting-text]").textContent = data.profile.heroSupportingText;
  const specialties = document.querySelector("[data-profile-specialties]");
  specialties.replaceChildren(...data.profile.specialties.map((item) => {
    const tag = document.createElement("span");
    tag.textContent = item;
    return tag;
  }));
  document.querySelector("[data-profile-eyebrow]").textContent =
    `${data.profile.title.toUpperCase()} · ${data.profile.location.split(",")[0].toUpperCase()}`;
  document.querySelector("[data-about-summary]").textContent = data.profile.summary;
  document.querySelector("[data-profile-location]").textContent = data.profile.location;
  document.querySelector("[data-current-company]").textContent =
    data.experience.find((entry) => entry.current)?.company ?? "Current role";
  const stats = document.querySelector("[data-profile-stats]");
  [
    { value: String(data.projects.length).padStart(2, "0"), label: "End-to-end projects" },
    { value: data.profile.flightRecordsModeled, label: "Flight records modeled" },
    {
      value: String(data.certifications.filter((item) => item.name.includes("Fabric")).length).padStart(2, "0"),
      label: "Microsoft Fabric certifications"
    }
  ].forEach(({ value, label }) => {
    const card = document.createElement("article");
    card.className = "stat-card";
    const stat = document.createElement("strong");
    stat.textContent = value;
    const description = document.createElement("span");
    description.textContent = label;
    card.append(stat, description);
    stats.append(card);
  });
  document.querySelector('[data-contact-email]').textContent = data.contact.email;
  document.querySelector('[data-contact-email]').href = `mailto:${data.contact.email}`;
  document.querySelector('[data-contact-link="linkedin"]').href = data.contact.linkedin;
  document.querySelector('[data-contact-link="github"]').href = data.contact.github;

  const skillsRoot = document.querySelector("[data-skills]");
  data.skills.forEach(({ group, items }) => {
    const card = document.createElement("article");
    card.className = "skill-card reveal";
    const title = document.createElement("h3");
    title.textContent = group;
    const chips = document.createElement("div");
    chips.className = "chip-row";
    items.forEach((item) => chips.append(makeChip(item)));
    card.append(title, chips);
    skillsRoot.append(card);
  });

  const experienceRoot = document.querySelector("[data-experience]");
  data.experience.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "timeline-item reveal";
    const date = document.createElement("div");
    date.className = "timeline-date";
    date.textContent = entry.current ? "CURRENT" : `${entry.start} — ${entry.end}`;
    const content = document.createElement("div");
    content.className = "timeline-content";
    const title = document.createElement("h3");
    title.textContent = entry.role;
    const company = document.createElement("p");
    company.className = "timeline-company";
    company.textContent = entry.current ? `${entry.company} · Current` : entry.company;
    company.hidden = !entry.company;
    const location = document.createElement("p");
    location.className = "timeline-location";
    location.textContent = entry.location;
    location.hidden = !entry.location;
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Role details";
    const bullets = document.createElement("ul");
    entry.bullets.forEach((bullet) => {
      const listItem = document.createElement("li");
      listItem.textContent = bullet;
      bullets.append(listItem);
    });
    details.append(summary, bullets);
    if (entry.techStack?.length) {
      const stackLabel = document.createElement("p");
      stackLabel.className = "timeline-stack-label";
      stackLabel.textContent = "Tech stack";
      const stack = document.createElement("div");
      stack.className = "chip-row timeline-stack";
      entry.techStack.forEach((item) => stack.append(makeChip(item)));
      details.append(stackLabel, stack);
    }
    content.append(title, company, location, details);
    item.append(date, content);
    experienceRoot.append(item);
  });

  const projectsRoot = document.querySelector("[data-projects]");
  data.projects.forEach((project, index) => {
    const card = document.createElement("article");
    card.className = "project-card reveal";
    card.dataset.filters = project.filters.join("|");
    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "project-card-open";
    detailsButton.dataset.projectIndex = String(index);
    detailsButton.setAttribute("aria-haspopup", "dialog");
    const number = document.createElement("span");
    number.className = "project-index";
    number.textContent = `PROJECT / ${String(index + 1).padStart(2, "0")}`;
    const title = document.createElement("h3");
    title.textContent = project.title;
    const description = document.createElement("p");
    description.textContent = project.bullets[0];
    const chips = document.createElement("span");
    chips.className = "chip-row";
    project.stack.slice(0, 4).forEach((item) => chips.append(makeChip(item, "stack-chip")));
    const openLabel = document.createElement("span");
    openLabel.className = "project-card-cta";
    openLabel.textContent = "View project details ↗";
    detailsButton.append(number, title, description, chips, openLabel);
    card.append(detailsButton);
    if (project.github) {
      const githubLink = document.createElement("a");
      githubLink.className = "project-card-github";
      githubLink.href = project.github;
      githubLink.target = "_blank";
      githubLink.rel = "noopener noreferrer";
      githubLink.textContent = "View on GitHub ↗";
      card.append(githubLink);
    }
    projectsRoot.append(card);
  });

  const certificationRoot = document.querySelector("[data-certifications]");
  data.certifications.forEach((certification) => {
    const card = document.createElement("article");
    card.className = "cert-card reveal";
    const icon = document.createElement("span");
    icon.className = "cert-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "✳";
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = certification.name;
    const issuer = document.createElement("p");
    issuer.textContent = `${certification.issuer}${certification.code.startsWith("TODO:") ? "" : ` · ${certification.code}`}`;
    details.append(title, issuer);
    card.append(icon, details);
    certificationRoot.append(card);
  });

  const educationRoot = document.querySelector("[data-education]");
  data.education.forEach((education) => {
    const card = document.createElement("article");
    card.className = "education-card reveal";
    const title = document.createElement("h3");
    title.textContent = education.qualification;
    const institution = document.createElement("p");
    institution.textContent = `${education.institution} · ${education.location}`;
    const date = document.createElement("p");
    date.className = "education-date";
    date.textContent = `${education.start} — ${education.end}`;
    card.append(title, institution, date);
    educationRoot.append(card);
  });
}

function makeChip(value, className = "chip") {
  const chip = document.createElement("span");
  chip.className = className;
  chip.textContent = value;
  return chip;
}

function initProjectInteractions(projects) {
  const dialog = document.querySelector(".project-dialog");
  const closeButton = dialog.querySelector(".dialog-close");
  const filterButtons = document.querySelectorAll(".filter-button");
  const cards = document.querySelectorAll(".project-card");
  const detailButtons = document.querySelectorAll(".project-card-open");
  const prefersFinePointer = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");

  detailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const project = projects[Number(button.dataset.projectIndex)];
      dialog.querySelector("[data-dialog-title]").textContent = project.title;
      const stack = dialog.querySelector("[data-dialog-stack]");
      stack.replaceChildren(...project.stack.map((item) => makeChip(item)));
      const bullets = dialog.querySelector("[data-dialog-bullets]");
      bullets.replaceChildren(...project.bullets.map((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        return item;
      }));
      const github = dialog.querySelector("[data-dialog-github]");
      github.hidden = !project.github;
      if (project.github) {
        github.href = project.github;
        github.target = "_blank";
        github.rel = "noopener noreferrer";
      } else {
        github.removeAttribute("href");
        github.removeAttribute("target");
        github.removeAttribute("rel");
      }
      dialog.showModal();
    });

  });

  if (prefersFinePointer.matches) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((filterButton) => {
        const selected = filterButton === button;
        filterButton.classList.toggle("is-active", selected);
        filterButton.setAttribute("aria-pressed", String(selected));
      });
      cards.forEach((card) => {
        card.hidden = filter !== "All" && !card.dataset.filters.split("|").includes(filter);
      });
    });
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function initCopyEmail(email) {
  const button = document.querySelector("[data-copy-email]");
  const toast = document.querySelector(".toast");
  let toastTimer;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.textContent = "Email address copied.";
    } catch {
      toast.textContent = `Copy unavailable. Email: ${email}`;
    }
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  });
}

function showStaticScene() {
  const shell = document.querySelector("#pipeline-scene");
  const fallback = shell?.querySelector(".scene-fallback");
  shell?.classList.remove("has-webgl");
  shell?.querySelector(".scene-canvas")?.classList.remove("is-ready");
  shell?.querySelector(".scene-canvas")?.replaceChildren();
  fallback?.removeAttribute("aria-hidden");
  const caption = document.querySelector(".scene-caption");
  if (caption) caption.textContent = "Static isometric pipeline preview";
}
