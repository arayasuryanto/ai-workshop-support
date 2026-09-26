#!/usr/bin/env bash
# Build the React app (app/) and publish it to https://workshoplab.dockbay.xyz
# Mirrors app/dist into the rays-dockbay doc-root for this subdomain only, then verifies live.
set -euo pipefail
cd "$(dirname "$0")/app"
npx vite build >/dev/null
URL="https://workshoplab.dockbay.xyz"; D="/home/rays-dockbay/web/workshoplab.dockbay.xyz/public_html/"
rsync -az --delete --no-perms --no-owner --no-group -e "ssh -o ConnectTimeout=15" dist/ "kg-vps:$D"
ssh kg-vps "chown -R rays-dockbay:www-data $D; find $D -type d -exec chmod 755 {} \; ; find $D -type f -exec chmod 644 {} \;"
BODY=$(curl -s --max-time 25 "$URL/?cb=$RANDOM"); JS=$(printf '%s' "$BODY" | grep -o 'assets/index-[^"]*\.js' | head -1)
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$URL/$JS")
printf '%s' "$BODY" | grep -q "Workshop AI PAM Jaya" && [ "$CODE" = 200 ] && echo "OK live -> $URL ($JS)" || { echo "FAIL" >&2; exit 1; }
