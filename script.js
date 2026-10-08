(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");

  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation?.classList.toggle("is-open", !isOpen);
  });
  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
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
    }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const scene = document.querySelector("[data-market-scene]");
  const canvas = scene?.querySelector(".market-canvas");
  const price = scene?.querySelector("[data-price]");
  const touchMode = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (scene && !touchMode && !reduceMotion) {
    window.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 8;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      scene.style.setProperty("--scene-x", `${x.toFixed(1)}px`);
      scene.style.setProperty("--scene-y", `${y.toFixed(1)}px`);
      scene.style.setProperty("--grid-x", `${(x * 0.85).toFixed(1)}px`);
      scene.style.setProperty("--grid-y", `${(y * 0.85).toFixed(1)}px`);
    }, { passive: true });
  }

  if (price && !reduceMotion) {
    const illustrativeValues = ["5,248.25", "5,248.00", "5,248.50", "5,248.25", "5,248.75", "5,248.50"];
    let valueIndex = 0;
    window.setInterval(() => {
      valueIndex = (valueIndex + 1) % illustrativeValues.length;
      price.textContent = illustrativeValues[valueIndex];
      scene.style.setProperty("--price-settle", "-12px");
      window.requestAnimationFrame(() => window.setTimeout(() => scene.style.setProperty("--price-settle", "0px"), 30));
    }, 1600);
  }

  if (!canvas || reduceMotion) return;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;
  scene.classList.add("has-canvas");

  let width = 0;
  let height = 0;
  let frame = 0;
  let startedAt = 0;
  let inView = true;
  let dpr = 1;
  const bars = [
    [0.07, .63, .11, .08], [0.15, .56, .14, .07], [0.23, .62, .10, .07],
    [0.31, .48, .16, .08], [0.39, .54, .12, .07], [0.47, .40, .18, .08],
    [0.55, .46, .11, .07], [0.63, .34, .17, .08], [0.71, .39, .11, .07],
    [0.79, .27, .16, .08], [0.87, .31, .11, .07], [0.94, .20, .17, .08]
  ];
  const points = [[.04,.69],[.14,.63],[.22,.68],[.31,.52],[.39,.57],[.47,.43],[.55,.49],[.64,.36],[.71,.41],[.79,.29],[.87,.34],[.95,.20]];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  };

  const draw = (now) => {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const xFor = (unit) => unit * width;
    const yFor = (unit) => unit * height;

    bars.forEach(([x, y, candleHeight, bodyHeight], index) => {
      const px = xFor(x);
      const py = yFor(y);
      const candleWick = yFor(candleHeight);
      const body = Math.max(6, yFor(bodyHeight));
      const rising = index % 4 !== 2;
      context.strokeStyle = rising ? "rgba(142, 179, 171, .50)" : "rgba(145, 156, 163, .4)";
      context.fillStyle = rising ? "rgba(99, 145, 135, .25)" : "rgba(114, 127, 135, .20)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(px, py - candleWick * .45);
      context.lineTo(px, py + candleWick * .55);
      context.stroke();
      context.fillRect(px - 4, py - body * .45, 8, body);
      context.strokeRect(px - 4, py - body * .45, 8, body);
    });

    const progress = Math.min((now - startedAt) / 2400, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const pointCount = Math.max(2, Math.floor(points.length * eased));
    context.beginPath();
    points.slice(0, pointCount).forEach(([x, y], index) => {
      if (index === 0) context.moveTo(xFor(x), yFor(y));
      else context.lineTo(xFor(x), yFor(y));
    });
    if (pointCount < points.length) {
      const previous = points[pointCount - 1];
      const next = points[pointCount];
      const local = (points.length * eased) % 1;
      context.lineTo(xFor(previous[0] + (next[0] - previous[0]) * local), yFor(previous[1] + (next[1] - previous[1]) * local));
    }
    context.strokeStyle = "rgba(174, 205, 196, .74)";
    context.lineWidth = 1.4;
    context.shadowColor = "rgba(126, 224, 198, .2)";
    context.shadowBlur = 9;
    context.stroke();
    context.shadowBlur = 0;

    context.beginPath();
    context.setLineDash([3, 5]);
    context.moveTo(0, yFor(.506));
    context.lineTo(width * eased, yFor(.506));
    context.strokeStyle = "rgba(126, 224, 198, .42)";
    context.lineWidth = 1;
    context.stroke();
    context.setLineDash([]);

    if (progress > .98) {
      const [lastX, lastY] = points[points.length - 1];
      context.fillStyle = "rgba(126, 224, 198, .85)";
      context.beginPath();
      context.arc(xFor(lastX), yFor(lastY), 2.2, 0, Math.PI * 2);
      context.fill();
    }

  };

  const animate = (now) => {
    frame = 0;
    if (!inView) return;
    draw(now);
    if (now - startedAt < 2400) frame = window.requestAnimationFrame(animate);
  };

  const start = () => {
    if (frame) return;
    startedAt = performance.now();
    draw(startedAt);
    frame = window.requestAnimationFrame(animate);
  };
  const stop = () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
  };

  new ResizeObserver(resize).observe(canvas);
  resize();
  const sceneObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) start();
    else stop();
  }, { threshold: 0.01 });
  sceneObserver.observe(scene);
})();
