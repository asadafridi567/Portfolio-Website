const tabIds = ["summary", "skills", "experience", "projects", "certifications", "education"];

export function initResumeTabs(resume) {
  const tabs = [...document.querySelectorAll(".resume-tabs [role='tab']")];
  const panel = document.querySelector("#resume-panel");

  function renderTab(id, updateHash = true) {
    const tab = tabs.find((item) => item.dataset.tab === id) ?? tabs[0];
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);
    panel.replaceChildren();

    if (id === "summary") {
      const summary = document.createElement("p");
      summary.textContent = resume.profile.summary;
      panel.append(summary);
    } else if (id === "skills") {
      appendItems(resume.skills.flatMap((skill) => [skill.group, ...skill.items]), panel);
    } else if (id === "experience") {
      appendItems(resume.experience.map((item) => `${item.role} — ${item.company} (${item.start}–${item.end})`), panel);
    } else if (id === "projects") {
      appendItems(resume.projects.map((item) => item.title), panel);
    } else if (id === "certifications") {
      appendItems(resume.certifications.map((item) => item.name), panel);
    } else if (id === "education") {
      appendItems(resume.education.map((item) => `${item.qualification} — ${item.institution}`), panel);
    }

    if (updateHash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#resume=${id}`);
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => renderTab(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[nextIndex].focus();
      renderTab(tabs[nextIndex].dataset.tab);
    });
  });

  const initialTab = window.location.hash.startsWith("#resume=")
    ? window.location.hash.slice("#resume=".length)
    : "summary";
  renderTab(tabIds.includes(initialTab) ? initialTab : "summary", false);
  window.addEventListener("popstate", () => {
    const current = window.location.hash.startsWith("#resume=")
      ? window.location.hash.slice("#resume=".length)
      : "summary";
    renderTab(tabIds.includes(current) ? current : "summary", false);
  });
}

function appendItems(values, panel) {
  const list = document.createElement("div");
  list.className = "chip-row";
  values.forEach((value) => {
    const item = document.createElement("span");
    item.className = "resume-summary-item";
    item.textContent = value;
    list.append(item);
  });
  panel.append(list);
}
