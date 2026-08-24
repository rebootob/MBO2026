# Competency Source Evidence & Master Definition Matrix
## Authoritative Evidence across Live Kintone Applications and Business References

> **Audit Date:** 2026-08-24T15:26:00+07:00  
> **Governance Principle:** `SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST` (Kintone is primary for scoring behavior; Excel is secondary reference for Thai/English text).  

---

## 1. Master Competency Evidence Inventory

| Competency Code | Displayed Label (TH / EN) | Applicable Set | Live Kintone App & Field Code | Rating Scale | Included in Score | Live Calculation Behavior | Evidence Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| `COMP_ADAPT` | ความสามารถในการปรับตัว / Adaptability | Operational, Management | App 283..716 (`rating_1_1`, `rating_2_1`) | 1..5 | **`true`** | Included in `sum_rating` / `devide_10` | **VERIFIED** |
| `COMP_PROB` | การแก้ไขปัญหา / Problem Solving | Operational, Management | App 283..716 (`rating_1_2`, `rating_2_2`) | 1..5 | **`true`** | Included in `sum_rating` / `devide_10` | **VERIFIED** |
| `COMP_CUST` | การมุ่งเน้นลูกค้า / Customer Focus | Operational, Management | App 283..716 (`rating_1_3`, `rating_2_3`) | 1..5 | **`true`** | Included in `sum_rating` / `devide_10` | **VERIFIED** |
| `COMP_VALUE` | การสร้างคุณค่าและความคิดริเริ่ม / Value Creation | Operational, Management | App 283..716 (`rating_1_4`, `rating_2_4`) | 1..5 | **`true`** | Included in `sum_rating` / `devide_10` | **VERIFIED** |
| `COMP_SAFETY`| ความตระหนักด้านความปลอดภัย / Safety Awareness | Operational, Management | App 283..716 (`rating_1_5`, `rating_2_5`) | 1..5 | **`true`** | Included in `sum_rating` / `devide_10` | **VERIFIED** |
| `COMP_COCE` | จรรยาบรรณและการปฏิบัติตามกฎ / Compliance (COCE) | Operational, Management | App 283..716 (`rating_1_6`, `rating_2_6`) | 1..5 | **`false`** | Evaluated on form but **strictly excluded from `sum_rating`** across 100% of apps | **VERIFIED** |
| `COMP_LEAD` | ภาวะผู้นำและการบริหารคน / Leadership & People Mgmt | Management Only | App 305, 307, 310, 640, 643, 715 (`rating_1_7`, `rating_2_7`) | 1..5 | **`true`** | Included in `sum_rating` ($N=7$) | **VERIFIED** |
| `COMP_STRAT`| การวางแผนกลยุทธ์และการสอนงาน / Strategy & Coaching | Management Only | App 305, 307, 310, 640, 643, 715 (`rating_1_8`, `rating_2_8`) | 1..5 | **`true`** | Included in `sum_rating` ($N=7$) | **VERIFIED** |

---

## 2. Competency Sets Summary
1. **`COMP_SET_OPERATIONAL_V1`:** 6 displayed items (`COMP_ADAPT`..`COMP_COCE`). 5 scored items + 1 COCE gate. Dynamic denominator $N_{\text{included}} = 5$.
2. **`COMP_SET_MANAGEMENT_V1`:** 8 displayed items (`COMP_ADAPT`..`COMP_STRAT`). 7 scored items + 1 COCE gate. Dynamic denominator $N_{\text{included}} = 7$.
