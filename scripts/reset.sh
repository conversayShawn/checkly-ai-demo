#!/usr/bin/env bash
# Reset the demo: destroy deployed Checkly resources and clear local run artifacts.
#
# Deliberately does NOT touch git — no fetch, no reset, no clean. Generated
# .check.ts files stay on disk so they can be diffed and ported by hand.
# Preserves .env and node_modules.
#
# Upgrades the Checkly CLI to the latest release at the end. That rewrites
# package.json and package-lock.json — pass --no-upgrade when you want the
# working tree left clean for diffing.
#
# Usage:
#   npm run reset                 # destroy Checkly resources + artifacts, then upgrade CLI
#   npm run reset -- --fixtures   # also DELETE the jsonmap fixtures
#   npm run reset -- --no-upgrade # skip the CLI upgrade
set -euo pipefail

cd "$(dirname "$0")/.."

WITH_FIXTURES=false
UPGRADE=true
for arg in "$@"; do
  case "$arg" in
    --fixtures) WITH_FIXTURES=true ;;
    --no-upgrade) UPGRADE=false ;;
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
echo "==> Done. Checkly account is clean; .env, node_modules and all tracked/untracked"
echo "    files are untouched. Revert generated .check.ts files yourself when ready."
