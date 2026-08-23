# 05. คู่มือสายการอนุมัติ (Approval Routing Guide)
# Approval Hierarchy, Sequential Levels, and Multi-Approver Rules

> **Document Status:** Draft  
> **System Version:** MBO V2 (FY2026)  
> **Last Updated:** 2026-08-23  

---

## 1. แนวคิดพื้นฐาน: LEVEL vs. APPROVAL RULE

ระบบ MBO V2 แยก 2 แนวคิดออกจากกันอย่างชัดเจน:

```
[ LEVEL (ลำดับขั้น) ]
= เอกสารต้องไหลผ่านใครก่อน-หลังตามสายบังคับบัญชา
(Sequence of Stages: Manager L1 -> Manager L2 -> GM L1 -> GM L2)

[ APPROVAL RULE (เงื่อนไขภายในขั้น) ]
= เมื่อในขั้นนั้นมีผู้อนุมัติหลายคน ต้องอนุมัติกี่คนจึงจะผ่าน
(ALL = ทุกคนต้องอนุมัติ | ANY = คนใดคนหนึ่งอนุมัติ)
```

---

## 2. ความแตกต่างระหว่าง ALL และ ANY

### 🟢 กฎ `ALL` (มาตรฐานเริ่มต้น / Default Standard)
* **ความหมาย:** ผู้อนุมัติ **ทุกคน** ที่ระบุในระดับนั้น จะต้องกดอนุมัติครบทุกคน เอกสารถึงจะขยับไปยังระดับถัดไปได้
* **ตัวอย่าง:**
  * Manager Level 1 กำหนดผู้จัดการ 2 ท่าน: `User A` และ `User B` (Rule = `ALL`)
  * `User A` กด Approve $	o$ สถานะยังคงรออยู่ที่ Manager Level 1 (`Pending`)
  * `User B` เข้ามากด Approve เพิ่ม $	o$ เอกสารผ่านขั้น Manager Level 1 และส่งต่อให้ GM ทันที

### 🔵 กฎ `ANY` (ข้อยกเว้นกรณีอนุมัติแทนกันได้ / Alternative Approval)
* **ความหมาย:** ผู้อนุมัติ **คนใดคนหนึ่ง** ในระดับนั้นกดอนุมัติเพียงคนเดียว ถือว่าผ่านระดับนั้นทันที
* **ตัวอย่าง:**
  * GM Level 1 กำหนดผู้บริหาร 2 ท่าน: `GM A` และ `GM B` (Rule = `ANY`)
  * `GM A` กด Approve $	o$ เอกสารผ่าน GM Level 1 ทันที โดยที่ `GM B` ไม่ต้องกดซ้ำ

---

## 3. ข้อแตกต่างสำคัญ: Multi-Approver vs. Sequential Levels

| รูปแบบ / Model | โครงสร้างที่ตั้งค่า / Configuration | ลำดับการทำงานจริง / Actual Workflow |
| :--- | :--- | :--- |
| **Multi-Approver (ALL)** | Manager Level 1 = `[User A, User B]` (Rule: `ALL`) | User A และ User B เป็นผู้อนุมัติร่วมในระดับเดียวกัน ใครจะกดก่อนก็ได้ แต่ต้องครบทั้ง 2 ท่าน |
| **Sequential (L1 $	o$ L2)** | Manager Level 1 = `[User A]`<br/>Manager Level 2 = `[User B]` | User A (เช่น ผู้จัดการฝึกหัด) ต้องอนุมัติก่อน เอกสารจึงจะส่งต่อไปยัง User B (ผู้จัดการพี่เลี้ยง) |

---

## 4. กฎการข้ามระดับเมื่อไม่มีข้อมูล (Empty Level Rule)
หากระดับใดไม่มีการระบุผู้อนุมัติ (ปล่อยว่างไว้) ระบบจะ **ข้ามระดับนั้นโดยอัตโนมัติ** เสมือนว่าไม่มีขั้นตอนนี้:
* ตัวอย่าง: Manager Level 1 = `User A`, Manager Level 2 = `[ว่าง]`, GM Level 1 = `User B`, GM Level 2 = `[ว่าง]`
* เส้นทางจริง: **Employee $	o$ User A $	o$ User B $	o$ อนุมัติสำเร็จ**

---

## 5. รูปแบบเส้นทางการอนุมัติ 4 แบบ (Topologies)

```mermaid
graph LR
    subgraph Topology 1 [M1 -> G1 (Standard)]
        E1[Employee] --> M1[Manager L1] --> G1[GM L1] --> AP1[Approved]
    end
```

```mermaid
graph LR
    subgraph Topology 2 [M1 -> M2 -> G1 (Trainee Manager)]
        E2[Employee] --> M21[Manager L1] --> M22[Manager L2] --> G21[GM L1] --> AP2[Approved]
    end
```

```mermaid
graph LR
    subgraph Topology 3 [M1 -> G1 -> G2 (Division Head)]
        E3[Employee] --> M31[Manager L1] --> G31[GM L1] --> G32[GM L2] --> AP3[Approved]
    end
```

```mermaid
graph LR
    subgraph Topology 4 [M1 -> M2 -> G1 -> G2 (Full 4-Level)]
        E4[Employee] --> M41[Manager L1] --> M42[Manager L2] --> G41[GM L1] --> G42[GM L2] --> AP4[Approved]
    end
```
