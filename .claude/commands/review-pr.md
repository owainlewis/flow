---
name: Review PR
description: Review the current branch's diff against main for bugs, complexity, and error handling.
---

Review the current branch's changes against main.

**Aspect filter:** $ARGUMENTS (default: `all`)

Valid aspects: `code`, `simplify`, `errors`, `all`

## Steps

1. Run `git diff main...HEAD` to get the full diff of changed files. If the diff is empty, report that there are no changes to review and stop.

2. Run `git diff main...HEAD --name-only` to get the list of changed files.

3. Determine which agents to run based on the aspect argument:
   - `code` → code-reviewer only
   - `simplify` → code-simplifier only
   - `errors` → error-checker only
   - `all` (or empty/unrecognized) → all three agents

4. Launch the applicable agents **in parallel** using the Task tool. For each agent:
   - Use `subagent_type: "general-purpose"`
   - Include the full diff output in the prompt
   - Include the agent instructions from the corresponding file in `.claude/agents/`:
     - `.claude/agents/code-reviewer.md`
     - `.claude/agents/code-simplifier.md`
     - `.claude/agents/error-checker.md`
   - Ask the agent to read the agent instructions file first, then analyze the diff according to those instructions

5. Collect all findings from the agents and aggregate them into a single summary.

## Output format

Sort all findings by severity and group them. Use this format:

```markdown
## Code Review Summary

**Branch:** `<current-branch-name>`
**Files changed:** <count>

### Critical (must fix)
- `file:line` — Description [agent-name]

### Important (should fix)
- `file:line` — Description [agent-name]

### Suggestions
- `file:line` — Description [agent-name]

### Passing
- List anything explicitly checked and found clean
```

If a severity section has no findings, omit it. If all sections are empty, output:

```markdown
## Code Review Summary

**Branch:** `<current-branch-name>`
**Files changed:** <count>

All checks passed. No issues found.
```
