#!/usr/bin/env bash
#
# Rsync the built site to the production nginx host. Config lives in
# scripts/deploy.env (gitignored). See CLAUDE.md "Deployment".
#

set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
env_file="$here/deploy.env"

if [ -f "$env_file" ]; then
  # shellcheck disable=SC1090
  . "$env_file"
else
  echo "deploy.sh: $env_file missing — copy deploy.env.example and fill it in." >&2
  exit 1
fi

: "${DOCS_DEPLOY_HOST:?DOCS_DEPLOY_HOST unset (see CLAUDE.md)}"
: "${DOCS_DEPLOY_PATH:?DOCS_DEPLOY_PATH unset (see CLAUDE.md)}"
: "${DOCS_DEPLOY_KEY:?DOCS_DEPLOY_KEY unset (see CLAUDE.md)}"

build_dir="$here/../build"
if [ ! -d "$build_dir" ]; then
  echo "deploy.sh: $build_dir does not exist — run 'npm run build' first." >&2
  exit 1
fi

rsync -avz --delete \
  -e "ssh -i $DOCS_DEPLOY_KEY -o ConnectTimeout=20" \
  "$build_dir/" "$DOCS_DEPLOY_HOST:$DOCS_DEPLOY_PATH"
