# AI Handoff Document & Core Rules

## 1. Current Phase: CROSS-APP LEGACY DISCOVERY & V2 ARCHITECTURE REDESIGN
- **HARD WRITE LOCK ACTIVE**: Do NOT call POST/PUT/DELETE on any Kintone app (53, 283, 305, 307, 310, 640, 643, 715, 716, 794, 795).
- **STOP & WAIT FOR APPROVAL**: Do not modify App 794/795 schemas or create new Master Apps until the user reviews and approves the Architecture Blueprint.

## 2. Key Architecture Takeaways
- **8 Legacy Profiles Consolidated into 1 Core App**: Unified MBO Transaction Core (App 794) + Evaluation Profile Master (App 796) + Competency Master (App 797) + Generic Routing Master (App 795).
- **Decoupled Scoring Engine**: Weights (70/30, 50/50, 60/40), divisors, and difficulty matrices are driven by Profile configuration, not hardcoded JavaScript.
- **Generic Sequential Routing**: Replaces hardcoded column names with generic step sequences (`Step_1` to `Step_4`) supporting any approval chain length (1 to 4 steps) with `ALL`/`ANY` rules.
