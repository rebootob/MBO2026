# Combined XLSX Owner-Template + OOXML Composition Compatibility Evidence (D2-WP004-R2-D-PRE1)

- **Authorization Token**: `D2-WP004-R2-D-PRE1-EVIDENCE-ONLY-20260904-01`
- **Inspected Canonical HEAD SHA**: `40a300405e22c59096e6902f2bd2709ee9bd9098`
- **Date**: 2026-09-04 ICT
- **Mode**: `EVIDENCE-ONLY / READ-ONLY OWNER-TEMPLATE INSPECTION / LOW-CREDIT`

---

## 1. Executive Summary & Verdicts

| Dimension | Result / Verdict |
| :--- | :--- |
| **PRE1 Evidence Gate Result** | **`PASS`** |
| **Owner Combined Template Identity** | **`NOT_FOUND`** (Zero combined `.xlsx` workbooks exist in repository/workspace) |
| **Part B Auxiliary Sheet Necessity** | **`AUXILIARY_NOT_REQUIRED_FOR_COMBINED`** (`(Part B) Competency` has zero dependencies on `Sheet1`) |
| **Direct Copy Compatibility** | **`DIRECT_COPY_UNSAFE_REMAP_REQUIRED`** (Styles, sharedStrings, drawings & rels differ between templates) |
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
- **Zero combined owner templates exist** in the repository/workspace.

---

## 3. Package Dependency Inventory (PRE1-B)

Read-only inspection of the ZIP package structures for the frozen Part A and Part B owner templates:

### Package Structural Inventory

| Package Object | Part A Template (`PMS_Staff & Chief_PART_A.xlsx`) | Part B Template (`PMS_Staff & Chief_PART_B.xlsx`) | Comparison / Conflict |
| :--- | :--- | :--- | :--- |
| `[Content_Types].xml` | 1 worksheet (`/xl/worksheets/sheet1.xml`), 1 drawing, 4 media extensions (`.png`, `.jpeg`) | 2 worksheets (`sheet1.xml`, `sheet2.xml`), 1 drawing, 1 media extension (`.png`) | Mismatch in worksheet count & media types |
| `xl/workbook.xml` | 1 sheet (`MBO Staff & Chief`, `r:id="rId1"`), 1 Print_Area | 2 sheets (`(Part B) Competency` `r:id="rId1"`, `Sheet1` `r:id="rId2"`), 1 Print_Area | Mismatch in sheet entries & definedNames |
| `xl/_rels/workbook.xml.rels` | `rId1` -> `sheet1.xml`, `rId2` -> `styles.xml`, `rId3` -> `sharedStrings.xml`, `rId4` -> `theme1.xml` | `rId1` -> `sheet1.xml`, `rId2` -> `sheet2.xml`, `rId3` -> `theme1.xml`, `rId4` -> `styles.xml`, `rId5` -> `sharedStrings.xml` | Mismatch in relationship IDs and targets |
| `xl/styles.xml` | Length: 88,178 bytes (`SHA256: 67e21bf7...`), 429 `cellXfs`, 49 fonts, 15 fills, 47 borders | Length: 40,112 bytes (`SHA256: 03b423e8...`), 142 `cellXfs`, 18 fonts, 5 fills, 46 borders | **CRITICAL MISMATCH** (Style IDs `s="0..141"` map to different formats) |
| `xl/sharedStrings.xml` | Length: 11,293 bytes (`SHA256: f48752f6...`), count=143, uniqueCount=127 | Length: 9,080 bytes (`SHA256: ac8edd74...`), count=69, uniqueCount=50 | **CRITICAL MISMATCH** (Shared string indices `0..49` map to different strings) |
| `xl/theme/theme1.xml` | Office Theme XML | Office Theme XML | Identical Theme XML |
| `xl/drawings/drawing1.xml` | Corporate header graphics (`rId1` -> `image1.jpeg`) | Corporate logo image (`rId1` -> `image1.png`) | Drawing targets & media files differ |
| `xl/media/` | `image1.jpeg`, `image2.jpeg`, `image3.png`, `image4.png` | `image1.png` | Media file inventories differ |

---

## 4. Part B Auxiliary Sheet Necessity Proof (PRE1-C)

Deep package dependency tracing was conducted on Part B owner template `app info/data/PMS_Staff & Chief_PART_B.xlsx`:

1. **`xl/workbook.xml`**:
   - `Sheet1` is registered as `sheetId="2"` with `r:id="rId2"`.
   - Defined names: ONLY `_xlnm.Print_Area` for `'(Part B) Competency'!$A$1:$X$35`. Zero defined names reference `Sheet1`.
2. **`xl/worksheets/sheet1.xml` (`(Part B) Competency`)**:
   - Zero references to `Sheet1` or `sheet2.xml`.
   - Zero formulas referencing `Sheet1`.
3. **`xl/worksheets/sheet2.xml` (`Sheet1`)**:
   - Contains a 2-row static unformatted header block with 2 shared string references (`A1` = index 9, `A2` = index 5).
   - Zero formulas, zero incoming/outgoing relationships, zero drawing/table references.

### Verdict
**`AUXILIARY_NOT_REQUIRED_FOR_COMBINED`**

Part B auxiliary `Sheet1` is an unreferenced legacy leftover and is **NOT** required for the visual, structural, or semantic rendering of `(Part B) Competency`. The Combined Workbook output MUST contain exactly 2 business sheets:
- Sheet 1: `MBO Staff & Chief` (from Part A)
- Sheet 2: `(Part B) Competency` (from Part B)

---

## 5. Direct Copy Compatibility Assessment (PRE1-D)

Directly inserting/copying `xl/worksheets/sheet1.xml` from Part B into Part A as Sheet 2 **without remapping global dependencies** is structurally unsafe and will result in output corruption:

1. **Style ID Collision**:
   Part B main worksheet uses style IDs `s="0"` through `s="141"`. In Part A `styles.xml`, style IDs 0 through 141 define completely different font families, background colors, borders, and alignments. Copying Part B without remapping `s="..."` attribute values causes total cell format corruption.
2. **Shared String Index Collision**:
   Part B main worksheet uses shared string indices `<v>0</v>` through `<v>49</v>`. In Part A `sharedStrings.xml`, indices 0 through 49 contain Part A title texts. Copying Part B without remapping `<v>INDEX</v>` text references causes text corruption across all static headers and labels.
3. **Drawing / Media Rel ID Collision**:
   Part B worksheet links to `drawing1.xml` via `rId2`. `drawing1.xml` in Part B links to `xl/media/image1.png` via `rId1`. In Part A, `rId1` links to `image1.jpeg`. Direct copy causes image/drawing target conflicts.

### Verdict
**`DIRECT_COPY_UNSAFE_REMAP_REQUIRED`**

---

## 6. Recommended Next Strategy (PRE1-E)

### Selected Strategy
**`POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP`**

### Architecture & Operational Flow
1. **Execution Separation**:
   - Render Part A through frozen `preparePartATemplate` + `renderSecuredSemanticValues` to produce `partABytes`.
   - Render Part B through frozen `preparePartBTemplate` + `renderSecuredSemanticValues` to produce `partBBytes`.
2. **Post-Render Composition Layer**:
   - A new, dedicated, bounded composition module combines `partABytes` and `partBBytes` into a single combined Uint8Array package.
   - Merges `xl/styles.xml`: Appends Part B unique `cellXfs` (and associated fonts/fills/borders) to Part A `styles.xml`, creating a style index translation map `mapStyleBToCombined(oldId) -> newId`.
   - Merges `xl/sharedStrings.xml`: Appends Part B unique string items to Part A `sharedStrings.xml`, creating a string index translation map `mapSstBToCombined(oldIdx) -> newIdx`.
   - Inserts Part B main worksheet XML as `xl/worksheets/sheet2.xml`, remapping all `s="ID"` and `<v>INDEX</v>` values using the translation maps.
   - Merges `xl/media/` and `xl/drawings/`: Copies Part B `image1.png` as `xl/media/image_partb_1.png` and updates drawing rels.
   - Updates `xl/workbook.xml` (`<sheet name="(Part B) Competency" sheetId="2" r:id="rId2"/>`), `xl/_rels/workbook.xml.rels`, `[Content_Types].xml`, and definedNames (`_xlnm.Print_Area` for Sheet 1 and Sheet 2).

### Proposed Future File Boundaries (Unimplemented)
- **Production Source**: `src/services/mbo-xlsx-combined-composer.js` (NEW, isolated OOXML composer module).
- **Test Suite**: `tests/mbo-xlsx-combined-composer.test.js` (NEW test suite for combined composition).
- Zero modification to existing preparers, renderers, profiles, or export services.

---

## 7. Machine-Readable Summary

```text
PRE1_RESULT = PASS
OWNER_COMBINED_TEMPLATE = NOT_FOUND
PART_B_AUXILIARY = AUXILIARY_NOT_REQUIRED_FOR_COMBINED
DIRECT_COPY = DIRECT_COPY_UNSAFE_REMAP_REQUIRED
NEXT_STRATEGY = POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP
SOURCE_CHANGE = 0
TEST_CHANGE = 0
TEMPLATE_CHANGE = 0
XLSX_BINARY_COMMITTED = 0
KINTONE_WRITE = 0
DEPLOY = 0
```

---

## 8. Verification & Declarations

- **Writable Scope**: Exactly 1 file modified (`project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md`).
- **Source Code Changed**: `0`
- **Tests Changed**: `0`
- **Template Binaries Committed/Modified**: `0`
- **Kintone Writes / Deploy / Live UAT**: `0`
