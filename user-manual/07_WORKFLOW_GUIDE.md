# 07. คู่มือกระบวนการทำงานและวงจรการประเมิน (Workflow Guide)
# Annual Performance Appraisal Cycle & Status Progression

> **Document Status:** Draft  
> **System Version:** MBO V2 (FY2026)  
> **Last Updated:** 2026-08-23  

---

## 1. วงจรการประเมินผลการปฏิบัติงานตลอดปี (Annual Cycle)

```mermaid
graph TD
    subgraph Stage1 [1. รอบต้นปี: ตั้งเป้าหมาย (Objective Setting)]
        S1[01 Draft Objective] --> S2[Manager Review]
        S2 --> S3[GM Review]
        S3 --> S4[05 Objective Approved]
    end

    subgraph Stage2 [2. รอบกลางปี: ทบทวนความคืบหน้า (Mid-Year Progress)]
        S4 --> M1[06 Employee Mid-Year]
        M1 --> M2[Manager Mid-Year Review]
        M2 --> M3[GM Mid-Year Review]
        M3 --> M4[10 Mid-Year Completed]
    end

    subgraph Stage3 [3. รอบปลายปี: ประเมินผลงาน (Year-End Evaluation)]
        M4 --> E1[11 Employee Self Evaluation]
        E1 --> E2[Manager Final Evaluation]
        E2 --> E3[GM Final Evaluation]
        E3 --> E4[15 HR Final Check]
        E4 --> E5[16 Completed]
    end
```

---

## 2. การทำงานของปุ่มส่งกลับแก้ไข (Return Flow)

ในทุกขั้นตอนการพิจารณา หากผู้บังคับบัญชาต้องการให้พนักงานแก้ไขข้อมูล สามารถกดปุ่ม **`Return`** ได้:
* **Manager Return Objective:** เอกสารจะถูกส่งกลับมายังสถานะ `01 Draft Objective` ของพนักงาน
* **GM Return Objective:** เอกสารจะถูกส่งกลับมายังสถานะ `01 Draft Objective` ของพนักงาน
* พนักงานสามารถเปิดแก้ไขข้อความในตาราง ปรับค่าน้ำหนัก และกดส่งให้พิจารณาใหม่อีกครั้งได้

---

## 6. เงื่อนไขการส่งเป้าหมาย (Hoshin Publication Gate)

* ระบบ MBO V2 มีเงื่อนไขความปลอดภัยในการเริ่มต้นกระบวนการอนุมัติ (Workflow Pre-condition):
* แบบฟอร์มเป้าหมายในขั้นตอน **01 Draft Objective** จะสามารถส่งต่อไปยัง **03 Manager Review** ได้ก็ต่อเมื่อ **Hoshin ประจำปีของ Section นั้นได้รับการ Publish เรียบร้อยแล้ว**
* หาก Hoshin ยังไม่ได้รับการ Publish ระบบจะล็อกปุ่ม Submit และแสดงข้อความแนะนำให้พนักงานเตรียมร่างไว้ก่อน
