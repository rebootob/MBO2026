# Confirmed App794 UI / UX Baseline

Status: CONFIRMED / FROZEN FOR UI CLOSURE

User-confirmed on 2026-08-26. This file is the canonical UI/UX source of truth for App794 and the related HR phase-calendar presentation. It does not authorize any Kintone write or deploy.

## 1. UI Is the Current Critical Path

- App794 UI/UX V2 is the primary user-facing deliverable and must be visually approved before Dashboard/Hoshin continuation, Final UAT, or any App794 redeploy.
- Do not move forward merely because automated tests pass. User visual inspection of the local Preview Lab is a mandatory gate.
- Preview and candidate work remain LOCAL ONLY until a later explicit deployment authorization.

## 2. Five Business Stages

The top-level user journey is exactly five macro stages:

1. `เป้าหมาย / Objectives`
2. `ทบทวนกลางปี / Mid-Year`
3. `ประเมินตนเอง / Self Evaluation`
4. `การประเมินโดยผู้ประเมิน / Appraiser Evaluation`
5. `HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น / HR Final / Completed`

These five stages are business UX stages and are not a one-to-one representation of the 16 technical Kintone Process statuses.

## 3. Bilingual Rule

- User-facing UI must be Thai + English because Thai and Japanese employees use the same system.
- Thai should appear first where practical, with English adjacent or directly below.
- Important navigation, field labels, phase states, route labels, action guidance, completion messages, validation guidance, buttons/help text, and result/status badges must be bilingual.
- Japanese translation is not required for V1.
- Technical identifiers such as `M1_G1` may remain English codes only when shown as secondary technical detail.

## 4. Lifecycle Appraiser Route

- The configured evaluator/appraiser sequence belongs to the MBO record for the whole annual lifecycle, not only the final-scoring screen.
- The same sequence remains visible/contextual through Objectives, Mid-Year, Self Evaluation, Appraiser Evaluation, and HR Final/Completed.
- User-facing labels are ordinal only:
  - `ผู้ประเมินลำดับที่ 1 / 1st Appraiser`
  - `ผู้ประเมินลำดับที่ 2 / 2nd Appraiser`
  - `ผู้ประเมินลำดับที่ 3 / 3rd Appraiser`
  - `ผู้ประเมินลำดับที่ 4 / 4th Appraiser`
- Do not use organizational titles such as Manager, GM, VP, or President as the route-slot heading.
- The actual person's position may be shown only as optional secondary metadata.
- The active number of appraisers is resolved from configuration/routing. Employees do not manually choose the appraiser count in production App794.

## 5. Route Presentation

Preferred heading:

`เส้นทางผู้ประเมินและอนุมัติ / Evaluation & Approval Route`

Example:

`พนักงาน / Employee -> ผู้ประเมินลำดับที่ 1 / 1st Appraiser -> ผู้ประเมินลำดับที่ 2 / 2nd Appraiser -> HR Final`

- The full route should remain visible across all five stages.
- Highlight the current actor/slot and show previous/next route members with truthful stage-specific states such as `รอดำเนินการ / Waiting`, `กำลังดำเนินการ / Current`, `ตรวจสอบแล้ว / Reviewed`, `ให้คะแนนแล้ว / Scored`, `เสร็จแล้ว / Completed`.
- Do not imply that Appraiser Evaluation is the only stage where appraisers matter. Appraisers review/approve Objectives and Mid-Year as applicable, remain route context during Self Evaluation, perform Part A/Part B scoring at Appraiser Evaluation, and remain read-only audit context at HR Final.

## 6. Friendly Route Scenario Names in Preview

The Preview Lab must not force business users to understand raw topology codes or a separate `Appraisers (1-4)` control with unclear meaning.

Replace confusing controls with a single bilingual route-scenario selector, for example:

- `เส้นทางมาตรฐานปัจจุบัน — ผู้ประเมิน 2 คน / Current Standard — 2 Appraisers` (`M1_G1` technical detail)
- `เส้นทางขยาย — ผู้ประเมิน 3 คน / Extended Route — 3 Appraisers` (`M1_M2_G1` technical detail)
- `เส้นทางผู้บริหารโดยตรง — ผู้ประเมิน 1 คน / Executive Direct — 1 Appraiser` (Preview Only / Routing Pending)
- `เส้นทางรองรับอนาคต — ผู้ประเมิน 4 คน / Future Capacity — 4 Appraisers` (Preview Only)

Raw `M1_G1`, `M1_M2_G1`, G2 and invalid topology values should move to an Advanced / Technical Details area in Preview, not be the dominant business-facing control.

Do not claim that a topology code belongs to a specific employee position unless a reviewed routing rule actually establishes that relationship. Current App795 routing is primarily section/team based, so labels such as `M1_G1 = Staff` are prohibited.

## 7. Evaluation Profile Is Separate From Route

- `70/30`, `60/40`, and `50/50` are Part A / Part B scoring profile ratios. They are not routing topology names.
- The UI should rename `Profile Ratio` to a clearer bilingual label such as `โปรไฟล์การประเมิน / Evaluation Profile (Part A : Part B)`.
- Do not infer appraiser count or route solely from the ratio selector.
- Routing/profile runtime binding is a later persistence/runtime gate and must remain fail-closed when unresolved.

## 8. Desktop Data Entry Layout

Desktop layout must prioritize readable, high-volume text entry.

General rule:
- one Objective = one horizontal row/grid;
- long-text fields remain wide and multi-line (approximately 4–6 visible lines minimum where practical);
- compact numeric/rating fields may be narrow;
- horizontal scrolling is acceptable for very wide 3–4 appraiser matrices;
- do not revert to vertically stacked Objective/Action Plan/Comment fields on desktop by default.

Objectives row:
`# | Objective / Target | Action Plan | Additional Agreement | Weight | Difficulty`

Mid-Year row:
`Objective (read-only) | Progress % | Periodical Review | Mid-Year Result | Issue/Risk | Next Action | Attachment`

Self Evaluation row:
`Objective (read-only) | Actual Result | Self Achievement | Self Comment | Attachment`

Appraiser Part A matrix:
`Objective | Weight | Difficulty | Self | Appraiser 1..N | Result Context`

Part B matrix:
`Competency | Appraiser 1..N | Result Context`

HR Final:
read-only horizontal summary/matrix, not a long duplicate edit form.

## 9. Attachment Requirement

- Mid-Year must allow attachment/evidence per Objective.
- Self Evaluation must allow attachment/evidence per Objective.
- Appraiser Evaluation and HR Final must carry those attachments forward as read-only evidence context.
- Production UI must never invent/fallback fake file names when no attachment exists.

## 10. Difficulty Empty-State Rule

- Blank Difficulty must stay blank in record data and must not visually default to Level 3.
- Empty editable field shows `-- กรุณาเลือกระดับความยาก / Please select --` and Required styling.
- Only after a real value 1–4 is selected may the field show green/editable completed state.
- Read-only blank displays `ยังไม่ได้ระบุ / Not selected`.

## 11. Five-Phase HR Calendar Ownership

- HR owns the Start Date and End Date for each of the five macro stages.
- HR must configure the schedule from the existing App800 HR Control Center / Dashboard; App794 employees do not edit phase dates.
- App794 reads the effective Fiscal Year schedule and displays it read-only.
- Do not hardcode production dates in App794. Preview may use deterministic fixtures only.
- Do not create a new calendar app unless a later review proves App800 cannot safely host the requirement.

The five schedules are:
- Objectives: start/end
- Mid-Year: start/end
- Self Evaluation: start/end
- Appraiser Evaluation: start/end
- HR Final: start/end

## 12. Deadline / Days Remaining UX

For every phase, App794 should show the date range and a simple bilingual time-to-deadline indicator that is easy for employees to understand.

Required states:
- Before start: `เริ่มใน X วัน / Opens in X days`
- Open with time remaining: `เหลือ X วัน / X days remaining`
- Due today: `ครบกำหนดวันนี้ / Due today`
- Past due and not complete: `เกินกำหนด X วัน / X days overdue`
- Completed: `เสร็จแล้ว / Completed` (do not show an alarming overdue message after completion)
- Upcoming/Closed/Open/Completed badges remain bilingual.

A visual progress/deadline bar may be used, but it must not confuse process completion percentage with performance score.

## 13. Boundary Actions Between Phases

Current frozen workflow design assigns `05 Objective Approved` and `10 Mid-Year Completed` to `Requester_User` and provides manual actions:
- `Start Mid-Year`: `05 Objective Approved -> 06 Employee Mid-Year`
- `Start Self Evaluation`: `10 Mid-Year Completed -> 11 Employee Self Evaluation`

Therefore for current V1 UX:
- HR controls when the next phase is allowed to open through the HR phase calendar.
- Requester/Employee is the current workflow actor who starts the phase using the native Kintone Process action when the window is open.
- Before the phase start date, UI shows a waiting/locked boundary and the opening date/countdown.
- When the phase window is open, UI clearly tells the Requester what action is available and that the native Kintone Process button must be used.
- Do not auto-transition workflow based only on date in this UI closure sprint.
- Any future automatic transition requires a separate reviewed architecture/security change.

## 14. Actor-Aware Display

Requester-owned states:
- emphasize `พนักงาน / Requester` as current actor;
- editable fields only when the applicable phase window is open.

Appraiser-owned states:
- emphasize the ordinal Appraiser slot, not Manager/GM title;
- employee-entered data is read-only;
- show approve/return guidance separately from scoring where relevant.

Waiting boundary states 05/10:
- `ยังไม่ต้องดำเนินการ / No action required yet` before next window opens;
- once open, show `พร้อมเริ่มขั้นตอน / Ready to start` and Requester action guidance.

HR Final:
- emphasize `HR Final Check` as a distinct HR role, not an Appraiser slot.

Completed:
- fully read-only and no action required.

## 15. Progress Indicators

App794 should distinguish at least these concepts:
- `ความคืบหน้ากระบวนการ / Process Progress`
- `ความครบถ้วนของข้อมูล / Data Completion`
- `ความครบถ้วนของผู้ประเมิน / Appraiser Completion` when relevant
- phase deadline/countdown

Do not use process progress colors/percentages as if they were performance scores.

## 16. Preview Lab Is a Visual Approval Tool

Preview must allow inspection of:
- all five macro stages;
- all relevant physical statuses, while clearly identifying status/route mismatches;
- 1, 2, 3, and 4-appraiser route scenarios;
- 70/30, 60/40, 50/50 evaluation profiles independently from route scenario;
- complete/incomplete scoring states;
- active actor changes through Requester -> Appraiser(s) -> HR;
- deterministic preview date and HR phase calendar;
- deadline states: upcoming, remaining days, due today, overdue, completed.

Preview must make clear which scenarios are current-runtime supported versus Preview Only / Routing Pending.

## 17. Safety / Runtime Boundary

- UI hiding is not authorization.
- Native Kintone Process/permission controls remain the security boundary.
- Preview-only 3rd/4th Appraiser capacity does not certify physical persistence.
- Executive direct route preview does not certify App795/App794 runtime routing.
- No Kintone write/deploy is authorized by this baseline.
