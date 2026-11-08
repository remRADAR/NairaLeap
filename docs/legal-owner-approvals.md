# NairaLeap — Owner Approval & Legal Review Register

**Created:** 2026-11-07
**Purpose:** The corporate pages (`/about`, `/disclaimer`, `/privacy-policy`) and the new footers deliberately avoid inventing business, legal or operational facts. Everything below is either unverified or awaiting a formal decision. Each item blocks a specific published sentence or component. Items marked **[legal]** should additionally be reviewed by qualified counsel before the "Draft — pending owner approval" banners are removed from the legal pages.

| # | Item | Where it surfaces today | Needed decision / confirmation |
|---|------|------------------------|-------------------------------|
| 1 | Registered legal entity behind NairaLeap (name, registration number, date, registered address) | `/about` § Contact and accountability currently states these are "being confirmed by the owner and will be published as verified" | Owner to supply verified incorporation details; then publish them |
| 2 | Official contact email `hello@nairaleap.com` | Both footers, all three legal pages, `/about` contact section | Confirm the mailbox exists, is monitored, and who receives it; or provide a replacement address |
| 3 | Canonical production domain | `NAIRALEAP_SITE_ORIGIN = "https://nairaleap.vercel.app"` (canonical URLs, og:url, og:image) — reused from the existing og:image host | Confirm the final production domain (e.g. nairaleap.com) and whether the `.vercel.app` host should remain as fallback |
| 4 | Official NairaLeap social accounts | None published; all generic social links were removed from the editorial footer | Supply verified account URLs to restore a social column, or confirm that none exist |
| 5 | Newsletter backend | The editorial newsletter strip's "Subscribe Now!" button is inert; the privacy policy states no email addresses are collected there | Decide: implement a newsletter backend (and consent flow + privacy-policy update), or remove the strip |
| 6 | Retention periods for accounts, service requests and logs **[legal]** | Privacy policy § 12 states retention is "pending confirmation" | Define and approve retention schedule per data category |
| 7 | NDPA lawful-basis mapping per processing activity **[legal]** | Privacy policy § 7 marks the mapping "pending confirmation" | Approve the mapping of each activity (account operation, request processing, security logs) to its lawful basis |
| 8 | Data-subject request response windows **[legal]** | Privacy policy § 14 commits to no specific response time | Commit to response timelines for access/rectification/deletion requests |
| 9 | Data-protection officer / privacy contact designation **[legal]** | Privacy policy § 15 states appointment is "pending confirmation" | Decide whether a DPO or named privacy contact is designated; publish details if so |
| 10 | International transfer safeguards and provider sub-processors **[legal]** | Privacy policy §§ 8, 11 marked "pending confirmation" | Confirm Supabase/Vercel hosting regions and transfer safeguards; document sub-processors |
| 11 | Limitation-of-liability and exclusion wording **[legal]** | Disclaimer § 12 carries an explicit "not reviewed by qualified counsel" note | Full disclaimer (esp. § 12) needs qualified legal review before the draft banner is removed |
| 12 | Regulatory status statements | Disclaimer states NairaLeap is not a licensed provider of regulated financial, insurance, mortgage, real-estate or legal services | Confirm this matches the owner's intended positioning before publishing |
| 13 | Payment gateway activation | Privacy policy § 9 says gateway use is "pending confirmation" | Confirm whether payments are live, which gateway, and its privacy terms |
| 14 | Advertising policy and rates | Disclaimer § 9 describes ad placements generically; `/about` does not claim partners | Confirm sponsorship/advertising policy, labelling conventions, and whether an advertising contact should be published |
| 15 | Corporate timeline facts (founding year, Naira & Kobo launch date, rebrand announcement date) | `/about` intentionally gives no dates | Owner to supply verifiable dates if the story should include them |
| 16 | `manifest.webmanifest` naming | Now `NairaLeap Services` / `NairaLeap` | Confirm installable-app naming preference |

**Rule for future edits:** no business, legal or data-protection fact may be added to these pages unless it is verified by the owner (and reviewed by counsel where marked). Unverified items stay in this register, not in the page copy.
