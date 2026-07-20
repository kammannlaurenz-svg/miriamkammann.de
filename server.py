#!/usr/bin/env python3
"""Lokaler Webserver mit einfacher Admin-API zum Bearbeiten von Texten & Fotos.

Ersetzt "python3 -m http.server": liefert die Webseite wie gewohnt aus und
bietet zusätzlich /admin.html mit passwortgeschützten Speicher-Endpunkten.
"""
import base64
import hashlib
import hmac
import http.server
import json
import re
import secrets
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONTENT_FILE = ROOT / "content.json"
CONFIG_FILE = ROOT / "admin_config.json"
IMAGES_DIR = ROOT / "assets" / "images"

UPLOAD_MAX_BYTES = 8 * 1024 * 1024  # 8 MB
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".svg"}
BLOCKED_PATHS = {"/admin_config.json", "/server.py"}

MAX_LOGIN_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 15 * 60
FAILED_ATTEMPTS = {}  # ip -> (erster_versuch_ts, anzahl)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    # Kein fest einprogrammiertes Standardpasswort mehr (das stand vorher im
    # öffentlichen Repo im Klartext) – stattdessen wird beim ersten Start ein
    # zufälliges Passwort erzeugt und einmalig in der Konsole angezeigt.
    initial_password = secrets.token_urlsafe(9)
    config = {"password_hash": hash_password(initial_password)}
    CONFIG_FILE.write_text(json.dumps(config, indent=2), encoding="utf-8")
    print("=" * 60, flush=True)
    print("Erstes Admin-Passwort (bitte notieren, wird nur jetzt angezeigt):", flush=True)
    print("  " + initial_password, flush=True)
    print("Kann danach jederzeit in /admin.html geändert werden.", flush=True)
    print("=" * 60, flush=True)
    return config


def save_config(config: dict) -> None:
    CONFIG_FILE.write_text(json.dumps(config, indent=2), encoding="utf-8")


def load_content() -> dict:
    if CONTENT_FILE.exists():
        return json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
    return {"text": {}, "images": {}, "framing": {}}


def sanitize_framing(wert):
    """Bildausschnitt: x/y als Prozentwerte (object-position), zoom als Faktor.

    Werte werden hart begrenzt, damit über die API nichts Unsinniges ins CSS wandert.
    """
    if not isinstance(wert, dict):
        return None

    def zahl(v, minimum, maximum, standard):
        try:
            n = float(v)
        except (TypeError, ValueError):
            return standard
        if n != n or n in (float("inf"), float("-inf")):
            return standard
        return round(min(maximum, max(minimum, n)), 2)

    return {
        "x": zahl(wert.get("x"), 0, 100, 50),
        "y": zahl(wert.get("y"), 0, 100, 50),
        "zoom": zahl(wert.get("zoom"), 1, 3, 1),
    }


def save_content(content: dict) -> None:
    CONTENT_FILE.write_text(json.dumps(content, indent=2, ensure_ascii=False), encoding="utf-8")


def is_rate_limited(ip: str) -> bool:
    entry = FAILED_ATTEMPTS.get(ip)
    if not entry:
        return False
    first, count = entry
    if time.time() - first > LOGIN_WINDOW_SECONDS:
        return False
    return count >= MAX_LOGIN_ATTEMPTS


def record_failed_attempt(ip: str) -> None:
    now = time.time()
    first, count = FAILED_ATTEMPTS.get(ip, (now, 0))
    if now - first > LOGIN_WINDOW_SECONDS:
        first, count = now, 0
    FAILED_ATTEMPTS[ip] = (first, count + 1)


def clear_failed_attempts(ip: str) -> None:
    FAILED_ATTEMPTS.pop(ip, None)


def sanitize_if_svg(raw: bytes, ext: str) -> bytes:
    if ext != ".svg":
        return raw
    text = raw.decode("utf-8", errors="ignore")
    text = re.sub(r"<script[\s\S]*?</script>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\son\w+\s*=\s*\"[^\"]*\"", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\son\w+\s*=\s*'[^']*'", "", text, flags=re.IGNORECASE)
    text = re.sub(r"javascript:", "", text, flags=re.IGNORECASE)
    return text.encode("utf-8")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length <= 0 or length > UPLOAD_MAX_BYTES:
            return None
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return None

    def _check_password(self, payload) -> bool:
        config = load_config()
        password = (payload or {}).get("password", "")
        if not isinstance(password, str) or not password:
            return False
        return hmac.compare_digest(hash_password(password), config.get("password_hash", ""))

    def _require_auth(self, payload) -> bool:
        """Prüft Rate-Limit + Passwort, sendet bei Fehlschlag direkt die Antwort."""
        ip = self.client_address[0]
        if is_rate_limited(ip):
            self._send_json(429, {"ok": False, "error": "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen."})
            return False
        if not self._check_password(payload):
            record_failed_attempt(ip)
            self._send_json(401, {"ok": False, "error": "Falsches Passwort"})
            return False
        clear_failed_attempts(ip)
        return True

    def do_GET(self):
        pfad = self.path.split("?")[0]
        if pfad in BLOCKED_PATHS:
            self._send_json(404, {"ok": False, "error": "Nicht gefunden"})
            return
        if pfad == "/api/content":
            self._send_json(200, load_content())
            return
        super().do_GET()

    def do_POST(self):
        routen = {
            "/api/login": self._handle_login,
            "/api/save": self._handle_save,
            "/api/upload": self._handle_upload,
            "/api/change-password": self._handle_change_password,
        }
        handler = routen.get(self.path)
        if handler is None:
            self._send_json(404, {"ok": False, "error": "Unbekannter Endpunkt"})
            return
        handler()

    def _handle_login(self):
        payload = self._read_json_body()
        if payload is None:
            return self._send_json(400, {"ok": False, "error": "Ungültige Anfrage"})
        if not self._require_auth(payload):
            return
        self._send_json(200, {"ok": True})

    def _handle_save(self):
        payload = self._read_json_body()
        if payload is None:
            return self._send_json(400, {"ok": False, "error": "Ungültige Anfrage"})
        if not self._require_auth(payload):
            return

        neue_texte = payload.get("text")
        neues_framing = payload.get("framing")
        hat_texte = isinstance(neue_texte, dict)
        hat_framing = isinstance(neues_framing, dict)
        if not hat_texte and not hat_framing:
            return self._send_json(400, {"ok": False, "error": "Kein Inhalt übergeben"})

        content = load_content()
        content.setdefault("text", {})
        content.setdefault("framing", {})

        if hat_texte:
            for key, value in neue_texte.items():
                if isinstance(key, str) and isinstance(value, str):
                    content["text"][key] = value

        if hat_framing:
            for key, value in neues_framing.items():
                if not isinstance(key, str) or not re.fullmatch(r"[a-z0-9_]+", key):
                    continue
                sauber = sanitize_framing(value)
                if sauber:
                    content["framing"][key] = sauber

        save_content(content)
        self._send_json(200, {"ok": True})

    def _handle_upload(self):
        payload = self._read_json_body()
        if payload is None:
            return self._send_json(400, {"ok": False, "error": "Datei zu groß oder ungültig (max. 8 MB)"})
        if not self._require_auth(payload):
            return

        key = payload.get("key", "")
        filename = payload.get("filename", "")
        data_url = payload.get("data", "")

        if not re.fullmatch(r"[a-z0-9_]+", key or ""):
            return self._send_json(400, {"ok": False, "error": "Ungültiger Bildschlüssel"})

        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_IMAGE_EXT:
            return self._send_json(400, {"ok": False, "error": "Nicht erlaubtes Dateiformat. Erlaubt: JPG, PNG, WEBP, SVG"})

        match = re.match(r"^data:[^;]+;base64,(.+)$", data_url or "", re.DOTALL)
        if not match:
            return self._send_json(400, {"ok": False, "error": "Ungültige Bilddaten"})

        try:
            raw = base64.b64decode(match.group(1), validate=True)
        except Exception:
            return self._send_json(400, {"ok": False, "error": "Bilddaten konnten nicht gelesen werden"})

        if len(raw) > UPLOAD_MAX_BYTES:
            return self._send_json(400, {"ok": False, "error": "Datei zu groß (max. 8 MB)"})

        raw = sanitize_if_svg(raw, ext)

        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        for alte_ext in ALLOWED_IMAGE_EXT:
            alte_datei = IMAGES_DIR / (key + alte_ext)
            if alte_datei.exists():
                alte_datei.unlink()

        zieldatei = IMAGES_DIR / (key + ext)
        zieldatei.write_bytes(raw)

        relativer_pfad = "assets/images/%s%s?v=%d" % (key, ext, int(time.time()))

        content = load_content()
        content.setdefault("images", {})
        content["images"][key] = relativer_pfad
        save_content(content)

        self._send_json(200, {"ok": True, "path": relativer_pfad})

    def _handle_change_password(self):
        payload = self._read_json_body()
        if payload is None:
            return self._send_json(400, {"ok": False, "error": "Ungültige Anfrage"})
        if not self._require_auth(payload):
            return

        neues_passwort = payload.get("new_password", "")
        if not isinstance(neues_passwort, str) or len(neues_passwort) < 6:
            return self._send_json(400, {"ok": False, "error": "Neues Passwort muss mind. 6 Zeichen haben"})

        config = load_config()
        config["password_hash"] = hash_password(neues_passwort)
        save_config(config)
        self._send_json(200, {"ok": True})


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    load_config()
    load_content()
    httpd = http.server.ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print("Server läuft auf Port %d (Admin-Bereich unter /admin.html)" % port, flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
