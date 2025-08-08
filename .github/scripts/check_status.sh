#!/usr/bin/env bash
set -e

OP_ID="$1"
ENDPOINT="$2"
API_KEY="$3"
CLIENT_ID="$4"

MAX_WAIT=600
INTERVAL=10
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS=$(curl -sS --fail-with-body \
    -H "Authorization: ApiKey $API_KEY" \
    -H "X-ClientID: $CLIENT_ID" \
    "$ENDPOINT/$OP_ID" | jq -r '.status // "Unknown"')

  echo "Status: $STATUS (${ELAPSED}s)"
  case "$STATUS" in
    Succeeded) exit 0 ;;
    Failed|Cancelled)
      echo "❌ Operation failed!"
      exit 1
      ;;
  esac

  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "⏰ Timed out after ${MAX_WAIT}s"
exit 1
