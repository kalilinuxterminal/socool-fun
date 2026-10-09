(() => {
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const faqItems = [...document.querySelectorAll(".faq-item")];
  let activeFaq = null;
  let transitioning = false;
  let queuedFaq = null;
  let transitionId = 0;

  const setExpanded = (item, expanded) => {
    item.querySelector(".faq-trigger")?.setAttribute("aria-expanded", String(expanded));
    item.querySelector(".faq-answer")?.setAttribute("aria-hidden", String(!expanded));
  };

  const onHeightEnd = (answer, callback) => {
    let complete = false;
    const finish = (event) => {
      if (event && (event.target !== answer || event.propertyName !== "height")) return;
      if (complete) return;
      complete = true;
      answer.removeEventListener("transitionend", finish);
      window.clearTimeout(fallback);
      callback();
    };
    const fallback = window.setTimeout(() => finish(), 450);
    answer.addEventListener("transitionend", finish);
  };

  const closeFaq = (item, callback) => {
    const answer = item.querySelector(".faq-answer");
    const transition = ++transitionId;
    setExpanded(item, false);
    if (reduceMotion) {
      answer.classList.remove("is-open");
      answer.style.height = "auto";
      callback();
      return;
    }

    answer.style.height = `${answer.getBoundingClientRect().height}px`;
    answer.style.opacity = "1";
    answer.classList.remove("is-open");
    void answer.offsetHeight;
    onHeightEnd(answer, () => {
      if (transition !== transitionId) return;
      answer.style.height = "0px";
      answer.style.opacity = "0";
      callback();
    });
    window.requestAnimationFrame(() => {
      if (transition !== transitionId) return;
      answer.style.height = "0px";
      answer.style.opacity = "0";
    });
  };

  const openFaq = (item, callback) => {
    const answer = item.querySelector(".faq-answer");
    const transition = ++transitionId;
    item.querySelector(".faq-trigger")?.setAttribute("aria-expanded", "true");
    answer.setAttribute("aria-hidden", "false");
    answer.classList.add("is-open");
    if (reduceMotion) {
      answer.style.height = "auto";
      answer.style.opacity = "1";
      callback();
      return;
    }

    answer.style.height = "0px";
    answer.style.opacity = "0";
    void answer.offsetHeight;
    onHeightEnd(answer, () => {
      if (transition !== transitionId) return;
      answer.style.height = "auto";
      answer.style.opacity = "1";
      callback();
    });
    window.requestAnimationFrame(() => {
      if (transition !== transitionId) return;
      answer.style.height = `${answer.scrollHeight}px`;
      answer.style.opacity = "1";
    });
  };

  const processFaq = (item) => {
    if (transitioning) {
      queuedFaq = item;
      return;
    }
    transitioning = true;

    const finish = () => {
      transitioning = false;
      if (queuedFaq) {
        const next = queuedFaq;
        queuedFaq = null;
        processFaq(next);
      }
    };

    if (activeFaq === item) {
      closeFaq(item, () => {
        activeFaq = null;
        finish();
      });
    } else if (activeFaq) {
      const previous = activeFaq;
      closeFaq(previous, () => {
        activeFaq = null;
        openFaq(item, () => {
          activeFaq = item;
          finish();
        });
      });
    } else {
      openFaq(item, () => {
        activeFaq = item;
        finish();
      });
    }
  };

  faqItems.forEach((item) => item.querySelector(".faq-trigger")?.addEventListener("click", () => processFaq(item)));

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
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
