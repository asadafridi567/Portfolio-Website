export function initNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  const menuLinks = [...menu.querySelectorAll("a:not([aria-disabled='true'])")];
  const desktopLinks = [...document.querySelectorAll(".desktop-nav a[href^='#']")];
  let returnFocusTo = null;

  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  function closeMenu({ restoreFocus = false } = {}) {
    if (!header.classList.contains("menu-open")) return;
    header.classList.remove("menu-open");
    menu.setAttribute("inert", "");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-active");
    if (restoreFocus) returnFocusTo?.focus();
  }

  function openMenu() {
    returnFocusTo = toggle;
    header.classList.add("menu-open");
    menu.removeAttribute("inert");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-active");
    menuLinks[0]?.focus();
  }

  toggle.addEventListener("click", () => {
    if (toggle.getAttribute("aria-expanded") === "true") closeMenu({ restoreFocus: true });
    else openMenu();
  });

  menuLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (!header.classList.contains("menu-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    } else if (event.key === "Tab") {
      const first = menuLinks[0];
      const last = menuLinks[menuLinks.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  if ("IntersectionObserver" in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      desktopLinks.forEach((link) => {
        const active = link.hash === `#${visible.target.id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.35, 0.6] });
    sections.forEach((section) => activeObserver.observe(section));
  }
}
