# Security & Privacy Model

## 1. Safety Write Guard
Writes to App 53 and App 283 are blocked programmatically by `src/core/sandbox-write-guard.js`.

## 2. Confidentiality Matrix
Employees / Shared accounts MUST NEVER view:
- `Manager_Achievement_1..10`, `GM_Achievement_1..10`
- `Manager_Comment_1..10`, `GM_Comment_1..10`
- `PartA_Raw_Score`, `PartA_Weighted_Score`
- `Manager_Competency_Rating_1..6`, `GM_Competency_Rating_1..6`
- `PartB_Raw_Score`, `PartB_Weighted_Score`
- `Final_Confidential_Score`, `Final_Grade`
