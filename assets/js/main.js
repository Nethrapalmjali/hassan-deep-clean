/* Hassan Deep Cleaning Services — front-end behaviour (no backend). */
(() => {
  "use strict";

  const WHATSAPP_NUMBER = "916360292394"; // 063602 92394 with India country code
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");

  /* ---------- Helpers ---------- */
  const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  const toast = (() => {
    const el = $("#toast");
    let t;
    return (msg) => {
      el.textContent = msg;
      el.classList.add("is-on");
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove("is-on"), 3200);
    };
  })();

  /* ---------- Header: scrolled state + mobile menu ---------- */
  const header = $("#header");
  const nav = $("#nav");
  const navToggle = $("#navToggle");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  navToggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* Highlight the nav link for the section in view */
  const navLinks = $$('.nav a[href^="#"]');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navLinks
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean)
    .forEach((s) => sectionObserver.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    // Stagger siblings that reveal together
    revealEls.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      const i = siblings.indexOf(el);
      if (i > 0) el.style.setProperty("--delay", `${Math.min(i, 6) * 0.07}s`);
    });
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Videos ---------- */
  const allVideos = $$("video");
  const pauseOthers = (current) => {
    allVideos.forEach((v) => {
      if (v === current) return;
      if (v.classList.contains("js-auto")) {
        // Ambient videos keep playing but go silent
        if (!v.muted) {
          v.muted = true;
          v.parentElement.querySelector(".sound-btn")?.classList.remove("is-on");
        }
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  const ensureSrc = (v) => {
    if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src;
  };

  // Autoplay muted reels only while visible (saves mobile data)
  const autoVideos = $$("video.js-auto");
  const autoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          ensureSrc(v);
          if (!reduceMotion) v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    },
    { threshold: 0.35 }
  );
  autoVideos.forEach((v) => autoObserver.observe(v));

  // Sound toggles on reels
  $$(".sound-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.parentElement.querySelector("video");
      ensureSrc(v);
      const turnOn = v.muted;
      if (turnOn) pauseOthers(v);
      v.muted = !turnOn;
      btn.classList.toggle("is-on", turnOn);
      btn.setAttribute("aria-label", turnOn ? "Mute" : "Turn sound on");
      if (v.paused) v.play().catch(() => {});
    });
  });

  // Customer review videos: click to play with sound
  $$(".review").forEach((card) => {
    const v = $("video", card);
    const btn = $(".review__play", card);
    btn.addEventListener("click", () => {
      ensureSrc(v);
      pauseOthers(v);
      v.controls = true;
      card.classList.add("is-playing");
      v.play().catch(() => {});
    });
    v.addEventListener("pause", () => {
      if (v.ended || v.currentTime === 0) card.classList.remove("is-playing");
    });
    v.addEventListener("ended", () => {
      v.controls = false;
      v.currentTime = 0;
      card.classList.remove("is-playing");
    });
    v.addEventListener("play", () => pauseOthers(v));
  });

  /* ---------- Lightbox ---------- */
  const lightbox = $("#lightbox");
  const lbImg = $("img", lightbox);
  $$(".zoomable").forEach((el) => {
    el.addEventListener("click", () => {
      const img = $("img", el);
      lbImg.src = el.dataset.full || img.src;
      lbImg.alt = img.alt;
      if (typeof lightbox.showModal === "function") lightbox.showModal();
      else window.open(lbImg.src, "_blank");
    });
  });
  $(".lightbox__close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (e) => e.target === lightbox && lightbox.close());

  /* ---------- "Book this service" buttons → prefill form ---------- */
  const form = $("#bookingForm");
  const serviceSelect = $("#serviceSelect");
  $$("[data-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const service = btn.dataset.service;
      const match = [...serviceSelect.options].find((o) => o.value === service || o.text === service);
      if (match) serviceSelect.value = match.value;
      serviceSelect.closest(".field").classList.remove("is-invalid");
      $("#book").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(() => form.elements.name.focus({ preventScroll: true }), 700);
    });
  });

  /* ---------- Booking form → WhatsApp ---------- */
  const dateInput = $("#dateInput");
  const today = new Date();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  dateInput.min = iso(today);

  const formatDate = (value) => {
    if (!value) return "";
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const validators = {
    name: (v) => v.trim().length >= 2,
    phone: (v) => /^(\+?91[\s-]?)?0?[6-9]\d{4}[\s-]?\d{5}$/.test(v.trim()),
    service: (v) => v !== "",
    area: (v) => v !== "",
  };

  const validateField = (name) => {
    const el = form.elements[name];
    const ok = validators[name](el.value);
    el.closest(".field").classList.toggle("is-invalid", !ok);
    return ok;
  };

  Object.keys(validators).forEach((name) => {
    const el = form.elements[name];
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => {
      if (el.closest(".field").classList.contains("is-invalid")) validateField(name);
    });
    el.addEventListener("blur", () => el.value && validateField(name));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(validators).map(validateField);
    if (results.includes(false)) {
      const firstBad = $(".field.is-invalid input, .field.is-invalid select", form);
      firstBad?.focus();
      toast("Please fill in the highlighted fields");
      return;
    }

    const f = form.elements;
    const lines = [
      "Hello Hassan Deep Cleaning Services! 👋",
      "I would like to book a service.",
      "",
      `*Service:* ${f.service.value}`,
      `*Name:* ${f.name.value.trim()}`,
      `*Mobile:* ${f.phone.value.trim()}`,
      `*Area:* ${f.area.value}`,
      f.property.value ? `*Property:* ${f.property.value}` : null,
      f.date.value ? `*Preferred date:* ${formatDate(f.date.value)}` : null,
      f.time.value ? `*Preferred time:* ${f.time.value}` : null,
      f.message.value.trim() ? `*Address / details:* ${f.message.value.trim()}` : null,
      "",
      "Please share the price and available slot. Thank you!",
    ].filter((l) => l !== null);

    const url = waLink(lines.join("\n"));
    toast("Opening WhatsApp…");
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url; // popup blocked → same tab
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = today.getFullYear();
})();
