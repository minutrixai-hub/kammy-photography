/* ============================================================
   KAMMY PHOTOGRAPHY — page transitions
   - First load / refresh: a spinning lens loader for ~2s
   - Internal navigation: a dark shutter sweeps closed, then the
     next page sweeps it open
   Pure vanilla + CSS transitions, no dependency on GSAP.
   Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var inServices = /\/services\//.test(location.pathname);
  var prefix = inServices ? "../" : "";

  /* ---------- Inject loader + shutter ---------- */
  var loader = document.createElement("div");
  loader.className = "loader";
  loader.id = "loader";
  loader.innerHTML =
    '<div class="loader__cam-wrap">' +
      '<svg class="loader__cam" viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
        '<rect x="16" y="40" width="88" height="58" rx="13" stroke="currentColor" stroke-width="3"/>' +
        '<path d="M44 40l8-13h16l8 13" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="60" cy="69" r="20" stroke="currentColor" stroke-width="3"/>' +
        '<circle cx="60" cy="69" r="9" stroke="currentColor" stroke-width="3"/>' +
        '<circle cx="88" cy="52" r="3" fill="currentColor"/>' +
      '</svg>' +
      '<span class="loader__spark"></span>' +
    '</div>' +
    '<div class="loader__label">Kammy Photography</div>';

  var shutter = document.createElement("div");
  shutter.className = "shutter";
  shutter.id = "shutter";
  shutter.setAttribute("aria-hidden", "true");

  document.body.appendChild(loader);
  document.body.appendChild(shutter);

  var navFlag = null;
  try { navFlag = sessionStorage.getItem("kammyNav"); } catch (e) {}

  /* ---------- Entrance ---------- */
  if (reduceMotion) {
    loader.classList.add("is-hidden");
  } else if (navFlag) {
    // Arrived from an internal link: continue the shutter, then open it.
    try { sessionStorage.removeItem("kammyNav"); } catch (e) {}
    loader.classList.add("is-hidden");
    shutter.style.transition = "none";
    shutter.style.transform = "translateY(0)";
    // force reflow so the next change animates
    void shutter.offsetHeight;
    requestAnimationFrame(function () {
      shutter.style.transition = "";
      shutter.classList.add("is-opening");
    });
  } else {
    // Fresh load / refresh: hold the rolling camera loader for ~1.2s.
    var minShow = 1200;
    var start = performance.now();
    var done = false;
    var hide = function () {
      if (done) return;
      done = true;
      loader.classList.add("is-hidden");
    };
    window.addEventListener("load", function () {
      var elapsed = performance.now() - start;
      setTimeout(hide, Math.max(0, minShow - elapsed));
    });
    // Safety net if 'load' never fires
    setTimeout(hide, minShow + 1000);
  }

  /* ---------- Internal link interception ---------- */
  if (!reduceMotion) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;

      var href = a.getAttribute("href");
      if (!href) return;
      var low = href.toLowerCase();
      if (low.charAt(0) === "#" ||
          low.indexOf("mailto:") === 0 ||
          low.indexOf("tel:") === 0 ||
          low.indexOf("javascript:") === 0) return;

      // External host (Instagram, etc.) -> let it behave normally
      if (a.hostname && a.hostname !== location.hostname) return;

      // Same page with only a hash change -> let the smooth scroll handle it
      if (a.pathname === location.pathname && a.hash) return;

      e.preventDefault();
      try { sessionStorage.setItem("kammyNav", "1"); } catch (err) {}
      shutter.classList.remove("is-opening");
      shutter.classList.add("is-closing");
      var go = function () { window.location.href = a.href; };
      var t = setTimeout(go, 600);
      shutter.addEventListener("transitionend", function once() {
        clearTimeout(t);
        go();
      }, { once: true });
    });
  }
})();
