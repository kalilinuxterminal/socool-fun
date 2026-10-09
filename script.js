(() => {
  document.documentElement.classList.add("js");
  const header = document.querySelector(".site-header");
  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const faqItems = [...document.querySelectorAll(".faq-list details")];
  faqItems.forEach((item) => item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item && other.open) other.open = false;
    });
  }));

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: "0px 0px -20px 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
})();
