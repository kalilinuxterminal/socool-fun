(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");
  const hero = document.querySelector(".hero");

  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    navigation?.classList.remove("is-open");
  };
  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation?.classList.toggle("is-open", !isOpen);
  });
  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });

  const faqItems = [...document.querySelectorAll(".faq-list details")];
  faqItems.forEach((item) => item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item && other.open) other.open = false;
    });
  }));

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: "0px 0px -24px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if (hero && !reduceMotion && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("is-in-view", entry.isIntersecting);
    }, { threshold: .02 });
    heroObserver.observe(hero);
  } else if (hero && !reduceMotion) {
    hero.classList.add("is-in-view");
  }

  if (!hero || reduceMotion || window.matchMedia("(hover: none), (pointer: coarse)").matches || !window.matchMedia("(min-width: 760px)").matches) return;
  const skyline = hero.querySelector('[data-parallax="skyline"]');
  if (!skyline) return;
  let queued = false;
  window.addEventListener("pointermove", (event) => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      const x = (event.clientX / window.innerWidth - .5) * 20;
      const y = (event.clientY / window.innerHeight - .5) * 20;
      skyline.style.setProperty("--skyline-x", `${x.toFixed(1)}px`);
      skyline.style.setProperty("--skyline-y", `${y.toFixed(1)}px`);
      queued = false;
    });
  }, { passive: true });
})();
