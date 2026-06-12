/* ============================================================
   KAMMY PHOTOGRAPHY — cinematic motion (GSAP + ScrollTrigger)
   - Hero lens intro (rolls into place, then a faint idle glint)
   - Scroll-linked lens journey (scrubbed, reverses on scroll up)
   - Section wipes (clip-path + drift + fade)
   - Title word-stagger reveals
   - Service / legal subhero zoom-settle
   Gated on GSAP being present and motion being allowed, so if a
   script fails to load the page simply stays static and readable.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap) return; // CSS leaves content visible, lens hidden

  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  var ST = window.ScrollTrigger;

  // Activates the CSS that hides reveal targets, word lines and shows the lens
  document.documentElement.classList.add("js-motion");

  var isMobile = window.matchMedia("(max-width: 820px)").matches ||
                 window.matchMedia("(pointer: coarse)").matches;

  /* ============================================================
     1. HERO LENS INTRO + scroll journey (homepage only)
     ============================================================ */
  var lens = document.getElementById("lens");
  var hero = document.getElementById("top");

  if (lens && hero) {
    var restX = isMobile ? "0vw" : "18vw";

    gsap.set(lens, { xPercent: -50, yPercent: -50, x: restX, y: "-2vh", rotation: 0, scale: 1, opacity: 0 });
    gsap.set([".hero__title", ".hero__sub", ".hero .btn-glass", ".hero__thumbs"], { opacity: 0, y: 26 });

    var intro = gsap.timeline();
    // lens rolls in once
    intro.fromTo(lens,
      { opacity: 0, scale: 1.5, rotation: -40, x: (isMobile ? "0vw" : "22vw"), y: "-6vh" },
      { opacity: 1, scale: 1, rotation: 0, x: restX, y: "-2vh", duration: 1.5, ease: "power3.out" });
    // heading + subtext stagger in after the lens settles
    intro.to(".hero__title", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.35")
         .to(".hero__sub", { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
         .to(".hero .btn-glass", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.35")
         .to(".hero__thumbs", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");

    // subtle idle glint, barely noticeable, independent of transforms
    gsap.to(".lens__glint", { opacity: 0.45, duration: 2.4, ease: "sine.inOut",
      yoyo: true, repeat: -1, delay: 1.6 });

    if (!isMobile) {
      // Scroll-scrubbed journey: hero -> about -> across -> park -> fade
      var journey = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "#top",
          start: "top top",
          endTrigger: "#services",
          end: "bottom top",
          scrub: 1
        }
      });
      journey
        .to(lens, { rotation: -140, scale: 0.72, x: "-12vw", y: "9vh" })          // hero -> about
        .to(lens, { rotation: -440, scale: 0.5, x: "28vw", y: "-4vh", opacity: 0.18 }) // about -> across -> park
        .to(lens, { opacity: 0 });                                                 // fade out after services
    } else {
      // Mobile: simple parallax drift + fade, no rolling journey
      gsap.set(lens, { opacity: 0.5 });
      gsap.to(lens, {
        y: "28vh", ease: "none",
        scrollTrigger: { trigger: "#top", start: "top top", endTrigger: "#services", end: "bottom top", scrub: 1 }
      });
      gsap.to(lens, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: "#services", start: "top center", end: "bottom top", scrub: 1 }
      });
    }
  }

  /* ============================================================
     2. TITLE WORD-STAGGER (run before reveals so we can skip them)
     ============================================================ */
  function splitWords(el) {
    var parts = el.textContent.split(/(\s+)/);
    el.textContent = "";
    parts.forEach(function (p) {
      if (p.trim() === "") { el.appendChild(document.createTextNode(p)); return; }
      var outer = document.createElement("span");
      outer.className = "word";
      var inner = document.createElement("span");
      inner.className = "word__inner";
      inner.textContent = p;
      outer.appendChild(inner);
      el.appendChild(outer);
    });
  }

  gsap.utils.toArray(".section-title, .subhero__title").forEach(function (title) {
    splitWords(title);
    title.style.opacity = "1";
    title.classList.add("word-split");
    gsap.fromTo(title.querySelectorAll(".word__inner"),
      { yPercent: 110 },
      {
        yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: title, start: "top 88%", toggleActions: "play none none none" }
      });
  });

  /* ============================================================
     3. SECTION REVEALS: clip-path wipe + drift + fade
     ============================================================ */
  gsap.utils.toArray(".reveal").forEach(function (el) {
    if (el.classList.contains("word-split")) return; // handled by word stagger
    gsap.fromTo(el,
      { opacity: 0, y: 42, clipPath: "inset(0 0 100% 0)" },
      {
        opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)",
        duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
      });
  });

  /* ============================================================
     4. SUBHERO ZOOM-SETTLE (service / legal pages)
     ============================================================ */
  var subbg = document.querySelector(".subhero__bg");
  if (subbg) {
    gsap.fromTo(subbg, { scale: 1.1 }, { scale: 1, duration: 1.4, ease: "power3.out" });
  }

  /* Recalculate trigger positions once images have loaded */
  if (ST) {
    window.addEventListener("load", function () { ST.refresh(); });
  }
})();
