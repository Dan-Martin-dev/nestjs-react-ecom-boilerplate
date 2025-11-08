#!/usr/bin/env bash
set -euo pipefail

# Simple rsync helper to upload local assets to a remote server's uploads directory.
# Usage:
#   ./scripts/deployment/upload_assets.sh /path/to/local/assets deploy@host:/path/to/project
# Or set REMOTE_USER/REMOTE_HOST/REMOTE_PATH env vars and run:
#   REMOTE_HOST=example.com REMOTE_USER=deploy ./scripts/deployment/upload_assets.sh ./assets

LOCAL_DIR=${1:-./assets}
REMOTE_DEST=${2:-"${REMOTE_USER:-deploy}@${REMOTE_HOST:-}"}
REMOTE_BASE=${3:-/var/www/ecom}

if [ "$REMOTE_DEST" = "@" ] || [ -z "$REMOTE_DEST" ]; then
  echo "Error: specify remote as user@host or set REMOTE_USER and REMOTE_HOST"
  echo "Usage: $0 [LOCAL_DIR] [user@host] [remote_base_path]"
  exit 1
fi

# If user passed user@host in REMOTE_DEST and no explicit remote base, use default remote base
if [[ "$REMOTE_DEST" == *"@"* ]] && [ -z "${3:-}" ]; then
  REMOTE_PATH="${REMOTE_DEST}:${REMOTE_BASE}/uploads"
else
  REMOTE_PATH="$REMOTE_DEST/${REMOTE_BASE}/uploads"
fi

echo "Uploading from $LOCAL_DIR to $REMOTE_PATH"

# Ensure trailing slash on local dir to copy contents
rsync -avz --delete --progress "$LOCAL_DIR/" "$REMOTE_PATH/"

echo "Upload complete. On the server, ensure docker-compose mounts the project directory so uploads/ is visible to your containers."
