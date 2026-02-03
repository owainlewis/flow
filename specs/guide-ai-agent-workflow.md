# Building a Software Delivery System with AI Agents

A practical guide to the workflow, tooling, and mindset behind agent-assisted software development. Based on building Flow — a content creation tool — using Claude Code, Linear, and GitHub.

---

## The Mindset Shift

Most engineers use AI agents the way they use Stack Overflow: ask a question, get an answer, paste it in. That works for isolated problems. It fails for building software.

The shift is from **using an AI tool** to **operating a delivery system**. Your job changes:

- You define **what** gets built and **why**
- You design the **architecture** — how pieces fit together
- You apply **judgment** — is this correct, is this the right approach
- You build **systems** that catch mistakes automatically

Everything else — the mechanical act of writing code, running reviews, checking for errors — gets delegated.

This isn't about typing faster. It's about thinking at a higher level while agents handle execution. You become the technical lead of a team that happens to be made of agents instead of people.

---

## The System

The system has five components that work together:

```
Specs → Tickets → Implementation → Review → Deployment
  │         │            │             │          │
  │     Linear as     Agents or    Agents      CI/CD
  │     control      headless     checking     pipeline
  │     plane        execution    agents
  │
  └── /spec command decomposes work
      and checks for file overlaps
```

Each component is a file, a command, or a script that persists outside any agent session. The agent's context window is temporary. Your artifacts are durable. This is the most important principle in the entire workflow.

---

## Linear as Control Plane

Most teams use Linear (or Jira, or GitHub Issues) as a to-do list. In an agent-assisted workflow, it becomes something more: the **control plane** for your entire delivery system.

### What the control plane does

**Visibility.** When three agents are working in parallel on separate branches, the Linear board shows you what's in progress, what's blocked, and what's done — without switching terminals or reading logs.

**State persistence.** An agent session is ephemeral. It runs, it finishes, it's gone. But the Linear ticket persists. It records what was attempted, what succeeded, what failed. When a new agent session picks up the same ticket, it reads the ticket description and has full context — not because the previous session is still running, but because the intent was written down.

**Workflow enforcement.** Tickets move through states: Backlog → Todo → In Progress → In Review → Done. Agents update these states as they work. You can see at a glance whether an agent actually opened a PR or got stuck on a build failure.

**Delegation routing.** For headless execution, the control plane determines what work gets picked up. A ticket labeled `agent` in the `Todo` column is available for automated pickup. A ticket labeled `needs-design` stays for human attention. The board becomes a queue that both humans and agents consume from.

### How we connect it

We use the Linear MCP (Model Context Protocol) server, which gives Claude Code direct access to Linear's API. The agent can:

- Read ticket descriptions, parent issues, and specs
- Update ticket status as it works
- Create sub-issues when decomposing specs
- Set blocking relationships between tasks

This means the agent doesn't just receive instructions — it participates in the project management layer. It marks tickets as In Progress when it starts, In Review when it opens a PR, and reports failures in comments. The control plane reflects reality because the agents update it as part of their workflow.

---

## Specs as Single Source of Truth

A spec is not a prompt. A prompt is ephemeral — you type it, the agent reads it, it's gone. A spec is a durable artifact that multiple agents consume for different purposes:

- The **implementation agent** reads it to know what to build
- The **review agent** reads it to know what was intended (and catch drift)
- The **test agent** reads it to know what to verify
- A **new session** reads it weeks later when a bug is found

### Anatomy of a spec

```markdown
# Feature: Export to Markdown

## Why
Content creators need to move posts to other platforms that accept markdown.

## What
Add an export button on the post view that copies the post content as
clean markdown to the clipboard.

## Constraints
- Must handle TipTap HTML output (headings, lists, bold, italic)
- Must not include internal metadata (status, platform, timestamps)
- Must work without a network connection (clipboard API only)

## Current State
- Posts stored as HTML strings in localStorage
- TipTap editor produces HTML via StarterKit extensions
- No export functionality exists

## Tasks
1. Add htmlToMarkdown utility using turndown
2. Add export button to post view page
3. Add visual feedback (toast) on successful copy
```

The spec captures decisions you've already made. The agent's job is execution within those boundaries — not re-making the decisions.

### The over-specification trap

If the spec is more detailed than the code would be, you've lost the benefit. The right level of detail is: enough that two different agents would produce substantially similar implementations, but not so much that you're writing pseudocode.

### The under-specification trap

If the spec has gaps, the agent fills them with assumptions. Assumptions are where bugs come from. The most dangerous gaps are in constraints — what the feature should **not** do. Agents are optimistic by default. They'll add features, refactor surrounding code, and "improve" things that weren't asked for unless the spec explicitly says not to.

---

## Task Decomposition and the Overlap Problem

A spec describes a feature. An agent works best on a single focused task. Decomposition bridges the gap.

### The rule

Each task should be:

- **Completable in one session** — the agent doesn't lose context
- **Shippable as one PR** — the branch builds, tests pass, the feature works
- **Independently verifiable** — you can confirm it's correct without needing other tasks to land first

### The overlap problem

This is the lesson we learned the hard way. We had three cleanup tickets:

| Ticket | Task | Files touched |
|--------|------|---------------|
| GRA-7 | Remove unused exports | `feed.ts`, `ContentTypeSelector.tsx` |
| GRA-8 | Extract platform icons | `PostCard.tsx`, `ContentTypeSelector.tsx`, `weekly/page.tsx`, `settings/page.tsx` |
| GRA-9 | Deduplicate stripHtml | `PostCard.tsx`, `feed.ts`, `weekly/page.tsx` |

GRA-8 and GRA-9 both modify `PostCard.tsx` and `weekly/page.tsx`. We ran them on separate branches from the same main. GRA-8 merged first. GRA-9's PR immediately showed merge conflicts.

The fix was a rebase and manual conflict resolution. The prevention is checking for file overlaps before creating tickets.

### The file-to-task map

Before creating any tickets, build this map:

```
PostCard.tsx         → GRA-8, GRA-9  ← OVERLAP
ContentTypeSelector  → GRA-7, GRA-8  ← OVERLAP
weekly/page.tsx      → GRA-8, GRA-9  ← OVERLAP
feed.ts              → GRA-7, GRA-9  ← OVERLAP
settings/page.tsx    → GRA-8
```

Every overlap must be resolved before work begins:

1. **Sequence them**: GRA-9 is `blockedBy` GRA-8. It starts after GRA-8 merges.
2. **Merge them**: combine GRA-8 and GRA-9 into one ticket if they're small enough.
3. **Redraw boundaries**: restructure the tasks so each owns distinct files.

Our `/spec` command automates this check. It builds the file-to-task map and flags overlaps before any Linear tickets are created. The conflict never reaches Git because it's caught at the planning stage.

---

## The Implementation Workflow

The workflow is encoded in a single file (`.claude/workflow.md`) that both the interactive slash command and the headless script read. One source of truth, two consumption paths.

### The steps

1. **Fetch the ticket** from Linear. Read the parent issue for full context.
2. **Read the spec** if the description references one.
3. **Update status** to In Progress.
4. **Create the branch** following naming conventions (`feature/`, `fix/`, `cleanup/`, `docs/`).
5. **Implement the change.**
6. **Build.** `bun run build` must pass. Never commit code that doesn't build.
7. **Commit** with the ticket ID in the message.
8. **Self-review** the diff. Check for unused imports, convention violations, empty catch blocks, over-engineering.
9. **Push and open a PR** with verification evidence in the body.
10. **Update status** to In Review.

### Verification evidence

Every PR includes a verification section:

```markdown
## Verification
- [x] `bun run build` passes
- [x] Self-review: no critical issues
- [x] Files changed match ticket scope
```

This matters because code reviewers (human or agent) can weigh verification evidence against review findings. We discovered this when a GitHub code review bot flagged "createPost doesn't exist, only createNote" — a confident, detailed, wrong analysis. The bot was comparing new code against an old branch state. The build passing was the ground truth that contradicted the review.

Verification evidence lets reviewers calibrate. If the build passes and the review says "this will cause a compile error," the review is wrong.

---

## Code Review with Agents

We use a hub-and-spoke architecture for code review:

```
/review-pr [aspect]
  ├── git diff main...HEAD
  │
  ├── code-reviewer agent   — bugs, convention compliance, patterns
  ├── code-simplifier agent — over-engineering, clarity, duplication
  └── error-checker agent   — silent failures, missing error handling
  │
  └── Aggregated summary sorted by severity
```

### Why three agents instead of one

Each agent has a focused prompt with specific instructions. A single "review everything" agent produces vague feedback. Three specialized agents produce actionable findings because each one knows exactly what to look for and what to ignore.

- **code-reviewer** checks CLAUDE.md compliance, logic errors, pattern consistency. Only reports issues at 80%+ confidence.
- **code-simplifier** checks for unnecessary abstractions, deep nesting, duplication. Never suggests behavioral changes — only clearer ways to express the same logic.
- **error-checker** checks for empty catch blocks, missing error handling on async operations, user-facing error states that fail silently.

### Severity tiers

Findings are grouped into three tiers:

- **Critical** — will break the build, cause runtime errors, or lose data. Must fix before merging.
- **Important** — incorrect behavior, convention violations, or patterns that will cause confusion. Should fix.
- **Suggestions** — style preferences and minor improvements. Fix if convenient.

### The self-review step

The review runs after commit but before push. This catches issues while the cost of fixing them is lowest — you're still on the branch, the context is fresh. It also means the PR arrives pre-reviewed, so human reviewers spend time on judgment calls rather than catching obvious issues.

### What we learned about review agent failures

Review agents produce false positives. We saw this firsthand: a code review bot analyzed our branch diff and flagged every `Post` reference as broken because the base branch still used `Note` naming. The review was confident, specific, and wrong.

The lesson: **review agent output is not trusted by default.** It's trusted because you verify it against ground truth (build output, test results, your own reading of the code). The review agent is a layer that catches real issues often enough to be worth running, but it's not the final word.

This applies recursively — the thing checking for errors can itself have errors. Multiple layers with different approaches catch what individual layers miss.

---

## Running Agents Headless

Interactive sessions are good for exploration, design decisions, and complex work. Headless execution is good for well-defined tasks where the spec is clear and the risk is low.

### The script

```bash
./scripts/agent-implement.sh GRA-123
```

This runs Claude in headless mode (`claude -p`) with a single instruction: read `.claude/workflow.md` and follow every step for the given ticket. The agent has access to the same tools (Bash, file operations, Linear MCP) as an interactive session.

Logs go to `.agent-logs/` so you can review what the agent did after the fact.

### Parallel execution

```bash
./scripts/agent-implement.sh GRA-10 GRA-11 GRA-12
```

Multiple tickets run as parallel background processes. Each gets its own log file.

**Important constraint:** parallel agents on the same repository will conflict — they're editing the same files and fighting over Git state. For true parallel execution, each agent needs its own working directory via git worktrees:

```bash
git worktree add /tmp/flow-gra-10 main
git worktree add /tmp/flow-gra-11 main
```

This is why the overlap check in the `/spec` command matters for headless execution. If two tasks touch the same files, they can't run in parallel — even with separate worktrees, they'll produce conflicting PRs.

### When to use headless vs interactive

**Headless works well for:**
- Well-scoped cleanup tasks (remove dead code, extract shared utilities)
- Bug fixes where the cause is identified and the fix is clear
- Mechanical changes (rename, move files, update imports)
- Any task where the spec is precise and the risk of a wrong implementation is low

**Stay interactive for:**
- New features where design decisions will arise during implementation
- Tasks touching authentication, billing, or data integrity
- Ambiguous requirements where you'll need to make judgment calls
- Architecture changes that affect multiple parts of the system

The distinction maps to risk and reversibility. A cleanup PR that removes unused code is easy to revert if it's wrong. A database migration is not.

---

## The Configuration Layer

Three files configure how agents understand and work with your project:

### CLAUDE.md — Project context

Loaded into every session. Contains:
- Project overview and architecture
- Route structure and component locations
- Data layer patterns (localStorage keys, type definitions)
- Styling conventions (Tailwind, CSS variables, fonts)
- Development commands (`bun run dev`, `bun run build`)

**Keep it lean.** Every line costs tokens in every session. Put stable, high-value information here. Don't put things that change frequently or are better handled by commands and skills.

### .claude/workflow.md — Implementation steps

The canonical implementation workflow. Both the `/implement` slash command and the headless script read from this file. Update it once, both paths stay in sync.

### .claude/agents/ — Specialized agent prompts

Each agent prompt defines a focused role:
- `code-reviewer.md` — what to check, severity definitions, confidence threshold
- `code-simplifier.md` — what to flag, what to ignore, the "never suggest behavioral changes" rule
- `error-checker.md` — error patterns to catch, what not to flag

These are invoked by the `/review-pr` hub command, which dispatches to the relevant agents based on the aspect filter.

### .claude/commands/ — Slash commands

User-triggered workflows:
- `/implement GRA-123` — full implementation workflow from ticket to PR
- `/review-pr` — hub-and-spoke code review
- `/spec <feature>` — write spec, decompose tasks, check for overlaps, create tickets

---

## The Feedback Loop

Every failure makes the system stronger:

1. **A review agent misses a bug** → add that pattern to the agent's prompt
2. **An agent violates a convention** → add the convention to CLAUDE.md
3. **Two tasks conflict** → the overlap check in `/spec` prevents it next time
4. **A headless run fails** → the log shows why, and the workflow is updated

This is the compounding effect. Week one, you're catching mistakes manually. Month three, the system catches them for you. Every correction you make is permanent — it's encoded in a file, not lost in a conversation.

The system's output is not just software. It's a delivery machine that gets better with every project.

---

## Practical Lessons from Building Flow

These are specific things we learned while building this system, not abstract principles.

### Commit before reviewing

We ran `/review-pr` against uncommitted changes on the `main` branch. The diff was empty because HEAD was main. The reviewer compared new code against the committed state and flagged everything as broken. The code was fine — it just wasn't committed to a branch yet.

**Lesson:** branch-based review requires branch-based work. Commit to a branch first, then review.

### Review agents are confidently wrong

A code review bot told us `createPost` didn't exist and we should use `createNote` instead. `createPost` existed — the bot was comparing against an old branch state where the Note-to-Post rename hadn't landed yet. The analysis was detailed, specific, and completely wrong.

**Lesson:** review output is not ground truth. `bun run build` passing is ground truth. Use verification evidence to calibrate review findings.

### File overlaps cause merge conflicts

GRA-8 (extract platform icons) and GRA-9 (deduplicate stripHtml) both touched `PostCard.tsx` and `weekly/page.tsx`. They ran on separate branches, both merged cleanly individually, but the second one to merge had conflicts.

**Lesson:** check for file overlaps at decomposition time, not at merge time. The `/spec` command now does this automatically.

### Single source of truth prevents drift

We had the implementation workflow written in two places: the `/implement` slash command and the headless script. When we updated one, the other was stale. We extracted the steps into `.claude/workflow.md` and pointed both consumers at it.

**Lesson:** if two things need to stay in sync, they should read from the same file. Duplication in configuration is just as dangerous as duplication in code.

### Fresh sessions outperform long ones

Long sessions accumulate context that degrades agent performance. The agent starts repeating itself, contradicting earlier work, or ignoring instructions. Each task should be a fresh session that reads its context from durable artifacts (specs, tickets, CLAUDE.md) rather than relying on conversational history.

**Lesson:** treat agent sessions as disposable. Persist everything important outside the session.

---

## The Complete Toolchain

| Layer | Tool | Purpose |
|-------|------|---------|
| Planning | `/spec` command | Write specs, decompose tasks, check overlaps |
| Control plane | Linear + MCP | Track work, manage state, route delegation |
| Implementation | `/implement` or headless script | Execute tasks from spec to PR |
| Review | `/review-pr` | Three-agent code review with severity tiers |
| Configuration | CLAUDE.md, workflow.md, agents/ | Encode project knowledge permanently |
| Verification | `bun run build`, tests | Ground truth that review agents can't override |
| Execution | `scripts/agent-implement.sh` | Headless agent execution with logging |

Each layer catches what the others miss. Tests catch logic errors. Review agents catch pattern violations. The build catches type errors. You catch the judgment calls that automated layers can't make.

Your attention is the most expensive resource in the system. Every automated layer exists to protect it — surfacing only what requires human judgment and handling everything below that threshold automatically.
