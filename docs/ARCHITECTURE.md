# MBO V2 Architecture

## Applications

1. **MBO V2 Sandbox**: employee MBO transaction, workflow, calculations, audit, custom UI, and exports.
2. **MBO Routing Master Sandbox**: section-to-requester/manager/GM routing.
3. **Employee Namelist (App 53)**: read-only source for employee lookup and initial snapshot data.

## Design rules

- Employee identity is Employee Code, never the shared requester login.
- Employee and routing fields are server-controlled snapshots after lookup.
- Kintone permissions are the authorization boundary; custom UI is only presentation.
- One shared core module will serve desktop and mobile behavior.
- The fiscal-year/employee business key is unique in MBO V2.
