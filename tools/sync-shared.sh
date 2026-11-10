#!/bin/sh
# Copies packages/shared (@fmot/shared: roles, permissions, workflows, the OpenAPI document and its types) from the API
# repository, which owns it, into this one. Usage: sh tools/sync-shared.sh [path to the API repository]
set -eu
api="${1:-../fmot-rail-tracker-api}"
[ -f "$api/packages/shared/package.json" ] || { echo "No packages/shared in $api: clone SchullGroup/FMOT-Project-Tracker-API there, or give its path." >&2; exit 1; }
rsync -a --delete --exclude node_modules --exclude dist "$api/packages/shared/" packages/shared/
echo "packages/shared copied from $api. Review with git diff, then commit."
