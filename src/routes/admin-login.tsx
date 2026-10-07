import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

import { BrandButton, Container, EditorialLayout } from "@/components";
import { useAuth } from "@/features/auth";
import { getAdminAccess } from "@/features/auth/server";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — NairaLeap" },
      {
        name: "description",
        content: "Secure sign in for the NairaLeap Admin Studio.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { configured, loading, signIn, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    void getAdminAccess().then(({ isAdmin }) => {
      if (isAdmin) void navigate({ to: "/admin", replace: true });
    });
  }, [loading, navigate, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const result = await signIn(email.trim(), password);

    if (result.error) {
      setBusy(false);
      setError(result.error);
      return;
    }

    const access = await getAdminAccess();
    if (!access.isAdmin) {
      await signOut();
      setBusy(false);
      setError(
        "This account is not enabled for Admin Studio. Use the customer portal sign-in instead.",
      );
      return;
    }

    await navigate({ to: "/admin", replace: true });
    setBusy(false);
  }

  return (
    <EditorialLayout>
      <main className="min-h-[calc(100vh-12rem)] bg-[#f8f7fb] px-4 py-12 sm:px-6 sm:py-20">
        <Container className="max-w-xl">
          <section className="rounded-3xl border border-[#e8e1f1] bg-white p-6 shadow-[0_16px_44px_rgba(43,25,79,0.08)] sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">
                  <ShieldCheck className="h-4 w-4" /> Protected workspace
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#262638]">
                  Admin Studio sign in
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#77778a]">
                  Use your approved admin account to manage the website and service portal from one
                  backend.
                </p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f2ebff] text-[#7a2ce2]">
                <KeyRound className="h-5 w-5" />
              </span>
            </div>

            {!configured && (
              <p
                role="status"
                className="mt-6 rounded-xl bg-[#fff8e6] p-4 text-xs leading-5 text-[#8b6500]"
              >
                Admin authentication is not configured in this deployment yet.
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-[#f1c5c5] bg-[#fff5f5] p-4 text-xs font-semibold leading-5 text-[#a33a3a]"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
              <label className="grid gap-2 text-xs font-bold text-[#5f5f73]">
                Admin email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  className="studio-input"
                  required
                />
              </label>
              <label className="grid gap-2 text-xs font-bold text-[#5f5f73]">
                Password
                <span className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9a95a8]" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your existing account password"
                    className="studio-input pl-9"
                    minLength={8}
                    required
                  />
                </span>
              </label>
              <BrandButton type="submit" disabled={busy || !configured} className="min-h-12 w-full">
                {busy ? "Checking access…" : "Open Admin Studio"}
                <ArrowRight className="h-4 w-4" />
              </BrandButton>
            </form>

            <div className="mt-6 border-t border-[#eeeaf6] pt-5 text-center text-xs text-[#858598]">
              Customer account?{" "}
              <Link to="/auth" className="font-bold text-[#6f23dd] hover:underline">
                Open the service portal sign in
              </Link>
            </div>
          </section>
        </Container>
      </main>
    </EditorialLayout>
  );
}
