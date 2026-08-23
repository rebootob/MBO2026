# Change Plan: Project Foundation

## What

Initialize local Git metadata, secret exclusions, sandbox registry placeholders, and a mandatory write-target guard.

## Where

Repository root, `config/`, `src/core/`, `scripts/kintone/`, and `tests/`.

## How

Default-deny writes unless the target is a registered sandbox app; explicitly deny Apps 53 and 283.

## Why

Protect production applications before any Kintone integration or sandbox configuration work.

## Impact

No Kintone request or configuration change is made.

## Risk

No sandbox app IDs are registered yet, so the guard rejects every write by design.

## Test

Verify Apps 53 and 283 and unregistered IDs are blocked; a registered synthetic sandbox ID is allowed.

## Rollback

Revert the local Git commit. No external state exists to roll back.
