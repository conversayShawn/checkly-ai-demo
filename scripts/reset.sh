#!/usr/bin/env bash
# Reset the demo: destroy deployed Checkly resources, remove the generated
# monitoring files, and clear local run artifacts — so the next demo run starts
# from the committed baseline.
#
# Generated files are removed with `git clean` scoped to the monitoring surface,
# which only touches UNTRACKED files. The pre-baked specs, CSS, and fixtures are
# committed, so they stay. Preserves .env and node_modules (both gitignored).
# Pass --keep-generated to leave the generated .check.ts files on disk for diffing.
#
# Upgrades the Checkly CLI to the latest release at the end. That rewrites
# package.json and package-lock.json — pass --no-upgrade when you want the
# working tree left clean for diffing.
#
# Usage:
#   npm run reset                    # destroy Checkly resources, remove generated files + artifacts, upgrade CLI
#   npm run reset -- --fixtures      # also DELETE the jsonmap fixtures
#   npm run reset -- --no-upgrade    # skip the CLI upgrade
#   npm run reset -- --keep-generated # leave generated .check.ts files on disk for diffing
set -euo pipefail

cd "$(dirname "$0")/.."

WITH_FIXTURES=false
UPGRADE=true
KEEP_GENERATED=false
for arg in "$@"; do
  case "$arg" in
    --fixtures) WITH_FIXTURES=true ;;
    --no-upgrade) UPGRADE=false ;;
    --keep-generated) KEEP_GENERATED=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

echo "==> Destroying Checkly resources"
npx checkly destroy --force

if [ "$WITH_FIXTURES" = true ]; then
  echo "==> Tearing down jsonmap fixtures"
  npm run teardown
else
  echo "==> Leaving jsonmap fixtures in place (pass --fixtures to remove them)"
fi

if [ "$KEEP_GENERATED" = true ]; then
  echo "==> Keeping generated monitoring files (--keep-generated)"
elif git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "==> Removing generated monitoring files (restoring committed baseline)"
  # Only removes UNTRACKED files under these paths; committed specs/CSS/fixtures stay.
  git clean -fd monitoring MONITORING.md
else
  echo "==> Not a git work tree — skipping generated-file cleanup" >&2
fi

echo "==> Clearing local run artifacts"
rm -rf .checkly test-results playwright-report

if [ "$UPGRADE" = true ]; then
  BEFORE=$(npx checkly --version 2>/dev/null | head -1 || echo "unknown")
  echo "==> Upgrading Checkly CLI (was: $BEFORE)"
  npm install checkly@latest
  echo "==> Now on: $(npx checkly --version 2>/dev/null | head -1)"
  echo "    package.json and package-lock.json were rewritten by this step."
else
  echo "==> Skipping CLI upgrade (--no-upgrade); working tree left clean"
fi

echo
echo "==> Done. Checkly account is clean and the repo is back to its committed baseline."
echo "    .env, node_modules, and all committed files (specs, CSS, fixtures) are untouched."
echo "    Generated .check.ts files were removed (pass --keep-generated to keep them)."
