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
    if (event.key === "Escape") closeMenu();
  });

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
    }, { threshold: 0.12, rootMargin: "0px 0px -28px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if (hero && !reduceMotion && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("is-in-view", entry.isIntersecting);
    }, { threshold: 0.02 });
    heroObserver.observe(hero);

    const parallaxLayers = [...hero.querySelectorAll("[data-parallax]")];
    const touchMode = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const desktopLayout = window.matchMedia("(min-width: 760px)");
    if (!touchMode && desktopLayout.matches && parallaxLayers.length) {
      let queued = false;
      window.addEventListener("pointermove", (event) => {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(() => {
          const x = (event.clientX / window.innerWidth - .5) * 20;
          const y = (event.clientY / window.innerHeight - .5) * 20;
          parallaxLayers.forEach((layer) => {
            const factor = layer.dataset.parallax === "skyline" ? -.5 : layer.dataset.parallax === "phone" ? .45 : 1;
            const axis = layer.dataset.parallax;
            layer.style.setProperty(`--${axis}-x`, `${(x * factor).toFixed(1)}px`);
            layer.style.setProperty(`--${axis}-y`, `${(y * factor).toFixed(1)}px`);
          });
          queued = false;
        });
      }, { passive: true });
    }
  } else if (hero && !reduceMotion) {
    hero.classList.add("is-in-view");
  }

  const livePulse = document.querySelector(".session-pulse");
  if (livePulse && !reduceMotion && "IntersectionObserver" in window) {
    const pulseObserver = new IntersectionObserver(([entry]) => {
      livePulse.classList.toggle("is-active", entry.isIntersecting);
    }, { threshold: 0.1 });
    pulseObserver.observe(livePulse);
  }

  const activeState = document.querySelector(".state-node.is-current");
  if (activeState && !reduceMotion && "IntersectionObserver" in window) {
    const stateObserver = new IntersectionObserver(([entry]) => {
      activeState.classList.toggle("is-active", entry.isIntersecting);
    }, { threshold: 0.2 });
    stateObserver.observe(activeState);
  }
})();
