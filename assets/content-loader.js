/* Lädt content.json und überschreibt Text- und Bildplätze mit data-key / data-img-key */
(function () {
  "use strict";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* Sehr einfaches Markdown: **fett** und *kursiv*, Zeilenumbrüche als <br> */
  function toHtml(s) {
    return escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  function telHref(display) {
    var digits = String(display).replace(/[^\d]/g, "");
    if (digits.charAt(0) === "0") digits = digits.slice(1);
    return "tel:+49" + digits;
  }

  function applyText(text) {
    Object.keys(text).forEach(function (key) {
      var wert = text[key];
      document.querySelectorAll('[data-key="' + key + '"]').forEach(function (el) {
        el.innerHTML = toHtml(wert);
      });
    });

    document.querySelectorAll("[data-tel-href]").forEach(function (el) {
      if (text.telefon) el.setAttribute("href", telHref(text.telefon));
    });

    document.querySelectorAll("[data-mail-href]").forEach(function (el) {
      if (!text.email) return;
      var bestehend = el.getAttribute("href") || "";
      var query = bestehend.indexOf("?") !== -1 ? bestehend.slice(bestehend.indexOf("?")) : "";
      el.setAttribute("href", "mailto:" + text.email + query);
    });

    document.querySelectorAll("[data-maps-href]").forEach(function (el) {
      if (!text.adresse_strasse || !text.adresse_ort) return;
      var query = encodeURIComponent(text.adresse_strasse + ", " + text.adresse_ort);
      el.setAttribute("href", "https://www.google.com/maps/search/?api=1&query=" + query);
    });
  }

  function applyImages(images) {
    Object.keys(images).forEach(function (key) {
      document.querySelectorAll('[data-img-key="' + key + '"]').forEach(function (el) {
        el.setAttribute("src", images[key]);
      });
    });
  }

  /* Bildausschnitt: x/y verschieben den sichtbaren Bereich, zoom vergrößert ihn.
     Muss identisch zur Vorschau im Admin-Tool sein (assets/admin.js). */
  function applyFraming(framing) {
    Object.keys(framing).forEach(function (key) {
      var werte = framing[key];
      if (!werte) return;
      var x = typeof werte.x === "number" ? werte.x : 50;
      var y = typeof werte.y === "number" ? werte.y : 50;
      var zoom = typeof werte.zoom === "number" ? werte.zoom : 1;
      document.querySelectorAll('[data-img-key="' + key + '"]').forEach(function (el) {
        el.style.objectPosition = x + "% " + y + "%";
        el.style.transformOrigin = x + "% " + y + "%";
        el.style.transform = zoom === 1 ? "" : "scale(" + zoom + ")";
      });
    });
  }

  fetch("/api/content", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      if (data.text) applyText(data.text);
      if (data.images) applyImages(data.images);
      if (data.framing) applyFraming(data.framing);
    })
    .catch(function () { /* content.json fehlt oder Seite läuft ohne Server – Standardinhalte bleiben stehen */ });
})();
