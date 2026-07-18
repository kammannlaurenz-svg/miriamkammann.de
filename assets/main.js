/* Physiotherapie Miriam Kammann – Interaktionen */
(function () {
  "use strict";

  /* ---------- Mobiles Menü ---------- */
  var header = document.getElementById("header");
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  if (navToggle && header && nav) {
    navToggle.addEventListener("click", function () {
      var offen = header.classList.toggle("nav-offen");
      navToggle.setAttribute("aria-expanded", offen ? "true" : "false");
      navToggle.setAttribute("aria-label", offen ? "Menü schließen" : "Menü öffnen");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        header.classList.remove("nav-offen");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll-Reveal ---------- */
  var revealElemente = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealElemente.length) {
    var beobachter = new IntersectionObserver(
      function (eintraege) {
        eintraege.forEach(function (eintrag) {
          if (eintrag.isIntersecting) {
            eintrag.target.classList.add("sichtbar");
            beobachter.unobserve(eintrag.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealElemente.forEach(function (el) { beobachter.observe(el); });
  } else {
    revealElemente.forEach(function (el) { el.classList.add("sichtbar"); });
  }

  /* ---------- Scrollspy: aktiven Nav-Punkt markieren ---------- */
  var navLinks = document.querySelectorAll(".nav a[href^='#']");
  var abschnitte = [];
  navLinks.forEach(function (link) {
    var ziel = document.querySelector(link.getAttribute("href"));
    if (ziel) abschnitte.push({ link: link, ziel: ziel });
  });

  function aktualisiereNav() {
    var pos = window.scrollY + 120;
    var aktiv = null;
    abschnitte.forEach(function (a) {
      if (a.ziel.offsetTop <= pos) aktiv = a;
    });
    abschnitte.forEach(function (a) {
      a.link.classList.toggle("aktiv", a === aktiv);
    });
  }
  window.addEventListener("scroll", aktualisiereNav, { passive: true });
  aktualisiereNav();

  /* ---------- Heutigen Wochentag in den Öffnungszeiten markieren ---------- */
  var zeiten = document.getElementById("zeiten");
  if (zeiten) {
    var heute = new Date().getDay(); // 0 = Sonntag … 6 = Samstag
    var eintrag = zeiten.querySelector('[data-tag="' + heute + '"]');
    if (!eintrag && (heute === 0 || heute === 6)) {
      eintrag = zeiten.querySelector('[data-tag="0"]');
    }
    if (eintrag) eintrag.classList.add("heute");
  }

  /* ---------- Jahreszahlen automatisch aktuell halten ---------- */
  var jahrElement = document.getElementById("jahr");
  if (jahrElement) jahrElement.textContent = new Date().getFullYear();

  var jahreZahl = document.getElementById("jahreZahl");
  if (jahreZahl) {
    var jahre = new Date().getFullYear() - 2011;
    if (jahre > 0) jahreZahl.textContent = jahre;
  }
})();
