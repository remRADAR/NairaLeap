

## H. Final branch-tip preview and dependency warning

The final remote branch tip at documentation commit `d38f1881df8835c69a449d38d3f737b025396e01` has a READY Vercel preview: [`dpl_CaCjbGoaNimtpKLt1aiuYTYQeFEj`](https://vercel.com/remradars-projects/nairaleap/CaCjbGoaNimtpKLt1aiuYTYQeFEj), [preview URL](https://nairaleap-5hw8e10hh-remradars-projects.vercel.app). This is a documentation-only commit after the application change in `287caf3`; no production target was used. The final preview served HTTP 200 for `/`, `/articles`, `/archive`, a source-image detail, and an image-less detail; the ten desktop/mobile captures in `/home/ubuntu/nairaleap-visual-evidence/` were refreshed from this READY preview.

The Vercel `npm install` log reports **18 dependency audit findings (16 moderate, 2 high)**. It also warns that `cypress@15.21.0`'s postinstall script is not covered by the project's install-script allowlist; the build continues and the Cypress binary is still unavailable in this sandbox. These findings were not remediated here. Before release, review the full advisory/package paths and the install-script policy; do not apply `npm audit fix --force` or approve install scripts without compatibility/security review.
