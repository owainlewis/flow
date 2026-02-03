#!/usr/bin/env bash
set -euo pipefail

# Agent-driven implementation script for Flow
# Usage: ./scripts/agent-implement.sh GRA-123
# Usage: ./scripts/agent-implement.sh GRA-123 GRA-124 GRA-125

if [ $# -eq 0 ]; then
  echo "Usage: $0 <issue-id> [issue-id...]"
  echo "Example: $0 GRA-123"
  echo "Example: $0 GRA-123 GRA-124 GRA-125  (parallel)"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_ROOT/.agent-logs"
mkdir -p "$LOG_DIR"

run_agent() {
  local issue_id="$1"
  local timestamp=$(date +%Y%m%d-%H%M%S)
  local log_file="$LOG_DIR/${issue_id}-${timestamp}.log"

  echo "[$issue_id] Starting agent → $log_file"

  claude -p "Implement Linear issue ${issue_id}. Read .claude/workflow.md and follow every step." \
    --allowedTools "Bash,Read,Write,Edit,Glob,Grep,WebFetch,mcp__linear-server__*" \
    > "$log_file" 2>&1

  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    echo "[$issue_id] Done. Log: $log_file"
  else
    echo "[$issue_id] Failed (exit $exit_code). Log: $log_file"
  fi

  return $exit_code
}

if [ $# -eq 1 ]; then
  # Single ticket — run directly
  run_agent "$1"
else
  # Multiple tickets — run in parallel
  echo "Running ${#} agents in parallel..."
  pids=()

  for issue_id in "$@"; do
    run_agent "$issue_id" &
    pids+=($!)
  done

  # Wait for all and collect results
  failed=0
  for i in "${!pids[@]}"; do
    if ! wait "${pids[$i]}"; then
      failed=$((failed + 1))
    fi
  done

  echo ""
  echo "Completed: $# agents, $failed failed"
  [ $failed -eq 0 ]
fi
