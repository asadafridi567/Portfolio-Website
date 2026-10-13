const INTENSITY = 0.16;
const MOBILE_FACTOR = 0.4;
const MOUSE_STRENGTH = 0.035;

export function initParallax() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  const gsap = window.gsap;
  const scrollTrigger = window.ScrollTrigger;
  if (gsap && scrollTrigger) {
    gsap.registerPlugin(scrollTrigger);
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const factor = INTENSITY * (mobile ? MOBILE_FACTOR : 1);
    document.querySelectorAll("[data-depth]").forEach((element) => {
      const depth = Number(element.dataset.depth);
      if (!Number.isFinite(depth) || !depth) return;
      gsap.to(element, {
        y: () => -window.innerHeight * factor * depth,
        ease: "none",
        scrollTrigger: {
          trigger: element.closest(".hero") ?? element,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onToggle: (trigger) => {
            element.style.willChange = trigger.isActive ? "transform" : "auto";
          }
        }
      });
    });
  }

  if (!window.matchMedia("(pointer: fine)").matches) return;
  const hero = document.querySelector(".hero");
  const scene = document.querySelector(".scene-shell");
  const labels = document.querySelector(".scene-labels");
  if (!hero || !scene || !labels) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animationId = 0;

  function animatePointer() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    scene.style.setProperty("--pointer-x", `${currentX}px`);
    scene.style.setProperty("--pointer-y", `${currentY}px`);
    labels.style.setProperty("--label-x", `${currentX * 1.5}px`);
    labels.style.setProperty("--label-y", `${currentY * 1.5}px`);
    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      animationId = window.requestAnimationFrame(animatePointer);
    } else {
      animationId = 0;
    }
  }

  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const bounds = hero.getBoundingClientRect();
    targetX = (event.clientX - bounds.left - bounds.width / 2) * MOUSE_STRENGTH;
    targetY = (event.clientY - bounds.top - bounds.height / 2) * MOUSE_STRENGTH;
    if (!animationId) animationId = window.requestAnimationFrame(animatePointer);
  });
  hero.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    if (!animationId) animationId = window.requestAnimationFrame(animatePointer);
  });
}
