import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogOut, Sprout, UserRound } from "lucide-react";

import { BrandButton, Container, GlassCard } from "@/components";
import { useAuth } from "@/features/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NairaLeap" },
      {
        name: "description",
        content: "Manage your NairaLeap profile and continue service requests.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    const result = await signOut();
    setSigningOut(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    await navigate({ to: "/", replace: true });
  }

  return (
    <main className="min-h-dvh bg-background pb-20 text-foreground">
      <Container className="py-8 sm:py-12">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              ← Back to portal
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-glow">Customer workspace</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Your requests</h1>
              </div>
            </div>
          </div>
          <BrandButton variant="ghost" onClick={handleSignOut} disabled={signingOut}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </BrandButton>
        </header>

        {error ? (
          <div role="alert" className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            {error}
          </div>
        ) : null}

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-muted-foreground">
                  <Sprout className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
                  Agriculture
                </span>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">Start an Agriculture request</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Tell us about your farm, inputs, buyers, or agribusiness goals. We’ll turn your
                  answers into a structured request for the NairaLeap team.
                </p>
              </div>
            </div>
            <Link
              to="/onboarding/$service"
              params={{ service: "agriculture" }}
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl gradient-brand px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
            >
              Begin Agriculture intake
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </GlassCard>

          <div className="space-y-5">
            <GlassCard className="p-6">
              <p className="text-xs uppercase tracking-widest text-primary-glow">Signed in as</p>
              <p className="mt-3 break-all text-sm font-medium text-foreground">{user?.email ?? "Account"}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your submitted requests will be linked to this account and protected by database
                access policies.
              </p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-xs uppercase tracking-widest text-primary-glow">Continuity</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Track submitted requests</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                See your request references and current operational status in one place.
              </p>
              <Link to="/requests" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Open My Requests
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </GlassCard>
          </div>
        </section>
      </Container>
    </main>
  );
}
