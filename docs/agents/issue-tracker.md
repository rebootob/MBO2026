# Issue tracker: GitHub (Supplemental)

GitHub Issues may be used as a supplemental request/tracking surface only.

Authoritative MBO2026:
- specifications
- work packages
- approvals
- active status
- closure state

remain strictly in `project-docs/*` according to existing MBO governance.

## Mandatory Write Gate & Authorization Rules

All GitHub issue WRITE/mutation operations require explicit Owner or active work-package authorization, including:
- create (`gh issue create`)
- comment (`gh issue comment`)
- label (`gh issue edit --add-label`/`--remove-label`)
- assign (`gh issue edit --add-assignee`)
- close (`gh issue close`)
- reopen (`gh issue reopen`)
- edit (`gh issue edit`)

A generic Matt Skill instruction such as "publish to the issue tracker" or "create a ticket" MUST NOT itself constitute authorization to perform any issue write operation. Without explicit authorization, all GitHub issue interactions are **READ ONLY**.

## Conventions (Read-Only by Default)

- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

External PRs are NOT treated as request surfaces; all PR operations follow explicit Owner authorization.

## Wayfinding operations

Wayfinder operations are subject to the same Write Gate rules. Without explicit authorization to create map/child issues or mutate dependencies on GitHub, wayfinding status and frontier queries must rely on read-only inspection.
