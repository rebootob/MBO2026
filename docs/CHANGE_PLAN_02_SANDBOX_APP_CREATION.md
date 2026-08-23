# Change Plan: Sandbox App Creation

## What

Create and deploy `MBO V2 Sandbox` and `MBO Routing Master Sandbox`.

## Where

Kintone preview and production app settings for Apps 794 and 795 only; sandbox registry and deployment scripts.

## How

First validate read-only access to Apps 53 and 283. Create the two named apps in preview, record their IDs locally, confirm the write guard, then deploy only registered IDs.

## Why

Provide isolated applications for MBO V2 development without modifying the legacy or employee-master apps.

## Impact

Creates two empty sandbox apps. No production reference app or employee data is changed.

## Risk

The initial apps are empty. Later configuration changes must be backed up before each modification.

## Test

Read-only connection test for Apps 53 and 283, six write-guard unit tests, and GET smoke test for Apps 794 and 795.

## Rollback

Disable or delete only the identified sandbox apps after explicit approval. Never use rollback actions against Apps 53 or 283.
