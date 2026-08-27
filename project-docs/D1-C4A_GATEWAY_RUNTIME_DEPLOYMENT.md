# D1-C4A Portable Trusted Node Gateway Runtime

Status: `READY_PENDING_INDEPENDENT_REVIEW`; this is a deployment plan only, not a deployment authorization.

Run the reviewed package with a supported Node.js LTS runtime and server-side environment variables only. Both Windows Server/VM and Linux VM use the same command:

```text
node src/server/mbo-gateway-server.js
```

Set `NODE_ENV=production`, `PORT`, `MBO_ALLOWED_ORIGIN`, `MBO_COOKIE_SECURE=true`, `MBO_COOKIE_SAMESITE=Lax|Strict`, `MBO_OUTER_SHARED_KINTONE_PRINCIPAL`, `KINTONE_BASE_URL`, and `KINTONE_SERVER_CREDENTIAL` through the host's secret/service configuration. Do not place secrets in Git, browser code, or command history.

Windows: run under an approved service/process manager with a restricted service identity. Linux: run under an approved service manager with a non-login service account. Host selection, DNS, TLS termination/certificates, firewall, and service-account provisioning remain separate authorization gates.

Rollback: stop the new process/service, remove its route from the approved reverse proxy/load balancer, and retain no browser session state. No Kintone rollback applies because this package performs no schema, ACL, deployment, or configuration changes.
