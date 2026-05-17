#!/usr/bin/env bash
# Reset the demo: destroy Checkly resources and restore the repo to origin/main.
# Preserves .env and node_modules (gitignored). Does NOT touch jsonmap fixtures.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Destroying Checkly resources"
npx checkly destroy --force

echo "==> Fetching origin/main"
git fetch origin main

echo "==> Resetting tracked files to origin/main"
git reset --hard origin/main

echo "==> Removing untracked files (keeps .env, node_modules — gitignored)"
git clean -fd

echo "==> Done. Repo matches origin/main; .env preserved; fixtures untouched."
