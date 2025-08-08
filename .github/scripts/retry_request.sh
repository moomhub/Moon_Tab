#!/usr/bin/env bash
set -e

# Usage: retry_request <command> <max_attempts> <initial_delay>
# Example: retry_request "curl --fail-with-body ..." 3 5

CMD="$1"
MAX_ATTEMPTS="${2:-3}"
DELAY="${3:-5}"
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "🔄 Attempt $ATTEMPT of $MAX_ATTEMPTS..."
  if eval "$CMD"; then
    echo "✅ Request succeeded"
    exit 0
  fi
  if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
    echo "⚠️ Request failed, retrying in ${DELAY}s..."
    sleep $DELAY
    DELAY=$((DELAY * 2)) # exponential backoff
  fi
  ATTEMPT=$((ATTEMPT + 1))
done

echo "❌ All ${MAX_ATTEMPTS} attempts failed"
exit 1
