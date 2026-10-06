/**
 * ==========================================================================
 * ABDALLA MOHAMED — PORTFOLIO JAVASCRIPT
 * Modular, performant, accessible and maintainable client-side script.
 * ==========================================================================
 */

(() => {
  "use strict";

  // Helper DOM selectors
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  /* ------------------------------------------------------------------------
     1. THEME MANAGER (Dark / Light Mode)
     ------------------------------------------------------------------------ */
  const initTheme = () => {
    const themeButtons = $$(".theme-toggle");
    const storedTheme = localStorage.getItem("portfolio-theme");
    const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Default to stored theme, or system preference, or dark
    const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");

    const applyTheme = (theme) => {
      const isLight = theme === "light";
      document.documentElement.dataset.theme = isLight ? "light" : "dark";

      themeButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", String(isLight));
        btn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
        
        const icon = $(".theme-icon", btn);
        const label = $(".theme-label", btn);
        
        if (icon) icon.textContent = isLight ? "☾" : "☀";
        if (label) label.textContent = isLight ? "Dark" : "Light";
      });

      localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
    };

    applyTheme(initialTheme);

    // Attach click listeners to all theme toggle buttons
    themeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const currentTheme = document.documentElement.dataset.theme;
        applyTheme(currentTheme === "light" ? "dark" : "light");
      });
    });

    // Mark body ready for smooth background/color transitions
    document.body.classList.add("theme-ready");
  };

  /* ------------------------------------------------------------------------
     2. PAGE LOADER
     ------------------------------------------------------------------------ */
  const initLoader = () => {
    const loader = $("#loader");
    if (!loader) return;

    const dismissLoader = () => {
      loader.classList.add("done");
      setTimeout(() => loader.remove(), 500);
    };

    if (document.readyState === "complete") {
      setTimeout(dismissLoader, 400);
    } else {
      window.addEventListener("load", () => setTimeout(dismissLoader, 400));
      // Fallback timeout to prevent loader from hanging indefinitely
      setTimeout(dismissLoader, 2500);
    }
  };

  /* ------------------------------------------------------------------------
     3. SCROLL PROGRESS BAR & BACK-TO-TOP BUTTON
     ------------------------------------------------------------------------ */
  const initScrollEffects = () => {
    const bar = $("#bar");
    const topBtn = $("#top");

    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;

      if (bar) {
        bar.style.transform = `scaleX(${progress})`;
      }

      if (topBtn) {
        topBtn.classList.toggle("show", window.scrollY > 350);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (topBtn) {
      topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  /* ------------------------------------------------------------------------
     4. MOBILE MENU OVERLAY
     ------------------------------------------------------------------------ */
  const initMobileMenu = () => {
    const burger = $(".burger");
    const overlay = $(".ov");
    if (!burger || !overlay) return;

    const toggleMenu = (open) => {
      overlay.classList.toggle("open", open);
      burger.textContent = open ? "✕" : "☰";
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      document.body.style.overflow = open ? "hidden" : "";
    };

    burger.addEventListener("click", () => {
      const isOpen = overlay.classList.contains("open");
      toggleMenu(!isOpen);
    });

    // Close when clicking overlay links
    $$("a", overlay).forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

    // Close on Escape key press
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) {
        toggleMenu(false);
      }
    });
  };

  /* ------------------------------------------------------------------------
     5. HERO TYPING EFFECT
     ------------------------------------------------------------------------ */
  const initTypingEffect = () => {
    const el = $("#typed");
    if (!el) return;

    const roles = [
      "Data Analyst",
      "Power BI & Excel Specialist",
      "SQL & Python Developer",
      "Java & C++ Foundations"
    ];

    // Accessibility: Reduced motion check
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 65;
    const deletingSpeed = 35;
    const pauseDelay = 1800;

    const type = () => {
      const currentRole = roles[roleIndex];

      if (!isDeleting) {
        charIndex++;
        el.textContent = currentRole.slice(0, charIndex);

        if (charIndex === currentRole.length) {
          isDeleting = true;
          setTimeout(type, pauseDelay);
          return;
        }
      } else {
        charIndex--;
        el.textContent = currentRole.slice(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(type, 300);
          return;
        }
      }

      setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    };

    type();
  };

  /* ------------------------------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
     ------------------------------------------------------------------------ */
  const initScrollReveal = () => {
    const revealElements = $$(".rv");
    if (!revealElements.length) return;

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => observer.observe(el));
  };

  /* ------------------------------------------------------------------------
     7. SINGLE-PAGE SCROLL SPY (highlights the nav link of the visible section)
     ------------------------------------------------------------------------ */
  const initScrollSpy = () => {
    const navLinks = $$("[data-r]");
    const sections = [...new Set(navLinks.map((a) => a.dataset.r))]
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((s) => s.el);

    if (!sections.length) return;

    const setActive = (id) => {
      navLinks.forEach((link) => {
        const isActive = link.dataset.r === id;
        link.classList.toggle("on", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };

    let current = null;
    let ticking = false;

    const update = () => {
      ticking = false;
      const nav = $(".nav");
      const probe = (nav ? nav.offsetHeight : 70) + 120;
      let activeId = sections[0].id;

      sections.forEach(({ id, el }) => {
        if (el.getBoundingClientRect().top <= probe) activeId = id;
      });

      // At the very bottom of the page, highlight the last section
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) activeId = sections[sections.length - 1].id;

      if (activeId !== current) {
        current = activeId;
        setActive(activeId);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Support old-style links such as "#/projects"
    const legacy = () => {
      const m = window.location.hash.match(/^#\/(.*)$/);
      if (!m) return;
      const id = m[1] || "home";
      const target = document.getElementById(id);
      if (target) {
        history.replaceState(null, "", `#${id}`);
        target.scrollIntoView();
      }
    };
    window.addEventListener("hashchange", legacy);
    legacy();

    update();
  };

  /* ------------------------------------------------------------------------
     8. TOAST NOTIFICATION UTILITY
     ------------------------------------------------------------------------ */
  const showToast = (message) => {
    let toast = $("#toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  };

  /* ------------------------------------------------------------------------
     9. INTERACTIVE FEATURES (Project Filters & Contact Handlers)
     ------------------------------------------------------------------------ */
  const initInteractiveFeatures = () => {
    // Project Category Filtering
    const filterButtons = $$(".filter-btn");
    const projectCards = $$(".project-card[data-category]");

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.dataset.filter;
        projectCards.forEach((card) => {
          if (category === "all" || card.dataset.category.includes(category)) {
            card.style.display = "flex";
            card.classList.add("in");
          } else {
            card.style.display = "none";
          }
        });
      });
    });

    // Copy Email to Clipboard
    const copyEmailButtons = $$("[data-copy-email]");
    copyEmailButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const email = btn.dataset.copyEmail || "abdallamohamed8354@gmail.com";
        navigator.clipboard.writeText(email).then(
          () => showToast("✓ Email copied to clipboard!"),
          () => showToast("Could not copy email automatically.")
        );
      });
    });

  
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const btn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Sending...";
    status.textContent = "";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        status.textContent = "✅ Message sent! I'll get back to you soon.";
        form.reset();
      } else {
        status.textContent = "❌ Something went wrong. Please try again.";
      }
    } catch (err) {
      status.textContent = "❌ Network error. Please try again.";
    }

    btn.disabled = false;
    btn.textContent = "Send Message ✉";
  });
  };

  /* ------------------------------------------------------------------------
     INITIALIZE EVERYTHING ON DOM READY
     ------------------------------------------------------------------------ */
  const init = () => {
    initTheme();
    initLoader();
    initScrollEffects();
    initMobileMenu();
    initTypingEffect();
    initScrollReveal();
    initScrollSpy();
    initInteractiveFeatures();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
