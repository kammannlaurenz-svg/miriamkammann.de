/* Physiotherapie Miriam Kammann – Admin-Tool (Inhalte bearbeiten) */
(function () {
  "use strict";

  var TEXT_GRUPPEN = [
    { titel: "Startbereich (Hero)", felder: [
      { key: "hero_eyebrow", label: "Kicker-Text über der Überschrift", typ: "text" },
      { key: "hero_h1", label: "Überschrift", typ: "text", hinweis: "Wort in *Sternchen* wird kursiv dargestellt." },
      { key: "hero_text", label: "Einleitungstext", typ: "textarea" },
      { key: "hero_fakt1", label: "Kurzfakt 1 (Uhr-Symbol)", typ: "text" },
      { key: "hero_fakt2", label: "Kurzfakt 2 (Haus-Symbol)", typ: "text" },
      { key: "hero_fakt3", label: "Kurzfakt 3 (Herz-Symbol)", typ: "text" }
    ]},
    { titel: "Kontaktdaten (gilt für die ganze Seite)", felder: [
      { key: "telefon", label: "Telefonnummer", typ: "text" },
      { key: "fax", label: "Fax", typ: "text" },
      { key: "email", label: "E-Mail-Adresse", typ: "text" },
      { key: "adresse_strasse", label: "Straße & Hausnummer", typ: "text" },
      { key: "adresse_ort", label: "PLZ & Ort", typ: "text" }
    ]},
    { titel: "Öffnungszeiten", felder: [
      { key: "hours_mo", label: "Montag", typ: "text" },
      { key: "hours_di", label: "Dienstag", typ: "text" },
      { key: "hours_mi", label: "Mittwoch", typ: "text" },
      { key: "hours_do", label: "Donnerstag", typ: "text" },
      { key: "hours_fr", label: "Freitag", typ: "text" },
      { key: "hours_we", label: "Samstag & Sonntag", typ: "text" }
    ]},
    { titel: "Physiotherapie", felder: [
      { key: "physio_eyebrow", label: "Kicker-Text", typ: "text" },
      { key: "physio_h2", label: "Überschrift", typ: "text" },
      { key: "physio_intro", label: "Einleitungstext", typ: "textarea" },
      { key: "physio_beschwerden_intro", label: "Satz über der Beschwerden-Liste", typ: "textarea" }
    ]},
    { titel: "Massage & Wellness", felder: [
      { key: "wellness_eyebrow", label: "Kicker-Text", typ: "text" },
      { key: "wellness_h2", label: "Überschrift", typ: "text" },
      { key: "wellness_intro", label: "Einleitungstext", typ: "textarea" },
      { key: "wellness_featured_text", label: "Beschreibung Hot-Stone-Massage", typ: "textarea" }
    ]},
    { titel: "Preise – Massage & Wellness", felder: [
      { key: "wellness_hotstone_preis", label: "Preis: Hot-Stone-Massage", typ: "text", hinweis: "z. B. 69 €" },
      { key: "wellness_massage_waerme_preis", label: "Preis: Klassische Massage & Wärme", typ: "text", hinweis: "z. B. 44,50 €" },
      { key: "wellness_massage_waerme_abo", label: "6er-Abo-Preis: Klassische Massage & Wärme", typ: "text", hinweis: "z. B. Im 6er-Abo: 260,00 €" },
      { key: "wellness_massage_preis", label: "Preis: Massage", typ: "text", hinweis: "z. B. 29 €" },
      { key: "wellness_massage_abo", label: "6er-Abo-Preis: Massage", typ: "text", hinweis: "z. B. Im 6er-Abo: 170,00 €" },
      { key: "wellness_lymphdrainage_preis", label: "Preis: Lymphdrainage", typ: "text", hinweis: "z. B. 29 €" }
    ]},
    { titel: "Aesthetics-Teaser (Startseite)", felder: [
      { key: "aesthetics_teaser_h2", label: "Überschrift", typ: "text" },
      { key: "aesthetics_teaser_text", label: "Text", typ: "textarea" }
    ]},
    { titel: "Aesthetics-Seite (aesthetics.html)", felder: [
      { key: "hyaluron_eyebrow", label: "Kicker-Text", typ: "text" },
      { key: "hyaluron_h2", label: "Überschrift", typ: "text" },
      { key: "hyaluron_intro", label: "Einleitungstext", typ: "text" },
      { key: "hyaluron_text_intro", label: "Erster Absatz", typ: "textarea", hinweis: "Wort in **doppelten Sternchen** wird fett dargestellt." }
    ]},
    { titel: "Praxis & Team", felder: [
      { key: "praxis_eyebrow", label: "Kicker-Text", typ: "text" },
      { key: "praxis_h2", label: "Überschrift", typ: "text" },
      { key: "praxis_zitat", label: "Zitat", typ: "textarea" },
      { key: "praxis_zitat_name", label: "Name unter dem Zitat", typ: "text", hinweis: "Wort in **doppelten Sternchen** wird fett dargestellt." },
      { key: "praxis_text", label: "Beschreibungstext", typ: "textarea" }
    ]},
    { titel: "Jobs", felder: [
      { key: "jobs_h2", label: "Überschrift", typ: "text" },
      { key: "jobs_text", label: "Stellentext", typ: "textarea" }
    ]},
    { titel: "Kontaktbereich", felder: [
      { key: "kontakt_eyebrow", label: "Kicker-Text", typ: "text" },
      { key: "kontakt_h2", label: "Überschrift", typ: "text" },
      { key: "kontakt_intro", label: "Einleitungstext", typ: "text" },
      { key: "hinweis_text1", label: "Hinweis 1 (Termine)", typ: "textarea", hinweis: "Wort in **doppelten Sternchen** wird fett dargestellt." },
      { key: "hinweis_text2", label: "Hinweis 2 (Hausbesuche)", typ: "textarea", hinweis: "Wort in **doppelten Sternchen** wird fett dargestellt." }
    ]}
  ];

  var BILD_FELDER = [
    { key: "img_praxis_team", label: "Foto: Praxis-Team", hinweis: "Erscheint bei „Praxis & Team“ – Querformat ca. 4:3." },
    { key: "img_physio", label: "Foto: Physiotherapie", hinweis: "Breites Titelbild – Querformat ca. 21:6." },
    { key: "img_wellness", label: "Foto: Massage & Wellness", hinweis: "Breites Titelbild – Querformat ca. 21:6." },
    { key: "img_hyaluron", label: "Foto: Hyaluron", hinweis: "Breites Titelbild – Querformat ca. 21:6." },
    { key: "img_aesthetics_logo", label: "Logo: Aesthetics-Seite", hinweis: "Erscheint oben auf der Aesthetics-Unterseite – am besten quadratisch." }
  ];

  var passwort = sessionStorage.getItem("admin_pw") || "";
  var aktuellerInhalt = { text: {}, images: {} };

  var loginEl = document.getElementById("login");
  var editorEl = document.getElementById("editor");
  var loginFehlerEl = document.getElementById("loginFehler");

  function ladeInhalt() {
    return fetch("/api/content", { cache: "no-store" }).then(function (r) { return r.json(); });
  }

  function feldElement(feld, wert) {
    var wrapper = document.createElement("div");
    wrapper.className = "feld";
    var label = document.createElement("label");
    label.textContent = feld.label;
    wrapper.appendChild(label);

    var input = document.createElement(feld.typ === "textarea" ? "textarea" : "input");
    if (feld.typ !== "textarea") input.type = "text";
    input.value = wert || "";
    input.dataset.key = feld.key;
    wrapper.appendChild(input);

    if (feld.hinweis) {
      var hinweis = document.createElement("p");
      hinweis.className = "hinweis";
      hinweis.textContent = feld.hinweis;
      wrapper.appendChild(hinweis);
    }
    return wrapper;
  }

  function baueTextGruppen(text) {
    var container = document.getElementById("textGruppen");
    container.innerHTML = "";
    TEXT_GRUPPEN.forEach(function (gruppe, i) {
      var details = document.createElement("details");
      details.className = "gruppe";
      if (i === 0) details.open = true;
      var summary = document.createElement("summary");
      summary.textContent = gruppe.titel;
      details.appendChild(summary);
      var inhalt = document.createElement("div");
      inhalt.className = "gruppe-inhalt";
      gruppe.felder.forEach(function (feld) {
        inhalt.appendChild(feldElement(feld, text[feld.key]));
      });
      details.appendChild(inhalt);
      container.appendChild(details);
    });
  }

  function baueBilder(images) {
    var container = document.getElementById("bilderListe");
    container.innerHTML = "";
    BILD_FELDER.forEach(function (feld) {
      var karte = document.createElement("div");
      karte.className = "bild-karte";

      var img = document.createElement("img");
      img.src = images[feld.key] || "";
      img.alt = feld.label;
      karte.appendChild(img);

      var rechts = document.createElement("div");

      var titel = document.createElement("div");
      titel.className = "bild-titel";
      titel.textContent = feld.label;
      rechts.appendChild(titel);

      var hinweis = document.createElement("div");
      hinweis.className = "hinweis";
      hinweis.textContent = feld.hinweis + " Erlaubt: JPG, PNG, WEBP, SVG (max. 8 MB).";
      rechts.appendChild(hinweis);

      var fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/png,image/jpeg,image/webp,image/svg+xml";
      rechts.appendChild(fileInput);

      var status = document.createElement("span");
      status.className = "status";
      status.style.marginLeft = "10px";
      rechts.appendChild(status);

      fileInput.addEventListener("change", function () {
        var datei = fileInput.files[0];
        if (!datei) return;
        status.textContent = "Wird hochgeladen …";
        status.className = "status";
        var reader = new FileReader();
        reader.onload = function () {
          fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: passwort, key: feld.key, filename: datei.name, data: reader.result })
          })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
            .then(function (res) {
              if (!res.ok || !res.d.ok) {
                status.textContent = res.d.error || "Fehler beim Hochladen";
                status.className = "status fehler";
                return;
              }
              img.src = res.d.path;
              aktuellerInhalt.images[feld.key] = res.d.path;
              status.textContent = "Gespeichert ✓";
              status.className = "status ok";
            })
            .catch(function () {
              status.textContent = "Verbindung fehlgeschlagen";
              status.className = "status fehler";
            });
        };
        reader.readAsDataURL(datei);
      });

      karte.appendChild(rechts);
      container.appendChild(karte);
    });
  }

  function zeigeEditor() {
    loginEl.hidden = true;
    editorEl.hidden = false;
    ladeInhalt().then(function (data) {
      aktuellerInhalt = data;
      baueTextGruppen(data.text || {});
      baueBilder(data.images || {});
    });
  }

  document.getElementById("loginButton").addEventListener("click", function () {
    var eingabe = document.getElementById("loginPasswort").value;
    loginFehlerEl.textContent = "";
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: eingabe })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.ok) {
          loginFehlerEl.textContent = res.d.error || "Anmeldung fehlgeschlagen";
          return;
        }
        passwort = eingabe;
        sessionStorage.setItem("admin_pw", passwort);
        zeigeEditor();
      })
      .catch(function () {
        loginFehlerEl.textContent = "Verbindung zum Server fehlgeschlagen";
      });
  });

  document.getElementById("loginPasswort").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("loginButton").click();
  });

  document.getElementById("speichernButton").addEventListener("click", function () {
    var statusEl = document.getElementById("speichernStatus");
    var neueTexte = {};
    document.querySelectorAll("#textGruppen [data-key]").forEach(function (input) {
      neueTexte[input.dataset.key] = input.value;
    });
    statusEl.textContent = "Wird gespeichert …";
    statusEl.className = "status";
    fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwort, text: neueTexte })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.ok) {
          statusEl.textContent = res.d.error || "Fehler beim Speichern";
          statusEl.className = "status fehler";
          return;
        }
        statusEl.textContent = "Gespeichert ✓";
        statusEl.className = "status ok";
      })
      .catch(function () {
        statusEl.textContent = "Verbindung zum Server fehlgeschlagen";
        statusEl.className = "status fehler";
      });
  });

  document.getElementById("passwortAendernButton").addEventListener("click", function () {
    var statusEl = document.getElementById("passwortStatus");
    var alt = document.getElementById("altesPasswort").value;
    var neu = document.getElementById("neuesPasswort").value;
    statusEl.textContent = "";
    fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: alt, new_password: neu })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.ok) {
          statusEl.textContent = res.d.error || "Fehler beim Ändern";
          statusEl.className = "status fehler";
          return;
        }
        passwort = neu;
        sessionStorage.setItem("admin_pw", passwort);
        document.getElementById("altesPasswort").value = "";
        document.getElementById("neuesPasswort").value = "";
        statusEl.textContent = "Passwort geändert ✓";
        statusEl.className = "status ok";
      })
      .catch(function () {
        statusEl.textContent = "Verbindung zum Server fehlgeschlagen";
        statusEl.className = "status fehler";
      });
  });

  if (passwort) {
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwort })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.ok) { zeigeEditor(); }
        else { sessionStorage.removeItem("admin_pw"); }
      })
      .catch(function () {});
  }
})();
