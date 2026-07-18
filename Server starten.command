#!/bin/bash
# Startet die Webseite im lokalen Netzwerk (Doppelklick genügt).
cd "$(dirname "$0")"

IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

echo "======================================================"
echo "  Physiotherapie Miriam Kammann – lokaler Webserver"
echo "======================================================"
echo
echo "  Auf diesem Mac:        http://localhost:8000"
if [ -n "$IP" ]; then
  echo "  Im WLAN (andere Geräte): http://$IP:8000"
else
  echo "  (Keine WLAN-IP gefunden – ist das WLAN an?)"
fi
echo
echo "  Inhalte bearbeiten:    http://localhost:8000/admin.html"
echo "  Zum Beenden dieses Fenster schließen oder Strg+C drücken."
echo "======================================================"
echo

python3 server.py 8000
