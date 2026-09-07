# MBO2026 Release Exit Checklist & Production Readiness

Updated: 2026-09-08 ICT

## Production readiness summary

- **PRODUCTION_READY**: **NO**
- **PRODUCTION_CUTOVER_AUTHORIZED**: **NO**
- **D3**: **HOLD**
- **OWNER_UAT**: **IN PROGRESS / NOT PASSED**

> Production remains blocked while any material identity/access/UAT gate is unresolved. Sandbox customization deployment is not production cutover.

## Current material gate overrides

The previous D1 automated/source closure remains the technical baseline, but real Owner UAT proved two regressions. Until corrected candidate deployment and Owner retest pass, the following release gates are temporarily reopened:

| GATE_ID | REQUIREMENT | STATUS | CURRENT BLOCKER / EVIDENCE |
|---|---|---|---|
| `GATE-SEC-01` | Identity, Session Auth & Hybrid Access Control | **IN_PROGRESS / REOPENED BY PROVEN REGRESSION** | `D1-UAT-DEFECT-001`; source fix reviewed, sandbox deploy + Owner UAT pending |
| `GATE-SELF-01` | Employee Self Portal & Navigation | **IN_PROGRESS / REOPENED BY PROVEN REGRESSION** | `D1-UAT-DEFECT-002`; source fix reviewed, sandbox deploy + Owner UAT pending |
| `GATE-UAT-01` | End-to-End Business User Acceptance Testing | **IN_PROGRESS** | Owner started real sandbox UAT; not globally accepted |
| `GATE-PROD-01` | Pre-deployment / customization safety | **IN_PROGRESS** | deploy tool CSS target corrected and reviewed; one-shot App794 Sandbox deploy authorized but not yet independently accepted |
| `GATE-CUTOVER-01` | Final Production Cutover | **NOT_STARTED** | Owner signoff + all blocking gates required |

## Hybrid Identity UAT acceptance

Required runtime outcomes:

```text
Employee 0113 / Ms.Papatchaya has dedicated App53 mapping.

Ms.Papatchaya personal Kintone login
-> auto-bind 0113
-> ALLOW own Employee-Self

tmh + Employee 0113 + App801 credential
-> DENY / dedicated account required

tmh + employee whose valid App53 MBO_Kintone_User.value = []
-> valid App801 login
-> ALLOW Shared Employee-Self
```

Any missing/malformed/ambiguous App53 mapping must fail closed.

## Employee-Self current-FY entry acceptance

```text
1 existing current-FY MBO -> Open Current MBO
0 existing current-FY MBO -> Create New MBO
>1 current-FY MBO -> fail safe / no Create
```

Backend duplicate guard must remain active.

## Current corrective/deployment evidence chain

```text
R1 = 8c3fda998fe8bd0b627d62a5beb10455bde8f725 / PARTIAL PASS
R2 = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb / PASS
BUILD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
DEPLOY_TOOL = 03b531383e86c643a5258a2baf6fdbd15bc9099e / PASS
CANONICAL_CSS = mbo-employee.css
```

No accepted evidence yet proves this candidate has been deployed to App794.

## Authorized sandbox deploy gate

Owner approved one-shot App794 customization deploy:

```text
WORK_PACKAGE = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2
AUTHORIZATION_ID = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02
TARGET = App794 customization only
MAX_ATTEMPTS = 1
AUTO_RETRY = NO
AUTO_ROLLBACK = NO
```

Allowed writes only:
- candidate JS upload;
- candidate CSS upload;
- App794 Preview customization PUT;
- App794 deploy POST.

Must remain zero:
- App794 record writes;
- App53/App801/other app record writes;
- schema/layout writes;
- ACL writes;
- Process Management writes.

## D2 release status

D2 engineering remains `PASS / CLOSED / DURABLE` and is not reopened by the D1 defect chain.

Accepted engineering evidence:
- focused export suite: `16 PASS / 0 FAIL / 0 SKIP`;
- frozen 5-file XLSX regression: `44 PASS / 0 FAIL / 0 SKIP`;
- PDF `XLSX-007`: Owner-deferred / outside current release / non-blocking.

Owner UAT of the full user journey remains separate and incomplete.

## Exit sequence

1. Execute authorized App794 Sandbox deployment only.
2. ChatGPT independently reviews deployment evidence and deployed bytes.
3. Owner performs the four focused runtime UAT cases.
4. If PASS, resume broader Owner UAT.
5. Recompute/reclose SEC/SELF/UAT release gates only from real evidence.
6. D3 remains HOLD until explicitly authorized.
7. Production cutover remains forbidden.
