# Combined XLSX Owner-Template + OOXML Composition Compatibility Evidence (D2-WP004-R2-D-PRE1-R1)

- **Authorization Token**: `D2-WP004-R2-D-PRE1-R1-EVIDENCE-ONLY-20260904-01`
- **Inspected Canonical HEAD SHA**: `d272f1b7012fcec5bafa2f7338613c46bf2a278e`
- **Date**: 2026-09-04 ICT
- **Mode**: `EVIDENCE-ONLY / READ-ONLY OWNER-TEMPLATE INSPECTION / ULTRA-LOW-CREDIT`

---

## 1. Executive Summary & Verdicts

| Dimension | Result / Verdict |
| :--- | :--- |
| **PRE1-R1 Corrective Evidence Gate Result** | **`PASS`** |
| **Owner Combined Template Identity** | **`NOT_FOUND`** (Zero combined `.xlsx` workbooks exist in repository/workspace) |
| **Part B Auxiliary Sheet Necessity** | **`AUXILIARY_NOT_REQUIRED_FOR_COMBINED`** (`(Part B) Competency` has zero dependencies on `Sheet1`) |
| **Direct Copy Compatibility** | **`DIRECT_COPY_UNSAFE_REMAP_REQUIRED`** (Styles, sharedStrings, drawings & rels differ between templates) |
| **Global Remap Dependencies** | **`EXACT`** (All style, SST, rels, and media dependency mappings deterministically specified) |
| **Recommended Next Strategy** | **`POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP`** |

---

## 2. Local Owner-Template Discovery Inventory (PRE1-A)

All candidate `.xlsx` files in local repository paths (`app info/data` and `exp`) were inspected read-only:

| File Path | SHA-256 Digest | Workbook Sheet Inventory | Role / Template Type |
| :--- | :--- | :--- | :--- |
| `app info/data/PMS_Staff & Chief_PART_A.xlsx` | `03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3` | `[MBO Staff & Chief]` (SheetId=1, Visible) | **Part A Frozen Owner Template** |
| `app info/data/PMS_Staff & Chief_PART_B.xlsx` | `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3` | `[(Part B) Competency, Sheet1]` (SheetId=1,2, Visible) | **Part B Frozen Owner Template** |
| `app info/data/PMS Asst.Sect.Mgr.&Specialist_Part_A.xlsx` | `c6e30ab1ae2cb35ef3df919bbf8007344990dfacb98eaa7fcec7a48b171e3c4a` | `[MBO Staff & Chief]` | Asst.Sect.Mgr Part A Template |
| `app info/data/PMS Asst.Sect.Mgr.&Specialist_Part_B.xlsx` | `bf8fdaf7ee2fb2f5acb77eacfe8daf7b561dec55dbe2a1252d00fbe5871542f8` | `[(Part B) Competency]` | Asst.Sect.Mgr Part B Template |
| `app info/data/PMS GM_Part A.xlsx` | `2cc6ff4de91b95333275c6047c2a5752e9d3c0016170f7f8ba066b5f33638c5d` | `[MBO Staff & Chief]` | GM Part A Template (Alt) |
| `app info/data/PMS GM_Part B.xlsx` | `0b3265a02b599946b9d3c12d562561571a32f71c64a866bc20a3b00dca7f6d6c` | `[(Part B) Competency]` | GM Part B Template (Alt) |
| `app info/data/PMS GM_Part_A.xlsx` | `763e333d16ac5c9f8a74420e8382cf2052086320c86a7f07268579caf1e8c7bd` | `[MBO Staff & Chief]` | GM Part A Template |
| `app info/data/PMS GM_Part_B.xlsx` | `181b59bed1af7755ec99bbb96eeaf592f22746ca9610b1cb4082f91375ec2a06` | `[(Part B) Competency]` | GM Part B Template |
| `exp/PMS_Staff & Chief_PART_A.xlsx` | `aa1b51a9b1926e5fa87ca9a7052e00df288b05f42c331c9cd1fbcf18eb49891b` | `[MBO Staff & Chief]` | Experimental Part A export |
| `exp/PMS_Staff & Chief_PART_B.xlsx` | `cbc48fc15f100d11486485352000a4c7b9659e2a7b4d628605ba8e2574c8bb11` | `[(Part B) Competency, Sheet1]` | Experimental Part B export |

### Owner Template Identity Verification
- Both frozen owner template SHAs (`03d1e8c3...` for Part A and `c210c049...` for Part B) were located in `app info/data/`.
- **Zero combined owner templates exist** in the repository/workspace (`OWNER_COMBINED_TEMPLATE = NOT_FOUND`).

---

## 3. Complete Exact Package Inventory & SHA-256 Proofs (PRE1-R1-A)

### 3.1 Full Package SHA-256 Fingerprints

#### Part A Owner Template (`PMS_Staff & Chief_PART_A.xlsx` — `03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3`)

| Package Object Path | Byte Size | Full SHA-256 Digest |
| :--- | :--- | :--- |
| `[Content_Types].xml` | 1,506 | `340857aee638740ea5faddbc468acfe49155eed703c2990583f49a398e9b779e` |
| `_rels/.rels` | 588 | `73e5a29f48d5ab979eeda062493bc7e679265c1344ef936978b8becec5549497` |
| `docProps/app.xml` | 954 | `8aa3f65b55e7dfaeefb0ab10effaa8247ab14bfc336d3c998dfaae96bac1520b` |
| `docProps/core.xml` | 663 | `c60a8a83788aed47f235bc46d7d04c757014c0cf4f5368f22f2caa8e107ba655` |
| `xl/_rels/workbook.xml.rels` | 698 | `353383fbe90f202be596bdf0a86439c704d7024f4f8c19ebc9d06b42a341dba1` |
| `xl/workbook.xml` | 1,312 | `32db24918e971a240b5547edd2031f664131d08a4e03018f543677fba38e5037` |
| `xl/styles.xml` | 88,196 | `67e21bf791812522508bcd37dd7d5c06a8b87b86d992dc036a105c46b910f99b` |
| `xl/sharedStrings.xml` | 11,293 | `f48752f6aac86864e7946a76454dd08c744c22bc10c14f3fb9de17958d5b5397` |
| `xl/theme/theme1.xml` | 6,796 | `e6029ab4958414b8bb862b17ffed3a708d1513e61a07d88e966071cca31d1bd4` |
| `xl/worksheets/sheet1.xml` (`MBO Staff & Chief`) | 70,272 | `0b0ecb311d42784ac839dc46a410c7d655216db8458a621c4ea62d0a82198c69` |
| `xl/worksheets/_rels/sheet1.xml.rels` | 464 | `046f319d2b01bf9529da901ae33cb1cf8c7c7d06395167875fa0c4add6bf34c3` |
| `xl/drawings/drawing1.xml` | 6,774 | `70c92ba7ecf859a5a2060bda4937cc35e180d0d3ef503a9558ddf984bc3cab6b` |
| `xl/drawings/_rels/drawing1.xml.rels` | 697 | `fdb3db551f517fdd9090f53509ed53a0619de6b0de4fb4bbf08b590e2ea0d565` |
| `xl/media/image1.jpeg` | 15,615 | `1eaf0887489e1b5bd88d19807d5261aa751ec7377641cbfcdc4823737f7bb09a` |
| `xl/media/image2.jpeg` | 10,433 | `976fbdbb0d74b8ed7ecc2785af79acbe31b627b22a965fc35daa8d6d77a54f69` |
| `xl/media/image3.png` | 148,516 | `264ba15167bddba4ed360fef10203a6508a94b2071ab87312001791e0ef111c3` |
| `xl/media/image4.png` | 180,124 | `25a21ad53f5ac640bc22482f4948696db4a024167096371611fa0fff2f362af5` |
| `xl/printerSettings/printerSettings1.bin` | 5,420 | `c68f7b67595fcf72d3bff7e6458f779b3d940880214403040282481d4114ed95` |

#### Part B Owner Template (`PMS_Staff & Chief_PART_B.xlsx` — `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`)

| Package Object Path | Byte Size | Full SHA-256 Digest |
| :--- | :--- | :--- |
| `[Content_Types].xml` | 1,590 | `11c0564f8cb3fb10fbd741a2a17bb7c7f909c21402202b86ce7462e9e20887fa` |
| `_rels/.rels` | 588 | `73e5a29f48d5ab979eeda062493bc7e679265c1344ef936978b8becec5549497` |
| `docProps/app.xml` | 977 | `57ebac40d33f2a84936be75e0b196254f369dc0752ea0b2c7983966efce8d096` |
| `docProps/core.xml` | 667 | `b404eb4b7a92b0293aadde7a90cd114df1b1145cd9a897a5d2126f6622674eea` |
| `xl/_rels/workbook.xml.rels` | 839 | `15e353ac27ab7362603f4a0d0754a97885e8e2ce523615a3cd59b458ddcd60e9` |
| `xl/workbook.xml` | 1,940 | `7d31aa20a8f59dfbde8618b77aafff4f5f85ed26bfe7fa404969a0147871a8a8` |
| `xl/styles.xml` | 40,112 | `03b423e842fbb0e846058d3a5ef44bf137db097cca4fb7da92d65a7718f1f86d` |
| `xl/sharedStrings.xml` | 11,499 | `ac8edd7472930503c0a7fc04fb323e554074cc662c7cdac46f4afc514818d5da` |
| `xl/theme/theme1.xml` | 6,796 | `e6029ab4958414b8bb862b17ffed3a708d1513e61a07d88e966071cca31d1bd4` |
| `xl/worksheets/sheet1.xml` (`(Part B) Competency`) | 25,167 | `e72b16ca9d6c7bec274c13649cae6c2decc09cb9662f8c708810350bdbdbb41d` |
| `xl/worksheets/_rels/sheet1.xml.rels` | 464 | `046f319d2b01bf9529da901ae33cb1cf8c7c7d06395167875fa0c4add6bf34c3` |
| `xl/worksheets/sheet2.xml` (`Sheet1` Auxiliary) | 1,279 | `7e0a4ee78b49c0a65189a773def58e6e32da198394fe45d5fc8e2b947485506e` |
| `xl/drawings/drawing1.xml` | 3,017 | `bef550aa214267c75b389e6a5af97051497764395b36dbff1d22007ff2c855c9` |
| `xl/drawings/_rels/drawing1.xml.rels` | 290 | `e493327278b6281322cd78c18f4a8360878b309ed0030b56eba8e7f820e39d42` |
| `xl/media/image1.png` | 3,279 | `6e5e2494a900015f94954d6478441b1ff663d11cdd06a34d04a4ba5736b4e0b0` |
| `xl/printerSettings/printerSettings1.bin` | 1,264 | `23c239bceed53fbeeaa24c392ba3f3d77eee5d9d7e20ede3c05e05100c89eba7` |

> [!NOTE]
> **Theme Proof**: `xl/theme/theme1.xml` in both Part A and Part B have identical length (6,796 bytes) and identical SHA-256 digest (`e6029ab4958414b8bb862b17ffed3a708d1513e61a07d88e966071cca31d1bd4`), proving 100% theme authority parity.

---

### 3.2 Top-Level `xl/styles.xml` Element Counts & Inventories

| Style Tag / Table | Part A Template (`styles.xml`) | Part B Template (`styles.xml`) |
| :--- | :--- | :--- |
| `<numFmts>` | `PRESENT` (count = 1) | `PRESENT` (count = 1) |
| `<fonts>` | `PRESENT` (count = 49) | `PRESENT` (count = 18) |
| `<fills>` | `PRESENT` (count = 15) | `PRESENT` (count = 5) |
| `<borders>` | `PRESENT` (count = 47) | `PRESENT` (count = 46) |
| `<cellStyleXfs>` | `PRESENT` (count = 3) | `PRESENT` (count = 3) |
| `<cellXfs>` | `PRESENT` (count = 429) | `PRESENT` (count = 142) |
| `<cellStyles>` | `PRESENT` (count = 3) | `PRESENT` (count = 3) |
| `<dxfs>` | `PRESENT` (count = 0) | `PRESENT` (count = 0) |
| `<tableStyles>` | `PRESENT` (count = 0) | `PRESENT` (count = 0) |
| `<colors>` | `NONE` | `NONE` |
| `<extLst>` | `PRESENT` (extLst block present) | `PRESENT` (extLst block present) |

---

### 3.3 Exact Used Style-ID Sets

- **Part A Main Sheet (`MBO Staff & Chief` / `sheet1.xml`)**:
  - Total unique used style IDs: **428**
  - Range: Min `1`, Max `428`
  - Exact Used Set: `[1..428]` (all styles 1 through 428 are actively referenced; style 0 is default/normal).

- **Part B Main Sheet (`(Part B) Competency` / `sheet1.xml`)**:
  - Total unique used style IDs: **133**
  - Range: Min `1`, Max `141`
  - Exact Used Set: `[1, 2, 3, 5..42, 44..123, 130..141]` (styles 4, 43, 124..129 are not referenced in the main sheet).

- **Part B Auxiliary Sheet (`Sheet1` / `sheet2.xml`)**:
  - Total unique used style IDs: **6**
  - Exact Used Set: `[124, 125, 126, 127, 128, 129]` (used exclusively by the unused legacy auxiliary sheet).

---

### 3.4 Exact Used Shared-String Index Sets

- **Part A Main Sheet (`MBO Staff & Chief` / `sheet1.xml`)**:
  - Total unique used shared-string indices: **123**
  - Range: Min `0`, Max `126`
  - Exact Used Set: `[0..67, 72..126]` (indices 68..71 are unreferenced).

- **Part B Main Sheet (`(Part B) Competency` / `sheet1.xml`)**:
  - Total unique used shared-string indices: **50**
  - Range: Min `0`, Max `49`
  - Exact Used Set: `[0..49]` (all indices 0 through 49 are actively referenced).

- **Part B Auxiliary Sheet (`Sheet1` / `sheet2.xml`)**:
  - Total unique used shared-string indices: **2**
  - Exact Used Set: `[5, 9]` (used by legacy header labels).

---

### 3.5 Exact OOXML Relationship Tuples `(Id, Type, Target, TargetMode)`

#### Part A Package Relationships (`_rels/.rels`)
- `(Id="rId1", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument", Target="xl/workbook.xml", TargetMode="Internal")`
- `(Id="rId2", Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties", Target="docProps/core.xml", TargetMode="Internal")`
- `(Id="rId3", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties", Target="docProps/app.xml", TargetMode="Internal")`

#### Part A Workbook Relationships (`xl/_rels/workbook.xml.rels`)
- `(Id="rId1", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet", Target="worksheets/sheet1.xml", TargetMode="Internal")`
- `(Id="rId2", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme", Target="theme/theme1.xml", TargetMode="Internal")`
- `(Id="rId3", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", Target="styles.xml", TargetMode="Internal")`
- `(Id="rId4", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings", Target="sharedStrings.xml", TargetMode="Internal")`

#### Part A Worksheet 1 Relationships (`xl/worksheets/_rels/sheet1.xml.rels`)
- `(Id="rId1", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/printerSettings", Target="../printerSettings/printerSettings1.bin", TargetMode="Internal")`
- `(Id="rId2", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing", Target="../drawings/drawing1.xml", TargetMode="Internal")`

#### Part A Drawing 1 Relationships (`xl/drawings/_rels/drawing1.xml.rels`)
- `(Id="rId1", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Target="../media/image1.jpeg", TargetMode="Internal")`
- `(Id="rId2", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Target="../media/image2.jpeg", TargetMode="Internal")`
- `(Id="rId3", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Target="../media/image3.png", TargetMode="Internal")`
- `(Id="rId4", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Target="../media/image4.png", TargetMode="Internal")`

#### Part B Package Relationships (`_rels/.rels`)
- Identical to Part A Package Relationships.

#### Part B Workbook Relationships (`xl/_rels/workbook.xml.rels`)
- `(Id="rId1", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet", Target="worksheets/sheet1.xml", TargetMode="Internal")`
- `(Id="rId2", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet", Target="worksheets/sheet2.xml", TargetMode="Internal")`
- `(Id="rId3", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme", Target="theme/theme1.xml", TargetMode="Internal")`
- `(Id="rId4", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", Target="styles.xml", TargetMode="Internal")`
- `(Id="rId5", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings", Target="sharedStrings.xml", TargetMode="Internal")`

#### Part B Worksheet 1 Relationships (`xl/worksheets/_rels/sheet1.xml.rels`)
- `(Id="rId1", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/printerSettings", Target="../printerSettings/printerSettings1.bin", TargetMode="Internal")`
- `(Id="rId2", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing", Target="../drawings/drawing1.xml", TargetMode="Internal")`

#### Part B Drawing 1 Relationships (`xl/drawings/_rels/drawing1.xml.rels`)
- `(Id="rId1", Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Target="../media/image1.png", TargetMode="Internal")`

---

### 3.6 Dependency Presence / Absence Matrix

| Dependency Type | Part A Main (`sheet1.xml`) | Part B Main (`sheet1.xml`) | Part B Auxiliary (`sheet2.xml`) |
| :--- | :--- | :--- | :--- |
| **Comments / Threaded Comments** | `NONE` | `NONE` | `NONE` |
| **Tables (`<tableParts>`)** | `NONE` | `NONE` | `NONE` |
| **Hyperlinks (`<hyperlinks>`)** | `NONE` | `NONE` | `NONE` |
| **External Links (`externalLink`)** | `NONE` | `NONE` | `NONE` |
| **Drawings (`<drawing>`)** | `PRESENT` (`drawing1.xml`) | `PRESENT` (`drawing1.xml`) | `NONE` |
| **Charts** | `NONE` | `NONE` | `NONE` |
| **Data Validation (`<dataValidations>`)** | `NONE` | `NONE` | `NONE` |
| **External References (`[1]`, `[2]`)** | `NONE` | `NONE` | `NONE` |
| **Formulas (`<f>`)** | `NONE` (Count = 0) | `NONE` (Count = 0) | `NONE` (Count = 0) |

---

## 4. Exhaustive Auxiliary `Sheet1` Dependency Proof (PRE1-R1-B)

Deterministic scanning across all OOXML parts in Part B owner template (`PMS_Staff & Chief_PART_B.xlsx`):

1. **`xl/workbook.xml`**:
   - Registered sheets: Sheet 1 `(Part B) Competency` (`sheetId="1"`, `r:id="rId1"`), Sheet 2 `Sheet1` (`sheetId="2"`, `r:id="rId2"`).
   - Defined names: Exactly one entry: `_xlnm.Print_Area` pointing to `'(Part B) Competency'!$A$1:$X$35`. Zero defined names reference `Sheet1`.
2. **`xl/worksheets/sheet1.xml` (`(Part B) Competency`)**:
   - Zero occurrences of `Sheet1`, `sheet2.xml`, or `[2]`.
   - Zero cross-sheet formula references.
3. **`xl/worksheets/sheet2.xml` (`Sheet1`)**:
   - Contains 2 static text cells (`A1` = index 9, `A2` = index 5). Zero incoming or outgoing dependencies.
4. **Relationship & Content Parts**:
   - `[Content_Types].xml`, `xl/_rels/workbook.xml.rels`, and `docProps/app.xml` reference `sheet2.xml` only as a standard unreferenced sheet declaration.

### Final Verdict
**`AUXILIARY_NOT_REQUIRED_FOR_COMBINED`**

Auxiliary `Sheet1` is an unreferenced legacy leftover. Combined workbook MUST contain exactly **2 business sheets**:
- Sheet 1: `MBO Staff & Chief` (from Part A)
- Sheet 2: `(Part B) Competency` (from Part B)

---

## 5. Exact Direct-Copy Collision Proof (PRE1-R1-C)

Direct insertion of Part B sheet into Part A without remapping fails due to severe OOXML collisions:

### 5.1 Style ID Collisions

Same style index resolves to completely different formatting definitions between Part A and Part B `xl/styles.xml`:

- **Style `s="1"`**:
  - Part A: `numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"`
  - Part B: `numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="1" applyBorder="1" applyProtection="1"`
- **Style `s="10"`**:
  - Part A: `numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="1" applyFont="1" applyAlignment="1"`
  - Part B: `numFmtId="164" fontId="7" fillId="3" borderId="6" xfId="1" quotePrefix="1" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1" applyProtection="1"`
- **Style `s="20"`**:
  - Part A: `numFmtId="0" fontId="10" fillId="3" borderId="0" xfId="1" applyFont="1" applyFill="1" applyAlignment="1"`
  - Part B: `numFmtId="0" fontId="7" fillId="0" borderId="4" xfId="1" applyFont="1" applyBorder="1" applyAlignment="1" applyProtection="1"`

### 5.2 Shared String Index Collisions

Same shared string index `<v>INDEX</v>` resolves to completely different text payloads between Part A and Part B `xl/sharedStrings.xml`:

- **Index `0`**: Part A = `" "` (single space) vs Part B = `"Department"`
- **Index `1`**: Part A = `"RATING SCALE"` vs Part B = `"Section"`
- **Index `5`**: Part A = `"Guideline"` vs Part B = `" Criteria"`
- **Index `9`**: Part A = `"Difficult obj.with much effort"` vs Part B = `"Rating Scale"`
- **Index `20`**: Part A = `"Part A : MBO"` vs Part B = `"[A] Total : 50 Points "`

### 5.3 Drawing & Media Path / Relationship Collisions

- **Worksheet Relationship ID Conflict**: In Part A, `sheet1.xml` uses `rId2` for `../drawings/drawing1.xml`. In Part B, `sheet1.xml` also uses `rId2` for `../drawings/drawing1.xml`.
- **Drawing Part Name Conflict**: Both Part A and Part B own a drawing file named `xl/drawings/drawing1.xml`. Direct copy overwrites Part A drawing with Part B drawing.
- **Media Target & Extension Collision**: In Part A `drawing1.xml.rels`, `rId1` points to `../media/image1.jpeg`. In Part B `drawing1.xml.rels`, `rId1` points to `../media/image1.png`.

### Final Verdict
**`DIRECT_COPY_UNSAFE_REMAP_REQUIRED`**

---

## 6. Corrected Future Strategy Dependency Map (PRE1-R1-D)

If `POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP` is authorized for implementation in future gates, the composer design MUST strictly enforce:

1. **Part A Package Base Authority**: Part A rendered package serves as the primary base authority container (`workbook.xml`, `styles.xml`, `sharedStrings.xml`, `theme1.xml`, `sheet1.xml`).
2. **New Unique Workbook Relationship ID**:
   - Part A `xl/_rels/workbook.xml.rels` currently uses `rId1` (`sheet1.xml`), `rId2` (`theme1.xml`), `rId3` (`styles.xml`), and `rId4` (`sharedStrings.xml`).
   - **Correction**: The future composer MUST allocate **`rId5`** for Part B main sheet (`xl/worksheets/sheet2.xml`). Hard-coding `rId2` (as incorrectly drafted in PRE1) is FORBIDDEN as it collides with `theme1.xml`.
3. **Unique Worksheet Part Path**: Insert Part B main sheet as `xl/worksheets/sheet2.xml`.
4. **Unique Drawing Part Name**: Rename Part B drawing to `xl/drawings/drawing2.xml` and update `xl/worksheets/_rels/sheet2.xml.rels` accordingly.
5. **Unique Media Part Target**: Copy Part B logo `image1.png` to `xl/media/image_partb_1.png` and update `xl/drawings/_rels/drawing2.xml.rels` (`rId1` -> `../media/image_partb_1.png`).
6. **Recursive Style Dependency Remap**:
   - Append referenced Part B style components to Part A style collections:
     - `numFmt`: Map Part B custom `numFmtId="164"` to unused custom `numFmtId` in Part A (e.g. `165`).
     - `fonts`: Append Part B unique fonts to Part A `<fonts>`, building `mapFontB(old) -> new`.
     - `fills`: Append Part B unique fills to Part A `<fills>`, building `mapFillB(old) -> new`.
     - `borders`: Append Part B unique borders to Part A `<borders>`, building `mapBorderB(old) -> new`.
     - `cellStyleXfs`: Map/append `cellStyleXfs` references (`xfId`).
   - Append Part B `cellXfs` to Part A `<cellXfs>`, remapping child attribute IDs (`numFmtId`, `fontId`, `fillId`, `borderId`, `xfId`).
   - Build style translation function `mapStyleB(oldStyleId) -> (429 + offset)`.
7. **Shared String Remap**:
   - Append Part B shared strings (indices `0..49`) to Part A `sharedStrings.xml`, building index translation map `mapSstB(oldIdx) -> (127 + oldIdx)`.
   - Update `<v>INDEX</v>` elements in Part B `sheet2.xml` using `mapSstB`.
8. **Defined Names & Print Area Handling**:
   - Exclude auxiliary `Sheet1`.
   - Set Sheet 1 definedName: `<definedName name="_xlnm.Print_Area" localSheetId="0">'MBO Staff & Chief'!$A$1:$X$52</definedName>`
   - Set Sheet 2 definedName: `<definedName name="_xlnm.Print_Area" localSheetId="1">'(Part B) Competency'!$A$1:$X$35</definedName>`
9. **Content Types & Relationships**:
   - Add `/xl/worksheets/sheet2.xml` and `/xl/drawings/drawing2.xml` to `[Content_Types].xml`.
   - Update `xl/workbook.xml` with `<sheet name="(Part B) Competency" sheetId="2" r:id="rId5"/>`.
10. **Preservation & Non-Regression**:
   - 100% preservation of Part A package authority, formulas count = 0, and expanded privacy behavior.

---

## 7. Machine-Readable Summary

```text
=== BEGIN R2-D-PRE1-R1 EVIDENCE SUMMARY ===
AUTHORIZATION_TOKEN = D2-WP004-R2-D-PRE1-R1-EVIDENCE-ONLY-20260904-01
PRE1_R1_RESULT = PASS
OWNER_COMBINED_TEMPLATE = NOT_FOUND
PART_B_AUXILIARY = AUXILIARY_NOT_REQUIRED_FOR_COMBINED
DIRECT_COPY = DIRECT_COPY_UNSAFE_REMAP_REQUIRED
GLOBAL_REMAP_DEPENDENCIES = EXACT
NEXT_STRATEGY = POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP
SOURCE_CHANGE = 0
TEST_CHANGE = 0
TEMPLATE_CHANGE = 0
XLSX_BINARY_COMMITTED = 0
KINTONE_WRITE = 0
DEPLOY = 0
=== END R2-D-PRE1-R1 EVIDENCE SUMMARY ===
```

---

## 8. Verification & Declarations

- **Writable Scope**: Exactly 1 file modified ([`project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md)).
- **Source Code Changed**: `0`
- **Tests Changed**: `0`
- **Template Profile Changed**: `0`
- **Template Binaries Committed/Modified**: `0`
- **Control Docs Changed**: `0`
- **Kintone Writes / Deploy / Live UAT / PDF / D3**: `0`
