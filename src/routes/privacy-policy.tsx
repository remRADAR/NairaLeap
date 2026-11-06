import { createFileRoute } from "@tanstack/react-router";
import { EditorialLayout } from "@/components";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <EditorialLayout>
      <section className="mx-auto w-full max-w-[780px] px-4 pb-16 pt-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">Legal</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#242436] sm:text-4xl">
          Privacy Policy
        </h1>
      <div className="mx-auto mb-8 max-w-[780px] rounded-xl border border-[#f0d24a] bg-[#fdf8e3] px-5 py-4 text-sm leading-6 text-[#6b5a14]">
        <p className="font-bold uppercase tracking-[0.08em]">Draft — pending owner approval</p>
        <p className="mt-1">
          This Privacy Policy is a clearly marked working draft prepared for the NairaLeap relaunch. Business,
          legal and data-protection details still require review and approval by the NairaLeap
          owner before publication. Contact hello@nairaleap.com to correct or approve this page.
        </p>
      </div>
        <div className="space-y-8 text-sm leading-7 text-[#4a4a5e]">
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">1. Who we are</h2>
            <p className="mt-2">
              NairaLeap (&quot;we&quot;, &quot;us&quot;) operates the nairaleap.ng website and
              service portal. Registered entity details: [to be confirmed by the business owner].
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">2. What we collect</h2>
            <ul className="mt-2 space-y-1">
              <li>• Account details you create (name, email) when you sign in.</li>
              <li>• Service-request answers you submit through our guided onboarding.</li>
              <li>• Editorial interactions such as article views, FAQs and survey responses.</li>
              <li>• Technical logs required to keep the service available and secure.</li>
            </ul>
            <p className="mt-2">
              We do not ask for bank credentials, BVN or identity documents during initial service
              discovery. Where a partner&apos;s formal application later requires verification
              documents, that process is handled by the authorised partner under its own policy.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">3. How we use it</h2>
            <ul className="mt-2 space-y-1">
              <li>• To route, review and follow up the service requests you submit.</li>
              <li>• To operate and improve the editorial platform.</li>
              <li>• To respond to support and callback requests you explicitly consent to.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">4. Storage &amp; security</h2>
            <p className="mt-2">
              Account and request data is stored in our managed backend (Supabase) with access
              controls. Retention periods: [to be confirmed with the business owner and legal
              review under the Nigeria Data Protection Act and NDPR].
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">5. Sharing</h2>
            <p className="mt-2">
              We share request details with suitable verified partners only to progress a request
              you submitted, and only as needed to fulfil it. We do not sell personal data.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">6. Your rights</h2>
            <p className="mt-2">
              You may request access, correction or deletion of your data by contacting
              hello@nairaleap.com. Requests will be handled in line with Nigerian data-protection
              law; exact response windows: [to be confirmed].
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">7. Cookies</h2>
            <p className="mt-2">
              We use only the cookies required to keep you signed in and the site working. A full
              cookie inventory will be published once confirmed: [pending owner review].
            </p>
          </div>
        </div>
      </section>
    </EditorialLayout>
  );
}
