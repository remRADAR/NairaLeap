import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { getCurrentUser } from "@/features/auth/server";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { user } = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/auth" });
    }
    return { user };
  },
  head: () => ({
    meta: [{ title: "Customer Workspace — NairaLeap Services" }],
  }),
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}

