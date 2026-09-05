# Security Hub — Web Application Security

An educational and interactive web application security learning hub created by **Irshad Akaram**. It covers 22+ web vulnerabilities with in-depth theory guides (Hindi & English) and 44 interactive live attack simulations and penetration testing checklists.

---

## 📁 Directory Structure

```text
WebSec/
├── index.html                   # Main Portal / Dashboard Hub
├── coming-soon.html             # Upcoming vulnerability modules
├── INTEGRATION.md               # Guide to connect index.html into other projects
│
├── guides/                      # 23 In-depth Vulnerability Guides (Theory, Impact, Remediation)
│   ├── Broken_Auth.html
│   ├── CMDI.html
│   ├── CORS.html
│   ├── CSP.html
│   ├── CSRF.html
│   ├── DoS.html
│   ├── File_Upload.html
│   ├── Host_Header_Injection.html
│   ├── IDOR.html
│   ├── JWT.html
│   ├── LFI.html
│   ├── Path_Traversal.html
│   ├── Prototype_Pollution.html
│   ├── Race_Conditions.html
│   ├── SQLI.html
│   ├── SSRF.html
│   ├── XSS.html
│   ├── XXE.html
│   ├── clickjacking.html
│   ├── http_request_smuggling.html
│   ├── open_redirect.html
│   ├── sensitive_data_exposure.html
│   └── web_cache_poisoning.html
│
├── labs/                        # 44 Interactive Attack & Exploit Simulations
│   ├── broken_auth_password_reset_takeover.html
│   ├── cmdi_cryptominer_botnet.html
│   ├── cors_data_theft_simulation.html
│   ├── csrf_funds_transfer.html
│   ├── file_upload_webshell_rce.html
│   ├── sqli_auth_bypass.html
│   ├── sqli_union_leak.html
│   ├── ssrf_internal_admin.html
│   └── ... (and more)
│
└── checklists/                  # Penetration Testing & Audit Checklists
    ├── checklist.html           # Comprehensive Pen Tester Checklist
    └── field-checklist.html     # Field-wise Assessment Checklist
```

---

## 🚀 Running Locally

Because this project uses vanilla HTML, CSS, and JavaScript with CDN resources, no build tools or package managers are required.

Simply serve it with any local HTTP server:

```bash
# Python 3
python3 -m http.server 8080

# Or using Node.js npx serve
npx serve .
```

Then open `http://localhost:8080` in your browser.

---

## 🔗 Connecting into Another Project

See [INTEGRATION.md](./INTEGRATION.md) for full instructions on how to embed or link `index.html` into:
- Next.js (under `public/`)
- React / Vite / Vue (under `public/`)
- Node.js / Express (static route)
- Static HTML sites & Portfolios
- In-App Iframes / Modals
