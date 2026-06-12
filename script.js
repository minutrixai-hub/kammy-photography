/* ============================================================
   KAMMY PHOTOGRAPHY — base interactions
   (Reveals, lens and parallax live in motion.js; page
   transitions live in transition.js.)
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu: close after a link is tapped ---------- */
  var navToggle = document.getElementById("nav-toggle");
  if (navToggle) {
    document.querySelectorAll(".nav__links a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.checked = false;
      });
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var id = link.getAttribute("href");
    if (id === "#" || id.length < 2) return;
    link.addEventListener("click", function (e) {
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  /* ---------- Subtle 3D tilt on cards (desktop pointers only) ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var MAX_TILT = 7; // degrees
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var rect = null;
      card.addEventListener("mouseenter", function () {
        rect = card.getBoundingClientRect();
      });
      card.addEventListener("mousemove", function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + (px * MAX_TILT).toFixed(2) +
          "deg) rotateX(" + (-py * MAX_TILT).toFixed(2) +
          "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        rect = null;
        card.style.transform = "";
      });
    });
  }
})();
