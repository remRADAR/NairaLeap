# Nairaleap Mortgage Navigator Specification

**Project:** Nairaleap - Service Portal  
**Feature:** Mortgage Navigator expansion  
**Date:** 25 August 2026  
**Status:** Implementation specification

## Objective

Expand Mortgage from a placeholder route into a guided, review-ready service that helps a user describe a housing-finance need, see the relevant next steps, and submit an authenticated request for Nairaleap review and routing.

The Mortgage Navigator is not a lender, mortgage approval authority, underwriter, valuation firm, solicitor, or broker-of-record unless Nairaleap separately establishes the relevant authorization and partner arrangements.

## User pathways

The intake supports the following request purposes:

1. Home purchase mortgage.
2. Land purchase or land-and-build financing.
3. Self-build or construction finance.
4. Home renovation or improvement finance.
5. Rent-to-own or affordable-housing pathway.
6. NHF/FMBN-related guidance or application support.
7. Diaspora mortgage enquiry.
8. Refinance, balance transfer or restructuring enquiry.
9. Estate-development or property/developer finance enquiry.
10. Mortgage readiness, document review and professional support.
11. Existing mortgage servicing, repayment or statement support.

These are discovery and routing categories. They are not claims that every product is currently available, that the user is eligible, or that Nairaleap itself provides or approves the facility.

## Intake structure

The shared blueprint should collect contact details, request purpose, property or construction context, location, applicant profile, income/affordability context, requested amount, timeline, and relevant notes. Questions should be split between required fields needed to route the request and optional fields that help a lender or housing-finance partner review it.

The final rundown should show the user’s answers, relevant recommended documents, the next workflow, and a quote/eligibility boundary. It must not display an invented interest rate, monthly repayment, loan amount, approval decision, or disbursement date.

## Admin review checklist

The Mortgage blueprint should encode these review actions:

- Classify the mortgage purpose and applicant pathway.
- Verify requester identity and contact details.
- Review affordability and income context without presenting an approval decision.
- Review property, title, construction or developer context where applicable.
- Check the appropriate verified lender, PMB, FMBN/NHF pathway, developer, valuer, solicitor or other authorized partner route.
- Confirm next steps, outstanding documents and disclosure boundaries.

## Document posture

The current shared flow surfaces document recommendations but does not provide a secure Mortgage-specific document-upload workflow. Mortgage documents should therefore be listed as “recommended for review” or “may be requested,” not as a requirement to upload through an unverified path.

Potential document labels include government ID, proof of address, income or employment evidence, bank statements, property title or offer documents, valuation/building documents, existing mortgage statement, and other supporting documents. Specific requirements remain subject to the selected lender, PMB, FMBN/NHF programme, developer or professional adviser.

## Commercial and regulatory boundary

The portal should use “request review,” “route,” “subject to lender/partner review,” and “quote or terms to be confirmed” language. It should not promise eligibility, approval, rates, tenure, loan amount, affordability, property title validity, or disbursement timing. Any future repayment calculator must disclose that it is illustrative and must not be represented as an offer.

Before collecting or transmitting sensitive financial documents, the project requires a privacy/consent review and secure document storage, access-control, retention, and deletion design.

## Evidence and references

The official Federal Mortgage Bank of Nigeria NHF FAQ page lists NHF Loan, Estate Development Loan, Home Renovation Loan, Rent To Own, Construction Loan, and Diaspora NHF Mortgage Loan among its Products & Services, and exposes FAQs on eligibility, documents, collateral, repayment, construction, rent-to-own and self-employed participation: [FMBN NHF FAQ](https://fmbn.gov.ng/products/nhf-scheme/faqs).

The FMBN page also links to an NHF loan path that returned a 404 during verification on 25 August 2026. No rates, thresholds, product limits, or approval timelines are copied into the portal from that URL.

## Verification status

**Known:** The existing Nairaleap shared service catalog, intelligence catalog, blueprint engine, rundown builder, authenticated submission path, and liquid-glass guide can support a new Mortgage service without service-specific backend branching.

**Implemented target:** Mortgage service registration, guided questions, review checklist, quote-only pricing state, dedicated Mortgage route, and dashboard availability.

**UNVERIFIED:** Nairaleap’s lender/PMB/FMBN partnerships, loan-originator or broker authorization, live product/rate APIs, FMBN application integration, secure document upload, and production mortgage-submission testing.
