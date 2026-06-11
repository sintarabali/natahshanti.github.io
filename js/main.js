/* Natah Shanti Homestay Ubud - shared UI */

(function () {
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // Mobile nav toggle
  const hamburger = document.querySelector("[data-hamburger]");
  const drawer = document.querySelector("[data-drawer]");
  if (hamburger && drawer) {
    hamburger.addEventListener("click", () => {
      const hidden = drawer.getAttribute("aria-hidden") !== "false";
      drawer.setAttribute("aria-hidden", hidden ? "false" : "true");
    });
    $$("[data-nav-link]").forEach((a) => {
      a.addEventListener("click", () => drawer.setAttribute("aria-hidden", "true"));
    });
  }

  // Smooth scroll
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Hero carousels (fullscreen fade)
  const carousels = $$("[data-hero-carousel]");
  carousels.forEach(initCarousel);

  function initCarousel(root) {
    const slides = $$(".hero-slide", root);
    const dotsWrap = root.querySelector("[data-dots]");
    const prevBtn = root.querySelector("[data-prev]");
    const nextBtn = root.querySelector("[data-next]");
    const autoplayMs = Number(root.getAttribute("data-autoplay") || 4000);

    if (slides.length === 0) return;

    let idx = 0;
    let timer = null;

    // Build dots if not present
    if (dotsWrap && dotsWrap.children.length === 0) {
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.className = "dot";
        b.type = "button";
        b.setAttribute("aria-label", `Go to slide ${i + 1}`);
        b.addEventListener("click", () => setIndex(i));
        dotsWrap.appendChild(b);
      });
    }

    const dotEls = dotsWrap ? $$(".dot", dotsWrap) : [];

    function setIndex(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle("is-active", si === idx));
      dotEls.forEach((d, di) => d.classList.toggle("is-active", di === idx));
    }

    setIndex(idx);

    function next() {
      setIndex(idx + 1);
    }
    function prev() {
      setIndex(idx - 1);
    }

    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        stop();
        next();
        start();
      });
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        stop();
        prev();
        start();
      });

    // Touch swipe
    let startX = null;
    let startY = null;
    root.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
      },
      { passive: true },
    );

    root.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      startX = null;
      startY = null;
      // Horizontal swipe only
      if (Math.abs(dx) < 35) return;
      if (Math.abs(dy) > 60) return;
      stop();
      if (dx < 0) next();
      else prev();
      start();
    });

    function start() {
      if (autoplayMs <= 0) return;
      stop();
      timer = setInterval(() => next(), autoplayMs);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Pause on hover/focus (desktop)
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    // Respect reduced motion
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) start();
    else stop();
  }

  // Testimonials slider
  const reviewSlider = document.querySelector("[data-review-slider]");
  if (reviewSlider) {
    const track = reviewSlider.querySelector("[data-review-track]");
    const items = $$(".review", reviewSlider);
    let i = 0;
    setInterval(() => {
      i = (i + 1) % items.length;
      track.style.transform = `translateX(${-i * 100}%)`;
    }, 5000);
  }

  // FAQ accordion
  $$(".faq-item .faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;
      const open = item.classList.contains("is-open");
      // Close others
      $$(".faq-item.is-open").forEach((x) => x.classList.remove("is-open"));
      if (!open) item.classList.add("is-open");
    });
  });

  // Masonry image lightbox
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  if (lightbox && lightboxImg) {
    $$(".masonry-item img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        lightboxImg.src = img.getAttribute("src");
        lightbox.classList.add("is-open");
      });
    });
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("is-open");
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") lightbox.classList.remove("is-open");
    });
  }

  // Booking modal (shared)
  const modal = document.querySelector("[data-book-modal]");
  const modalRoom = document.querySelector("[data-book-room]");
  const closeBtn = document.querySelector("[data-book-close]");
  const form = document.querySelector("[data-book-form]");

  function openModal(roomName) {
    if (modalRoom && roomName) modalRoom.textContent = roomName;
    if (modal) modal.classList.add("is-open");
  }
  function closeModal() {
    if (modal) modal.classList.remove("is-open");
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", closeModal);
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // Open buttons
  $$("[data-book-now]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const room = btn.getAttribute("data-room") || btn.getAttribute("data-book-now");
      openModal(room || "");
    });
  });

  // WhatsApp link generator
  function getWhatsAppLink(message) {
    const phone = document.documentElement.getAttribute("data-whatsapp-phone") || "";
    // Use wa.me format; message URL-encoded
    if (!phone) return "#";
    const txt = encodeURIComponent(message || "Hello Natah Shanti Homestay Ubud, I would like to book a stay.");
    return `https://wa.me/${phone}?text=${txt}`;
  }

  const waBtn = document.querySelector("[data-whatsapp-btn]");
  if (waBtn) {
    const baseMessage = waBtn.getAttribute("data-wa-message") || "Hello Natah Shanti Homestay Ubud, I would like to book a stay.";
    waBtn.addEventListener("click", (e) => {
      const link = getWhatsAppLink(baseMessage);
      if (link === "#") return;
      waBtn.setAttribute("href", link);
    });
    // Set initial
    const link = getWhatsAppLink(baseMessage);
    waBtn.setAttribute("href", link);
  }

  // Form submission (demo: prevents and opens WhatsApp with form data)
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const room = modalRoom && modalRoom.textContent ? modalRoom.textContent : "";
      const checkIn = fd.get("checkin") || "";
      const checkOut = fd.get("checkout") || "";
      const guests = fd.get("guests") || "";
      const name = fd.get("name") || "";

      const message = `Hello Natah Shanti Homestay Ubud${room ? ` - ${room}` : ""}!%0A` + `I would like to book:%0A` + `Check-in: ${checkIn}%0A` + `Check-out: ${checkOut}%0A` + `Guests: ${guests}%0A` + `Name: ${name}%0A` + `Thank you!`;

      const phoneLink = document.documentElement.getAttribute("data-whatsapp-phone") || "";
      if (!phoneLink) return alert("WhatsApp phone number not set.");
      const url = `https://wa.me/${phoneLink}?text=${encodeURIComponent(decodeURIComponent(message))}`;
      window.open(url, "_blank");
      closeModal();
    });
  }
})();
