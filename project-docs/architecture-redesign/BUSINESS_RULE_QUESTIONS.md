# Business Rule Clarification Questions for User & HR

> **Document Status:** Open for Decision  
> **Last Updated:** 2026-08-23  

---

## Priority 1: CRITICAL DECISIONS (Score Calculation Impact)

### Q1: สัดส่วนคะแนน Part A / Part B ของตำแหน่ง Assistant Manager (App 310)
* **ข้อเท็จจริงที่พบ:** ใน Excel Template ระบุ Part A: **60%** / Part B: **40%** แต่สูตรคำนวณใน Kintone เดิมของ App 310 ใช้ **50% / 50%**
* **คำถามสำหรับ User/HR:** ในระบบ MBO V2 ต้องการให้ Assistant Manager ใช้สัดส่วนใด?
  - [ ] **Option A (ตาม Excel):** Part A: 60% / Part B: 40%
  - [ ] **Option B (ตาม Kintone เดิม):** Part A: 50% / Part B: 50%

### Q2: สัดส่วนคะแนน Part A / Part B ของตำแหน่ง General Manager (App 640)
* **ข้อเท็จจริงที่พบ:** ใน Excel Template ระบุ Part A: **60%** / Part B: **40%** แต่สูตรใน Kintone เดิมใช้ **50% / 50%**
* **คำถามสำหรับ User/HR:** ในระบบ MBO V2 ต้องการให้ General Manager ใช้สัดส่วนใด?
  - [ ] **Option A (ตาม Excel):** Part A: 60% / Part B: 40%
  - [ ] **Option B (ตาม Kintone เดิม):** Part A: 50% / Part B: 50%

### Q3: สัดส่วนคะแนน Part A / Part B ของตำแหน่ง Vice President (App 715)
* **ข้อเท็จจริงที่พบ:** ใน Excel Template ระบุ Part A: **70%** / Part B: **30%** แต่สูตรใน Kintone เดิมใช้ **50% / 50%**
* **คำถามสำหรับ User/HR:** ในระบบ MBO V2 ต้องการให้ Vice President ใช้สัดส่วนใด?
  - [ ] **Option A (ตาม Excel):** Part A: 70% / Part B: 30%
  - [ ] **Option B (ตาม Kintone เดิม):** Part A: 50% / Part B: 50%

---

## Priority 2: HIGH DECISIONS (Competency & COCE Governance)

### Q4: การคิดคะแนนหัวข้อ COCE / Compliance ใน Part B
* **ข้อเท็จจริงที่พบ:** ในแบบฟอร์มมีให้ประเมิน COCE (1-5) แต่ในสูตรคำนวณคะแนนของ Kintone ทุก App ตัวหารไม่รวม COCE (เช่น มี 6 ข้อ แต่ตัวหารเป็น 5)
* **คำถามสำหรับ User/HR:**
  - [ ] **Option A (Gatekeeper):** COCE เป็นหัวข้อตรวจสอบจริยธรรม (Pass/Fail) ไม่นำคะแนนมารวมในค่าเฉลี่ย Part B
  - [ ] **Option B (Scored):** ให้นำคะแนน COCE มารวมและหารเฉลี่ยเท่ากับ Competency ข้ออื่น ๆ
