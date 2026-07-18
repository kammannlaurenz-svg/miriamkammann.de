#!/usr/bin/env python3
"""Lokaler Webserver mit einfacher Admin-API zum Bearbeiten von Texten & Fotos.

Ersetzt "python3 -m http.server": liefert die Webseite wie gewohnt aus und
bietet zusätzlich /admin.html mit passwortgeschützten Speicher-Endpunkten.
"""
import base64
import hashlib
import http.server
import json
import re
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

DEFAULT_PASSWORD = "Pusteblume2026"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    config = {"password_hash": hash_password(DEFAULT_PASSWORD)}
    CONFIG_FILE.write_text(json.dumps(config, indent=2), encoding="utf-8")
    return config


def save_config(config: dict) -> None:
    CONFIG_FILE.write_text(json.dumps(config, indent=2), encoding="utf-8")


def load_content() -> dict:
    if CONTENT_FILE.exists():
        return json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
    return {"text": {}, "images": {}}


def save_content(content: dict) -> None:
    CONTENT_FILE.write_text(json.dumps(content, indent=2, ensure_ascii=False), encoding="utf-8")


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
        return isinstance(password, str) and hash_password(password) == config.get("password_hash")

    def do_GET(self):
        if self.path.split("?")[0] in BLOCKED_PATHS:
            self._send_json(404, {"ok": False, "error": "Nicht gefunden"})
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
        if not self._check_password(payload):
            return self._send_json(401, {"ok": False, "error": "Falsches Passwort"})
        self._send_json(200, {"ok": True})

    def _handle_save(self):
        payload = self._read_json_body()
        if payload is None:
            return self._send_json(400, {"ok": False, "error": "Ungültige Anfrage"})
        if not self._check_password(payload):
            return self._send_json(401, {"ok": False, "error": "Falsches Passwort"})

        neue_texte = payload.get("text")
        if not isinstance(neue_texte, dict):
            return self._send_json(400, {"ok": False, "error": "Kein Textinhalt übergeben"})

        content = load_content()
        content.setdefault("text", {})
        for key, value in neue_texte.items():
            if isinstance(key, str) and isinstance(value, str):
                content["text"][key] = value
        save_content(content)
        self._send_json(200, {"ok": True})

    def _handle_upload(self):
        payload = self._read_json_body()
        if payload is None:
            return self._send_json(400, {"ok": False, "error": "Datei zu groß oder ungültig (max. 8 MB)"})
        if not self._check_password(payload):
            return self._send_json(401, {"ok": False, "error": "Falsches Passwort"})

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
        if not self._check_password(payload):
            return self._send_json(401, {"ok": False, "error": "Falsches Passwort"})

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
    print("Server läuft auf Port %d (Admin-Bereich unter /admin.html)" % port)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
