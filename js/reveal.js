export function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const gsap = window.gsap;
  const scrollTrigger = window.ScrollTrigger;
  if (gsap && scrollTrigger) {
    gsap.registerPlugin(scrollTrigger);
    const grouped = new Set();
    document.querySelectorAll(".skills-grid, .projects-grid, .timeline, .certification-grid, .education-list")
      .forEach((container) => {
        const children = [...container.querySelectorAll(":scope > .reveal")];
        if (!children.length) return;
        children.forEach((child) => grouped.add(child));
        gsap.fromTo(children, { y: 24, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: container, start: "top 88%", once: true },
          onComplete: () => children.forEach((child) => child.classList.add("is-visible"))
        });
      });
    items.forEach((item) => {
      if (grouped.has(item)) return;
      gsap.fromTo(item, { y: 24, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 88%", once: true },
        onComplete: () => item.classList.add("is-visible")
      });
    });
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  items.forEach((item) => observer.observe(item));
}
