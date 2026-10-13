const storedTheme = localStorage.getItem("portfolio-theme");
if (storedTheme === "light" || storedTheme === "dark") {
  document.documentElement.dataset.theme = storedTheme;
}

export function initTheme() {
  const toggle = document.querySelector(".theme-toggle");

  function updateThemeButton() {
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    toggle.innerHTML = dark
      ? '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
      : '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z"/></svg>';
  }

  updateThemeButton();
  toggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("portfolio-theme", next);
    updateThemeButton();
  });
}
