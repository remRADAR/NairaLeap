import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { AppLayout, BrandButton, Container } from "@/components";
import { useAuth } from "@/features/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Nairaleap - Service Portal" },
      {
        name: "description",
        content: "Sign in or create a NairaLeap account to submit and track service requests.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, configured, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [loading, navigate, user]);

  function switchMode(nextMode: "sign-in" | "sign-up") {
    setMode(nextMode);
    setError(null);
    setConfirmationSent(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setConfirmationSent(false);

    if (!email.trim() || !password) {
      setError("Enter your email address and password to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    setBusy(true);
    const submittedMode = mode;
    const result =
      submittedMode === "sign-in"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setBusy(false);

    if (result.error) {
      if (submittedMode === "sign-in" && result.suggestSignUp) {
        switchMode("sign-up");
        setPassword("");
        setError(
          "We could not sign you in with those details. If this is a new email, create your account below. If you already have an account, switch back to Sign in.",
        );
        return;
      }
      if (submittedMode === "sign-up" && result.suggestSignIn) {
        switchMode("sign-in");
        setPassword("");
        setError(
          "An account already exists for this email. Switch to Sign in to open your workspace.",
        );
        return;
      }
      setError(result.error);
      return;
    }

    if (submittedMode === "sign-up") {
      if (result.sessionCreated) {
        await navigate({ to: "/dashboard", replace: true });
        return;
      }
      setConfirmationSent(true);
      return;
    }

    await navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AppLayout>
      <section
        className="relative isolate overflow-hidden pt-8 sm:pt-14"
        aria-labelledby="auth-title"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[8%] top-8 -z-10 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 right-[8%] -z-10 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl"
        />
        <Container className="pb-14 sm:pb-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16">
            <div className="hidden lg:block">
              <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
                Your NairaLeap workspace
              </span>
              <h1 id="auth-title" className="mt-6 max-w-xl text-5xl font-semibold tracking-tight">
                Keep your service requests moving.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                Sign in once to save your intake, review the final rundown, and follow every request
                from discovery to resolution.
              </p>
              <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
                <TrustPoint icon={CheckCircle2} text="Your requests in one place" />
                <TrustPoint icon={LockKeyhole} text="Protected by your account" />
                <TrustPoint icon={ShieldCheck} text="Clear review before submission" />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[32rem]">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/30 via-transparent to-fuchsia-500/20 blur-2xl"
              />
              <div className="glass-panel relative overflow-hidden border-white/15 bg-background/70 p-1 shadow-[var(--shadow-elevated)] backdrop-blur-3xl">
                <div className="rounded-[calc(var(--radius-2xl)-0.25rem)] border border-white/5 bg-black/15 p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary-glow">
                        <img
                          src="/nairaleap-logo.png"
                          alt="Nairaleap - Service Portal"
                          className="block h-8 w-[11rem] object-cover object-center"
                        />
                        <span className="sr-only">Account</span>
                      </div>
                      <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {mode === "sign-in" ? "Welcome back" : "Create your account"}
                      </h2>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        {mode === "sign-in"
                          ? "Continue your request without losing your place."
                          : "Start with an email you can access for confirmation and follow-up."}
                      </p>
                    </div>
                    <Link
                      to="/"
                      aria-label="Return to NairaLeap portal"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-glass-border bg-glass text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span aria-hidden="true" className="text-lg leading-none">
                        ×
                      </span>
                    </Link>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-1 rounded-2xl border border-glass-border bg-glass p-1.5">
                    <AuthModeButton
                      active={mode === "sign-in"}
                      icon={LockKeyhole}
                      onClick={() => switchMode("sign-in")}
                    >
                      Sign in
                    </AuthModeButton>
                    <AuthModeButton
                      active={mode === "sign-up"}
                      icon={UserRound}
                      onClick={() => switchMode("sign-up")}
                    >
                      Create account
                    </AuthModeButton>
                  </div>

                  {!configured ? (
                    <div
                      role="status"
                      className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100"
                    >
                      <p className="font-medium">Authentication is being connected</p>
                      <p className="mt-1 text-amber-100/75">
                        The portal is ready, but this deployment needs the Supabase URL and
                        publishable key before the form can be used.
                      </p>
                    </div>
                  ) : null}

                  {confirmationSent ? (
                    <div
                      role="status"
                      className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground"
                    >
                      <p className="font-medium">Check your inbox to confirm your account.</p>
                      <p className="mt-1 text-muted-foreground">
                        After confirming, return here and sign in to open your workspace.
                      </p>
                    </div>
                  ) : null}

                  {error ? (
                    <div
                      role="alert"
                      className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground"
                    >
                      {error}
                    </div>
                  ) : null}

                  <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <label
                      htmlFor="auth-email"
                      className="block text-sm font-medium text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary-glow" aria-hidden="true" />
                        Email address
                      </span>
                      <input
                        id="auth-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        className="mt-2 h-12 w-full rounded-2xl border border-glass-border bg-white/[0.06] px-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                        placeholder="you@example.com"
                        required
                      />
                    </label>
                    <label
                      htmlFor="auth-password"
                      className="block text-sm font-medium text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <LockKeyhole className="h-4 w-4 text-primary-glow" aria-hidden="true" />
                        Password
                      </span>
                      <input
                        id="auth-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                        className="mt-2 h-12 w-full rounded-2xl border border-glass-border bg-white/[0.06] px-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                        placeholder="At least 8 characters"
                        minLength={8}
                        required
                      />
                    </label>
                    <BrandButton
                      type="submit"
                      className="min-h-12 w-full text-base"
                      disabled={busy || !configured}
                    >
                      {busy
                        ? "Working…"
                        : mode === "sign-in"
                          ? "Open my workspace"
                          : "Create my account"}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </BrandButton>
                  </form>

                  <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border/70" />
                    <span>Secure customer access</span>
                    <span className="h-px flex-1 bg-border/70" />
                  </div>
                  <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                    Your account is used to save requests and show your private request history. You
                    can keep browsing as a guest at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </AppLayout>
  );
}

function TrustPoint({ icon: Icon, text }: { icon: typeof CheckCircle2; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-glass-border bg-glass text-primary-glow">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>{text}</span>
    </div>
  );
}

function AuthModeButton({
  active,
  children,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  children: string;
  icon: typeof LockKeyhole;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "bg-surface-elevated text-foreground shadow-[0_8px_20px_-12px_oklch(0_0_0/80%)]"
          : "text-muted-foreground hover:bg-surface-elevated/70 hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </button>
  );
}
