import { FormEvent, useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";

import { AppLayout, BrandButton, Container, GlassCard } from "@/components";
import { useAuth } from "@/features/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — NairaLeap" },
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
    const result =
      mode === "sign-in"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === "sign-up") {
      setConfirmationSent(true);
      return;
    }

    await navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AppLayout>
      <Container className="py-12 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
              Your NairaLeap workspace
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Keep your service requests moving.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Create an account to complete guided intake, save your request securely, and follow up
              with the NairaLeap team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Your requests in one place
              </span>
              <span className="inline-flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
                Protected by your account
              </span>
            </div>
          </div>

          <GlassCard className="p-6 sm:p-8">
            <div className="flex gap-2 rounded-xl border border-glass-border bg-glass p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("sign-in");
                  setError(null);
                  setConfirmationSent(false);
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "sign-in"
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("sign-up");
                  setError(null);
                  setConfirmationSent(false);
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "sign-up"
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Create account
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold tracking-tight">
                {mode === "sign-in" ? "Welcome back" : "Start your NairaLeap account"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "sign-in"
                  ? "Sign in to continue your request."
                  : "Use an email you can access for confirmation and follow-up."}
              </p>
            </div>

            {!configured ? (
              <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                Authentication is not configured in this environment yet. Add the Supabase URL and
                publishable key to the runtime environment before using this form.
              </div>
            ) : null}

            {confirmationSent ? (
              <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
                Check your email for a confirmation link. After confirming, return here to sign in.
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground"
              >
                {error}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-foreground">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-glass px-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-glass px-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </label>
              <BrandButton type="submit" className="min-h-11 w-full" disabled={busy || !configured}>
                {busy ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </BrandButton>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Prefer to keep exploring?{" "}
              <Link to="/" className="text-primary hover:underline">
                Return to the portal
              </Link>
              .
            </p>
          </GlassCard>
        </div>
      </Container>
    </AppLayout>
  );
}
