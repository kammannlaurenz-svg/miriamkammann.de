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

  /* ---------- Kontakt-Popup (Anrufen / WhatsApp) ---------- */
  var telLinks = document.querySelectorAll("[data-tel-href]");
  if (telLinks.length) {
    var waNachricht = "Hallo, ich würde gerne einen Termin vereinbaren.";
    var modal = null;
    var telButton = null;
    var waButton = null;
    var nummerAnzeige = null;
    var zuletztFokussiert = null;

    var telSymbol =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    var waSymbol =
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.1 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1 14.6-11.62 9.34 9.34 0 0 1 2.75 6.65c0 5.18-4.22 9.39-9.4 9.39zm7.99-17.38A11.35 11.35 0 0 0 12.05.75C5.85.75.8 5.8.8 12a11.2 11.2 0 0 0 1.53 5.66L.7 23.5l5.98-1.57a11.24 11.24 0 0 0 5.37 1.37h.01c6.2 0 11.25-5.05 11.25-11.25a11.2 11.2 0 0 0-3.28-7.93z"/></svg>';

    function baueModal() {
      var el = document.createElement("div");
      el.className = "kontakt-modal";
      el.id = "kontaktModal";
      el.setAttribute("hidden", "");
      el.innerHTML =
        '<div class="kontakt-modal-overlay" data-schliessen></div>' +
        '<div class="kontakt-modal-box" role="dialog" aria-modal="true" aria-labelledby="kontaktModalTitel">' +
        '<button type="button" class="kontakt-modal-schliessen" data-schliessen aria-label="Schließen">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
        "</button>" +
        '<h2 id="kontaktModalTitel">Termin vereinbaren</h2>' +
        '<p class="kontakt-modal-text">Rufen Sie uns an oder schreiben Sie uns bei WhatsApp – wir freuen uns auf Sie.</p>' +
        '<a class="btn btn-primaer kontakt-modal-btn" data-tel-ziel>' + telSymbol + '<span>Anrufen</span></a>' +
        '<a class="btn btn-hell kontakt-modal-btn kontakt-modal-wa" data-wa-ziel target="_blank" rel="noopener">' + waSymbol + '<span>WhatsApp schreiben</span></a>' +
        '<p class="kontakt-modal-nr" data-nr-anzeige></p>' +
        "</div>";
      document.body.appendChild(el);

      telButton = el.querySelector("[data-tel-ziel]");
      waButton = el.querySelector("[data-wa-ziel]");
      nummerAnzeige = el.querySelector("[data-nr-anzeige]");

      el.querySelectorAll("[data-schliessen]").forEach(function (s) {
        s.addEventListener("click", schliesse);
      });
      return el;
    }

    function aktuelleTelefonnummer() {
      /* href der Kontaktlinks ist tel:+49… und wird vom content-loader aktuell gehalten */
      var href = telLinks[0].getAttribute("href") || "";
      var digits = href.replace(/[^\d]/g, "");
      var anzeige = "";
      var span = document.querySelector('[data-key="telefon"]');
      if (span && span.textContent.trim()) anzeige = span.textContent.trim();
      return { digits: digits, href: href, anzeige: anzeige || href.replace(/^tel:/, "") };
    }

    function oeffne(ausloeser) {
      if (!modal) modal = baueModal();
      var nr = aktuelleTelefonnummer();
      telButton.setAttribute("href", nr.href || "tel:");
      waButton.setAttribute(
        "href",
        "https://wa.me/" + nr.digits + "?text=" + encodeURIComponent(waNachricht)
      );
      nummerAnzeige.textContent = nr.anzeige;
      zuletztFokussiert = ausloeser || document.activeElement;
      modal.removeAttribute("hidden");
      document.body.classList.add("modal-offen");
      requestAnimationFrame(function () {
        modal.classList.add("sichtbar");
      });
      telButton.focus();
    }

    function schliesse() {
      if (!modal) return;
      modal.classList.remove("sichtbar");
      document.body.classList.remove("modal-offen");
      var box = modal;
      window.setTimeout(function () {
        box.setAttribute("hidden", "");
      }, 200);
      if (zuletztFokussiert && typeof zuletztFokussiert.focus === "function") {
        zuletztFokussiert.focus();
      }
    }

    telLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        oeffne(link);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && !modal.hasAttribute("hidden")) schliesse();
    });
  }
})();
