# Excel Templates vs. Kintone Real System Truth & Conflict Table

> **Document Status:** Complete (Discovery Phase)  
> **Last Updated:** 2026-08-23  

---

## 1. Discovered Conflicts & Discrepancies

| Conflict ID | Profile / App | Topic | Excel Template Says | Kintone Formula Says | Evidence | Impact | Recommended Question to User | Status |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **CONF-001** | Assistant Manager (`App 310`) | Part A/B Weight Split | Part A: **60%**, Part B: **40%** | Part A: **50%**, Part B: **50%** | App 310 CALC field `partA_weighted` has `total_score*50/100` | Final score calculation differs by up to 10% | ควรใช้ 60/40 ตาม Excel หรือ 50/50 ตาม Kintone เดิมสำหรับ Assistant Manager? | **NEEDS_USER_CONFIRMATION** |
| **CONF-002** | General Manager (`App 640`) | Part A/B Weight Split | Part A: **60%**, Part B: **40%** | Part A: **50%**, Part B: **50%** | App 640 CALC field uses `*50/100` | Score weighting discrepancy | ควรใช้ 60/40 ตาม Excel หรือ 50/50 ตาม Kintone เดิมสำหรับ GM? | **NEEDS_USER_CONFIRMATION** |
| **CONF-003** | Vice President (`App 715`) | Part A/B Weight Split | Part A: **70%**, Part B: **30%** | Part A: **50%**, Part B: **50%** | App 715 CALC field uses `*50/100` | Significant score weighting discrepancy | ควรใช้ 70/30 ตาม Excel หรือ 50/50 ตาม Kintone เดิมสำหรับ VP? | **NEEDS_USER_CONFIRMATION** |
| **CONF-004** | All Profiles with COCE | COCE Inclusion in Score | Rating 1-5 displayed in Part B form | Excluded from divisor (Divisor = 5 or 6, ignoring COCE item) | In App 283: `(comp1+comp2+comp3+comp4+comp5)/5` where `comp6` is COCE | Score does not incorporate COCE numerical rating | COCE เป็น Gatekeeper Pass/Fail หรือต้องนำคะแนนมารวมใน Part B หรือไม่? | **NEEDS_USER_CONFIRMATION** |
| **CONF-005** | Section Manager (`App 305`) | Excel File Naming vs App Name | File name is `PMS Asst.Sect.Mgr.&Specialist` | Kintone App name is `PMS Sect.Mgr` | Directory `info app/305/` contains Asst.Sect.Mgr Excel | Potential template misallocation | ยืนยัน Template ของ Section Manager ว่าใช้ชุดเดียวกับ Assistant Manager หรือมี Template เฉพาะ? | **NEEDS_USER_CONFIRMATION** |
