# Nairaleap Insurance Navigator Specification

**Status:** Approved implementation baseline

## Objective

Expand the Insurance entry point into a guided insurance-needs navigator. The experience must help a visitor describe a protection need, identify a suitable insurance service category, collect quote/review information, and create an authenticated request that can be tracked in the existing workspace.

Nairaleap should be presented as a discovery, comparison, request-routing, and policy-support surface. The interface must not promise coverage, eligibility, premium amounts, claims acceptance, or underwriting outcomes. Final terms and prices remain subject to a licensed insurer, broker, or other authorized operator.

## Regulatory and product boundary

NAICOM describes Nigeria’s insurance ecosystem as including life, non-life, composite insurers, reinsurers, Takaful providers, microinsurance firms, insurtechs, brokers, loss adjusters, and web aggregators [1]. NAICOM’s general-insurance description explicitly includes property, motor, health, marine, and liability risks [2]. NAICOM’s glossary defines brokers as licensed intermediaries, underwriting as risk evaluation and premium/term determination, and web aggregators as platforms for comparing and selecting insurance products [3].

Accordingly, the portal will collect structured requirements and route them for review. It will show **Quote required after review** rather than calculate or imply a premium. It will not present Nairaleap as an insurer unless that licensing and operating status is separately verified.

## Coverage taxonomy

| Navigator category | Representative request types | Core intake focus |
|---|---|---|
| Motor & Auto | Third-party, comprehensive, commercial vehicle, fleet, renewal, policy verification | Vehicle, use, value, location, current policy, claims history |
| Health & Medical | Individual/family health, corporate health, group cover, travel medical | People covered, location, medical-plan preference, start date |
| Life & Family | Term life, whole-life enquiry, group life, funeral/family protection, education protection | Ages, dependants, cover goal, term, beneficiary context |
| Home & Property | Home, renters/occupiers, landlord, building, contents, fire/theft | Property type, location, occupancy, value, construction/security |
| Business & Commercial | SME package, office/shop, stock, equipment, business interruption, cyber | Business activity, assets, turnover band, employees, exposures |
| Agriculture | Farm, livestock, crop, equipment, transit, weather/risk protection | Farm location, activity, crop/livestock, scale, season, assets |
| Travel | Single-trip, annual multi-trip, visa/travel medical support | Destination, dates, travellers, purpose, medical/benefit needs |
| Marine, Cargo & Aviation | Marine cargo, vessel, goods in transit, aviation risk enquiry | Goods/vessel, route, value, conveyance, voyage dates |
| Liability & Compulsory Cover | Motor third-party, builders liability, occupiers liability, public/professional liability | Activity, premises, contractual/legal requirement, limits |
| Microinsurance, Takaful & Inclusion | Low-cost cover, cooperative/Takaful preference, informal-sector protection | Affordability, frequency, community/family/business context, preference |
| Claims, Renewals & Policy Support | Report a claim, renew, amend, verify, obtain policy help | Existing policy, incident/status, dates, documents, preferred contact |

The first ten rows are protection categories. The final row is an operational service pathway that may apply to any category and must be available from the Insurance landing page and navigator.

## Experience stages

1. **Need discovery:** The visitor chooses whether they need new cover, a comparison/quote, a claim, a renewal/policy change, or policy verification/support.
2. **Category recommendation:** The navigator uses the selected situation to recommend one or more insurance categories; it must allow the visitor to change the selection.
3. **Structured intake:** The user answers category-specific questions, with common contact fields and an explicit acknowledgement that final terms require review.
4. **Rundown:** The user sees captured answers, likely document requirements, the assigned insurance pathway, and the truthful pricing state **Quote required after review**.
5. **Authentication and persistence:** Before submission, the visitor signs in or creates an account. The existing authenticated `service_requests` path persists the request and exposes it in the request tracker.
6. **Human/partner review:** The portal communicates that a licensed provider or authorized partner must confirm suitability, terms, exclusions, premium, and claim/coverage decisions.

## Acceptance criteria

| Requirement | Acceptance test |
|---|---|
| Insurance landing page is no longer “coming soon” | `/insurance` presents the navigator and category directory |
| All coverage categories are discoverable | Every taxonomy row has a selectable entry and description |
| Category-specific intake works | Each category has required questions, optional details, documents, and review metadata |
| Operational support is covered | Claims, renewals, verification, and policy support are selectable |
| Pricing is truthful | No fabricated premium; final rundown states quote/review required |
| Secure persistence is preserved | Submission continues through authenticated `service_requests` with existing RLS |
| Existing portal remains stable | Existing ten non-insurance services, auth, request tracking, and favicon/title are unchanged |
| Regulatory wording is safe | UI uses “request,” “compare,” “route,” and “review”; it does not guarantee cover or claim outcomes |

## References

[1]: https://naicom.gov.ng/about-naicom/ "NAICOM About: regulated insurance ecosystem and sector mandate"
[2]: https://naicom.gov.ng/general/ "NAICOM General Insurance Companies"
[3]: https://naicom.gov.ng/glossary/ "NAICOM Glossary of Insurance Terms"
[4]: https://naicom.gov.ng/takaful/ "NAICOM Takaful Operators"
[5]: https://naicom.gov.ng/microinsurance/ "NAICOM Microinsurance Insurance Companies"
