# Implementation Workflow

Steps to implement a Linear issue from start to PR.

## Steps

1. Fetch the issue from Linear using the provided issue ID or identifier (e.g., GRA-123).
2. If the issue has a parent issue, fetch the parent and read its description to understand the full context (why, constraints, current state, scope).
3. If the description references a spec file (e.g., `Spec: specs/<feature>.md`), read that file for additional detail.
4. Set the issue status to **In Progress** in Linear.
5. Determine the correct branch prefix from the issue labels:
   - `feature/` if labelled `feature` (or no relevant label)
   - `fix/` if labelled `bug`
   - `cleanup/` if labelled `cleanup` or `tech-debt`
   - `docs/` if labelled `docs`
6. Create a branch: `<prefix>/<issue-id-lowercase>-<slug>` (e.g., `feature/gra-12-add-supabase-sync`).
7. Implement the change as described in the issue and parent context.
8. Run `bun run build` to verify the build passes. Do not commit code that doesn't build.
9. Commit with the Linear issue ID in the message: `<summary> (<ISSUE-ID>)`
10. Self-review the diff against main. Check for:
    - Unused imports or references to non-existent functions
    - CLAUDE.md convention violations (branch naming, file placement, styling)
    - Empty catch blocks or swallowed errors
    - Over-engineering or unnecessary abstractions
    Fix any **Critical** issues found before proceeding.
11. Push the branch to origin.
12. Create a PR with `gh pr create`. Include in the PR body:
    - Summary of changes
    - Verification section: `bun run build` result, files changed
    - Link to the Linear issue
13. Set the issue status to **In Review** in Linear. It moves to **Done** after merge.

## Issue workflow

Backlog → Todo → In Progress → In Review → Done

## Rules

- Do not amend existing commits. Create new commits to fix issues.
- Do not force push.
- If the build fails, fix it before committing.
- If anything fails (build, git push, PR creation), stop and report the error clearly.
