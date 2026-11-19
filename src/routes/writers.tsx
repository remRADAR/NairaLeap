import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { EditorialLayout } from "@/components";

type WriterForm = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  idType: string;
  idNumber: string;
  expertise: string;
  portfolio: string;
  pitch: string;
  consent: boolean;
};

const initialForm: WriterForm = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  idType: "",
  idNumber: "",
  expertise: "",
  portfolio: "",
  pitch: "",
  consent: false,
};

export const Route = createFileRoute("/writers")({
  component: WritersOnboardingPage,
});

function WritersOnboardingPage() {
  const [form, setForm] = useState<WriterForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof WriterForm>(key: K, value: WriterForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      "New NairaLeap writer onboarding application",
      "",
      `Full name: ${form.fullName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Location: ${form.location}`,
      `ID type: ${form.idType}`,
      `ID number: ${form.idNumber}`,
      `Areas of expertise: ${form.expertise}`,
      `Portfolio: ${form.portfolio || "Not provided"}`,
      "",
      "Proposed article or coverage idea:",
      form.pitch,
      "",
      "The applicant consented to identity and editorial review.",
    ].join("\n");

    setSubmitted(true);
    window.location.href = `mailto:hello@nairaleap.com?subject=${encodeURIComponent(
      "NairaLeap writer onboarding application",
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <EditorialLayout>
      <main className="min-h-[calc(100dvh-8rem)] bg-[#fcfcfd] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <section className="rounded-3xl bg-[#24103e] p-7 text-white shadow-[0_24px_70px_rgba(43,25,79,0.18)] sm:p-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to NairaLeap
            </Link>
            <p className="mt-12 text-xs font-bold uppercase tracking-[0.22em] text-[#d5b8ff]">
              Contributor onboarding
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Become a NairaLeap writer.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/75">
              Tell us who you are, what you cover, and the story you want to bring to our readers.
              We review every application before writer access is approved.
            </p>
            <div className="mt-10 space-y-5 text-sm text-white/80">
              <p className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#d5b8ff]" aria-hidden="true" />
                Your details are used for contributor verification and editorial follow-up.
              </p>
              <p className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#d5b8ff]" aria-hidden="true" />
                A completed application is handed to the NairaLeap editorial email workflow.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e9e1f4] bg-white p-6 shadow-[0_16px_50px_rgba(43,25,79,0.08)] sm:p-10">
            {submitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-[#6f23dd]" aria-hidden="true" />
                <h2 className="mt-5 text-3xl font-black text-[#24103e]">Application prepared</h2>
                <p className="mt-3 max-w-md leading-7 text-[#686477]">
                  Your email app should now be open with the completed application. Send it to finish
                  the handoff to the NairaLeap editorial team.
                </p>
                <a
                  href="mailto:hello@nairaleap.com?subject=NairaLeap%20writer%20onboarding%20application"
                  className="mt-7 rounded-full bg-[#6f23dd] px-5 py-3 text-sm font-bold text-white hover:bg-[#5d1bc1]"
                >
                  Open email manually
                </a>
              </div>
            ) : (
              <form className="space-y-7" onSubmit={submit}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f23dd]">
                    Writer KYC form
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-[#24103e]">
                    Start your application
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#686477]">
                    Complete the fields below. Required fields are marked with an asterisk.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name *" value={form.fullName} required onChange={(v) => update("fullName", v)} />
                  <Field label="Email address *" type="email" value={form.email} required onChange={(v) => update("email", v)} />
                  <Field label="Phone number *" type="tel" value={form.phone} required onChange={(v) => update("phone", v)} />
                  <Field label="City / state *" value={form.location} required onChange={(v) => update("location", v)} />
                </div>

                <div className="rounded-2xl border border-[#eadff8] bg-[#fbf9ff] p-5">
                  <h3 className="font-bold text-[#24103e]">Identity verification</h3>
                  <p className="mt-1 text-xs leading-5 text-[#686477]">
                    This helps us verify contributors before granting publishing access.
                  </p>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-[#39334a]">
                      ID type *
                      <select
                        required
                        value={form.idType}
                        onChange={(event) => update("idType", event.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#ddd2ed] bg-white px-3 py-3 font-normal outline-none focus:border-[#6f23dd]"
                      >
                        <option value="">Select one</option>
                        <option value="National Identity Number (NIN)">National Identity Number (NIN)</option>
                        <option value="International passport">International passport</option>
                        <option value="Drivers license">Driver&apos;s licence</option>
                        <option value="Voters card">Voter&apos;s card</option>
                      </select>
                    </label>
                    <Field label="ID number *" value={form.idNumber} required onChange={(v) => update("idNumber", v)} />
                  </div>
                </div>

                <div className="grid gap-5">
                  <Field label="Areas of expertise *" value={form.expertise} required placeholder="e.g. business, technology, public policy" onChange={(v) => update("expertise", v)} />
                  <Field label="Portfolio link" type="url" value={form.portfolio} placeholder="https://" onChange={(v) => update("portfolio", v)} />
                  <label className="block text-sm font-semibold text-[#39334a]">
                    Proposed article or coverage idea *
                    <textarea
                      required
                      minLength={30}
                      value={form.pitch}
                      onChange={(event) => update("pitch", event.target.value)}
                      rows={5}
                      className="mt-2 w-full resize-y rounded-xl border border-[#ddd2ed] bg-white px-3 py-3 font-normal outline-none focus:border-[#6f23dd]"
                      placeholder="What should NairaLeap readers know, and why now?"
                    />
                  </label>
                </div>

                <label className="flex gap-3 text-sm leading-6 text-[#686477]">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent}
                    onChange={(event) => update("consent", event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#6f23dd]"
                  />
                  <span>I consent to NairaLeap reviewing my identity and application for contributor access. *</span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#6f23dd] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#5d1bc1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f23dd] focus-visible:ring-offset-2"
                >
                  Continue to email review
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </EditorialLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-[#39334a]">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#ddd2ed] bg-white px-3 py-3 font-normal outline-none focus:border-[#6f23dd]"
      />
    </label>
  );
}
