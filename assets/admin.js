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

  /* "ratio" ist das Seitenverhältnis, in dem das Bild auf der Webseite
     beschnitten wird – die Ausschnitt-Vorschau benutzt exakt denselben Wert. */
  var BILD_FELDER = [
    { key: "img_praxis_team", label: "Foto: Praxis-Team", ratio: 4 / 3, hinweis: "Erscheint bei „Praxis & Team“ – Querformat ca. 4:3." },
    { key: "img_physio", label: "Foto: Physiotherapie", ratio: 4 / 3, hinweis: "Erscheint im Bereich Physiotherapie – Querformat ca. 4:3." },
    { key: "img_wellness", label: "Foto: Massage & Wellness", ratio: 21 / 6, hinweis: "Breites Titelbild – Querformat ca. 21:6." },
    { key: "img_hyaluron", label: "Foto: Hyaluron", ratio: 21 / 6, hinweis: "Breites Titelbild – Querformat ca. 21:6." },
    { key: "img_aesthetics_logo", label: "Logo: Aesthetics-Seite", ratio: 1, hinweis: "Erscheint oben auf der Aesthetics-Unterseite – am besten quadratisch." },
    { key: "img_angebot", label: "Foto: Aktuelles Angebot", ratio: 9 / 10, hinweis: "Erscheint bei „Aktuelle Angebote“ auf der Aesthetics-Seite – Hochformat ca. 9:10." }
  ];

  /* Große Handy-Fotos werden vor dem Hochladen verkleinert. Grund: die Datei
     wird als Base64 im JSON-Body verschickt (+33 % Größe) und Netlify lehnt
     Anfragen über ~6 MB ab, bevor sie überhaupt im Backend ankommen. */
  var MAX_KANTE = 2000;
  var JPEG_QUALITAET = 0.85;
  var PNG_GRENZE_BYTES = 3 * 1024 * 1024;

  var passwort = sessionStorage.getItem("admin_pw") || "";
  var aktuellerInhalt = { text: {}, images: {}, framing: {} };

  var loginEl = document.getElementById("login");
  var editorEl = document.getElementById("editor");
  var loginFehlerEl = document.getElementById("loginFehler");

  /* ---------- Hilfsfunktionen ---------- */

  /* Antworten robust lesen: liefert der Server (oder Netlify selbst) HTML statt
     JSON – etwa bei "Datei zu groß" –, gab es früher nur "Verbindung
     fehlgeschlagen". Jetzt kommt eine Meldung, die den Grund benennt. */
  function antwortLesen(r) {
    return r.text().then(function (roh) {
      var daten = null;
      try { daten = JSON.parse(roh); } catch (e) { daten = null; }
      if (daten) return { ok: r.ok, d: daten };
      var meldung;
      if (r.status === 413) meldung = "Die Datei ist zu groß für den Server.";
      else if (r.status === 429) meldung = "Zu viele Versuche. Bitte 15 Minuten warten.";
      else if (r.status === 401) meldung = "Falsches Passwort. Bitte neu anmelden.";
      else meldung = "Unerwartete Antwort vom Server (Status " + r.status + ").";
      return { ok: false, d: { ok: false, error: meldung } };
    });
  }

  function istSvg(pfad) {
    return /\.svg(\?|$)/i.test(pfad || "");
  }

  function framingVon(key) {
    var w = aktuellerInhalt.framing && aktuellerInhalt.framing[key];
    return {
      x: w && typeof w.x === "number" ? w.x : 50,
      y: w && typeof w.y === "number" ? w.y : 50,
      zoom: w && typeof w.zoom === "number" ? w.zoom : 1
    };
  }

  /* Muss identisch zu applyFraming() in assets/content-loader.js sein,
     sonst zeigt die Vorschau etwas anderes als die Webseite. */
  function framingAnwenden(imgEl, werte) {
    imgEl.style.objectPosition = werte.x + "% " + werte.y + "%";
    imgEl.style.transformOrigin = werte.x + "% " + werte.y + "%";
    imgEl.style.transform = werte.zoom === 1 ? "" : "scale(" + werte.zoom + ")";
  }

  /* Prüft, ob eine Bild-URL tatsächlich ladbar ist. Damit fällt sofort auf,
     wenn das Hochladen zwar gemeldet wird, das Bild aber nicht ausgeliefert
     werden kann (dann bliebe es auf der Webseite unsichtbar). */
  function bildErreichbar(pfad) {
    return new Promise(function (resolve) {
      var pruef = new Image();
      pruef.onload = function () { resolve(true); };
      pruef.onerror = function () { resolve(false); };
      pruef.src = pfad;
    });
  }

  function dateiAlsDataUrl(datei) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error("Datei konnte nicht gelesen werden")); };
      reader.readAsDataURL(datei);
    });
  }

  function endungTauschen(dateiname, neueEndung) {
    var punkt = dateiname.lastIndexOf(".");
    var basis = punkt === -1 ? dateiname : dateiname.slice(0, punkt);
    return (basis || "bild") + neueEndung;
  }

  /* Liefert { data, filename } – bei SVG unverändert, sonst herunterskaliert.
     PNG bleibt PNG (Transparenz), außer das Ergebnis wäre zu groß. */
  function bildVorbereiten(datei) {
    if (datei.type === "image/svg+xml") {
      return dateiAlsDataUrl(datei).then(function (data) {
        return { data: data, filename: datei.name };
      });
    }

    // Die Datei wird als data:-URL geladen, nicht über URL.createObjectURL():
    // die Content-Security-Policy in netlify.toml erlaubt bei img-src nur
    // 'self' und data:, eine blob:-URL würde der Browser blockieren.
    return dateiAlsDataUrl(datei).then(function (quelle) {
      return new Promise(function (resolve, reject) {
        var bild = new Image();

        bild.onload = function () {
          var faktor = Math.min(1, MAX_KANTE / Math.max(bild.naturalWidth, bild.naturalHeight));
          var breite = Math.max(1, Math.round(bild.naturalWidth * faktor));
          var hoehe = Math.max(1, Math.round(bild.naturalHeight * faktor));

          var canvas = document.createElement("canvas");
          canvas.width = breite;
          canvas.height = hoehe;
          var ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Bild konnte nicht verarbeitet werden")); return; }
          ctx.drawImage(bild, 0, 0, breite, hoehe);

          var data;
          if (datei.type === "image/png") {
            data = canvas.toDataURL("image/png");
            if (data.length * 0.75 <= PNG_GRENZE_BYTES) {
              resolve({ data: data, filename: endungTauschen(datei.name, ".png") });
              return;
            }
          }
          data = canvas.toDataURL("image/jpeg", JPEG_QUALITAET);
          resolve({ data: data, filename: endungTauschen(datei.name, ".jpg") });
        };

        bild.onerror = function () {
          reject(new Error("Datei ist kein lesbares Bild"));
        };

        bild.src = quelle;
      });
    });
  }

  /* ---------- Textfelder ---------- */

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

  /* ---------- Bilder ---------- */

  function baueBilder(images) {
    var container = document.getElementById("bilderListe");
    container.innerHTML = "";
    BILD_FELDER.forEach(function (feld) {
      var karte = document.createElement("div");
      karte.className = "bild-karte";

      var vorschau = document.createElement("div");
      vorschau.className = "vorschau";
      var img = document.createElement("img");
      var pfad = images[feld.key] || "";
      if (pfad) img.src = pfad;
      img.alt = feld.label;
      framingAnwenden(img, framingVon(feld.key));
      vorschau.appendChild(img);
      karte.appendChild(vorschau);

      var rechts = document.createElement("div");

      var titel = document.createElement("div");
      titel.className = "bild-titel";
      titel.textContent = feld.label;
      rechts.appendChild(titel);

      var hinweis = document.createElement("div");
      hinweis.className = "hinweis";
      hinweis.textContent = feld.hinweis + " Erlaubt: JPG, PNG, WEBP, SVG. Große Fotos werden automatisch verkleinert.";
      rechts.appendChild(hinweis);

      var fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/png,image/jpeg,image/webp,image/svg+xml";
      rechts.appendChild(fileInput);

      var aktionen = document.createElement("div");
      aktionen.className = "bild-aktionen";

      var ausrichtenButton = document.createElement("button");
      ausrichtenButton.type = "button";
      ausrichtenButton.className = "btn btn-hell";
      ausrichtenButton.textContent = "Ausschnitt anpassen";
      // Bei den SVG-Platzhaltern ergibt Ausrichten keinen Sinn – erst anbieten,
      // sobald ein echtes Foto hochgeladen wurde.
      ausrichtenButton.hidden = !pfad || istSvg(pfad);
      ausrichtenButton.addEventListener("click", function () {
        oeffneAusschnitt(feld, img);
      });
      aktionen.appendChild(ausrichtenButton);

      var status = document.createElement("span");
      status.className = "status";
      aktionen.appendChild(status);

      rechts.appendChild(aktionen);

      fileInput.addEventListener("change", function () {
        var datei = fileInput.files[0];
        if (!datei) return;
        status.textContent = "Bild wird vorbereitet …";
        status.className = "status";

        bildVorbereiten(datei)
          .then(function (vorbereitet) {
            status.textContent = "Wird hochgeladen …";
            return fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                password: passwort,
                key: feld.key,
                filename: vorbereitet.filename,
                data: vorbereitet.data
              })
            });
          })
          .then(antwortLesen)
          .then(function (res) {
            if (!res.ok || !res.d.ok) {
              status.textContent = res.d.error || "Fehler beim Hochladen";
              status.className = "status fehler";
              return;
            }
            status.textContent = "Wird geprüft …";
            return bildErreichbar(res.d.path).then(function (erreichbar) {
              if (!erreichbar) {
                status.textContent = "Gespeichert, aber das Bild lässt sich nicht abrufen – bitte melden.";
                status.className = "status fehler";
                return;
              }
              img.src = res.d.path;
              aktuellerInhalt.images[feld.key] = res.d.path;
              // Neues Bild, neuer Ausschnitt: auf Mitte zurücksetzen.
              if (aktuellerInhalt.framing) delete aktuellerInhalt.framing[feld.key];
              framingAnwenden(img, framingVon(feld.key));
              ausrichtenButton.hidden = istSvg(res.d.path);
              status.textContent = "Gespeichert ✓";
              status.className = "status ok";
            });
          })
          .catch(function (fehler) {
            status.textContent = (fehler && fehler.message) || "Verbindung fehlgeschlagen";
            status.className = "status fehler";
          });
      });

      karte.appendChild(rechts);
      container.appendChild(karte);
    });
  }

  /* ---------- Ausschnitt-Werkzeug ---------- */

  var modal = document.getElementById("ausschnittModal");
  var buehne = document.getElementById("ausschnittRahmen");
  var buehneBild = document.getElementById("ausschnittBild");
  var zoomRegler = document.getElementById("ausschnittZoom");
  var ausschnittStatus = document.getElementById("ausschnittStatus");
  var ausschnittTitel = document.getElementById("ausschnittTitel");

  var aktivesFeld = null;
  var aktiveWerte = { x: 50, y: 50, zoom: 1 };
  var aktivesVorschauBild = null;
  var zieht = false;
  var letzteX = 0;
  var letzteY = 0;

  function begrenze(wert) {
    return Math.min(100, Math.max(0, wert));
  }

  function zeichneAusschnitt() {
    framingAnwenden(buehneBild, aktiveWerte);
  }

  function oeffneAusschnitt(feld, vorschauBild) {
    aktivesFeld = feld;
    aktivesVorschauBild = vorschauBild;
    aktiveWerte = framingVon(feld.key);

    ausschnittTitel.textContent = "Ausschnitt: " + feld.label;
    buehne.style.aspectRatio = String(feld.ratio);
    buehneBild.src = aktuellerInhalt.images[feld.key] || "";
    zoomRegler.value = String(aktiveWerte.zoom);
    ausschnittStatus.textContent = "";
    ausschnittStatus.className = "status";
    zeichneAusschnitt();
    modal.hidden = false;
  }

  function schliesseAusschnitt() {
    modal.hidden = true;
    aktivesFeld = null;
    aktivesVorschauBild = null;
    zieht = false;
  }

  buehne.addEventListener("pointerdown", function (e) {
    zieht = true;
    letzteX = e.clientX;
    letzteY = e.clientY;
    buehne.classList.add("zieht");
    buehne.setPointerCapture(e.pointerId);
  });

  buehne.addEventListener("pointermove", function (e) {
    if (!zieht) return;
    var dx = e.clientX - letzteX;
    var dy = e.clientY - letzteY;
    letzteX = e.clientX;
    letzteY = e.clientY;
    // Mausbewegung nach rechts schiebt das Bild nach rechts, der sichtbare
    // Ausschnitt wandert also nach links – daher das Minus.
    aktiveWerte.x = begrenze(aktiveWerte.x - (dx / buehne.clientWidth) * 100 / aktiveWerte.zoom);
    aktiveWerte.y = begrenze(aktiveWerte.y - (dy / buehne.clientHeight) * 100 / aktiveWerte.zoom);
    zeichneAusschnitt();
  });

  function beendeZiehen(e) {
    if (!zieht) return;
    zieht = false;
    buehne.classList.remove("zieht");
    if (e && e.pointerId !== undefined && buehne.hasPointerCapture(e.pointerId)) {
      buehne.releasePointerCapture(e.pointerId);
    }
  }
  buehne.addEventListener("pointerup", beendeZiehen);
  buehne.addEventListener("pointercancel", beendeZiehen);

  zoomRegler.addEventListener("input", function () {
    aktiveWerte.zoom = parseFloat(zoomRegler.value) || 1;
    zeichneAusschnitt();
  });

  document.getElementById("ausschnittZuruecksetzen").addEventListener("click", function () {
    aktiveWerte = { x: 50, y: 50, zoom: 1 };
    zoomRegler.value = "1";
    zeichneAusschnitt();
  });

  document.getElementById("ausschnittAbbrechen").addEventListener("click", schliesseAusschnitt);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) schliesseAusschnitt();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) schliesseAusschnitt();
  });

  document.getElementById("ausschnittSpeichern").addEventListener("click", function () {
    if (!aktivesFeld) return;
    var feldKey = aktivesFeld.key;
    var werte = { x: aktiveWerte.x, y: aktiveWerte.y, zoom: aktiveWerte.zoom };
    var vorschauBild = aktivesVorschauBild;

    ausschnittStatus.textContent = "Wird gespeichert …";
    ausschnittStatus.className = "status";

    var framing = {};
    framing[feldKey] = werte;

    fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwort, framing: framing })
    })
      .then(antwortLesen)
      .then(function (res) {
        if (!res.ok || !res.d.ok) {
          ausschnittStatus.textContent = res.d.error || "Fehler beim Speichern";
          ausschnittStatus.className = "status fehler";
          return;
        }
        if (!aktuellerInhalt.framing) aktuellerInhalt.framing = {};
        aktuellerInhalt.framing[feldKey] = werte;
        if (vorschauBild) framingAnwenden(vorschauBild, werte);
        schliesseAusschnitt();
      })
      .catch(function () {
        ausschnittStatus.textContent = "Verbindung zum Server fehlgeschlagen";
        ausschnittStatus.className = "status fehler";
      });
  });

  /* ---------- Login & Speichern ---------- */

  function zeigeEditor() {
    loginEl.hidden = true;
    editorEl.hidden = false;
    ladeInhalt().then(function (data) {
      aktuellerInhalt = {
        text: data.text || {},
        images: data.images || {},
        framing: data.framing || {}
      };
      baueTextGruppen(aktuellerInhalt.text);
      baueBilder(aktuellerInhalt.images);
    });
  }

  function ladeInhalt() {
    return fetch("/api/content", { cache: "no-store" }).then(function (r) { return r.json(); });
  }

  document.getElementById("loginButton").addEventListener("click", function () {
    var eingabe = document.getElementById("loginPasswort").value;
    loginFehlerEl.textContent = "";
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: eingabe })
    })
      .then(antwortLesen)
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
      .then(antwortLesen)
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
      .then(antwortLesen)
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
