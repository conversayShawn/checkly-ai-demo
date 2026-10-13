#!/usr/bin/env bash
# Reset the demo: destroy deployed Checkly resources, restore the whole working
# tree to the current branch's last commit, and clear local run artifacts — so
# the next demo run starts from the committed baseline, whatever branch you're on.
#
# The restore is branch-agnostic by design: `git checkout -- .` reverts tracked
# edits and `git clean -fd` removes untracked files repo-wide. So generated
# monitoring files disappear on `main`, while committed content (pre-baked specs,
# CSS, and the terraform/ config on the demo/pw-terraform-* branches)
# is restored rather than deleted. Ignored paths are NOT touched — `git clean`
# runs without `-x`, so .env, node_modules, and .checkly survive.
# Pass --keep-generated to leave the working tree exactly as-is for diffing.
#
# Upgrades the Checkly CLI to the latest release at the end. That rewrites
# package.json and package-lock.json — pass --no-upgrade when you want the
# working tree left clean for diffing.
#
# Usage:
#   npm run reset                    # destroy Checkly resources, restore working tree + clear artifacts, upgrade CLI
#   npm run reset -- --no-upgrade    # skip the CLI upgrade
#   npm run reset -- --keep-generated # leave the working tree untouched for diffing
set -euo pipefail

cd "$(dirname "$0")/.."

UPGRADE=true
KEEP_GENERATED=false
for arg in "$@"; do
  case "$arg" in
    --no-upgrade) UPGRADE=false ;;
    --keep-generated) KEEP_GENERATED=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

# This script is itself tracked, so the restore step below would rewrite it while
# bash is still reading it — bash reads scripts incrementally and would execute
# garbage from the new byte offset. Refuse to run with uncommitted edits to self.
if [ "$KEEP_GENERATED" = false ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if ! git diff --quiet -- scripts/reset.sh; then
    echo "scripts/reset.sh has uncommitted changes — commit or stash them first," >&2
    echo "or pass --keep-generated to skip the working-tree restore." >&2
    exit 1
  fi
fi

echo "==> Destroying Checkly resources"
npx checkly destroy --force

if [ "$KEEP_GENERATED" = true ]; then
  echo "==> Keeping the working tree as-is (--keep-generated)"
elif git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  echo "==> Restoring working tree to last commit on '$BRANCH'"
  # Revert tracked edits, then drop untracked files. No -x, so ignored paths
  # (.env, node_modules, .checkly) are preserved.
  git checkout -- .
  git clean -fd
else
  echo "==> Not a git work tree — skipping working-tree restore" >&2
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
echo "==> Done. Checkly account is clean and the working tree matches its last commit."
echo "    .env, node_modules, and other ignored paths are untouched."
echo "    Untracked files were removed and tracked edits reverted (pass --keep-generated to skip)."
