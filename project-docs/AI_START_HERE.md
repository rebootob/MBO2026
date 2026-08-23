# AI START HERE: TTMET MBO / PMS V2

Welcome AI Developer / Agent! This document is your primary entry point to the **TTMET MBO / PMS V2** project.

## Mandatory Reading Order Before Taking Any Action:
1. **[CURRENT_STATE.md](CURRENT_STATE.md)**: Current system status, active phase, latest commit.
2. **[HANDOFF.md](HANDOFF.md)**: Immediate context from the preceding agent and exact next steps.
3. **[BUSINESS_RULES.md](BUSINESS_RULES.md)**: Core business rules, employee identity model, calculations.
4. **[APP_REGISTRY.md](APP_REGISTRY.md)**: App IDs, protected vs writable apps.
5. **[DECISIONS.md](DECISIONS.md)**: Architecture decision records (ADRs).
6. **[SECURITY_MODEL.md](SECURITY_MODEL.md)**: Safety write guard and confidentiality rules.
7. **Task-Specific Skills in `skills/`**: Load relevant local skills before writing code or running scripts.

## Golden Rules
- **Protected Production**: App 53 (Employee Master) & App 283 (Legacy PMS) are **STRICTLY READ ONLY**.
- **Writable Sandbox**: App 794 (MBO V2 Sandbox) & App 795 (MBO Routing Master Sandbox).
- **All Writes**: Must pass through `assertSandboxWriteTarget(appId)` from `src/core/sandbox-write-guard.js`.
- **Language**: All user-facing UI and messages MUST be bilingual (**ภาษาไทย / English**).
