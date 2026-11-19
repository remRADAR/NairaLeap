import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/features/auth";
import { LocaleProvider } from "@/features/i18n";
import { AppSkeleton, PageTransition } from "@/components";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "application-name", content: "NairaLeap — Indicator Drivers" },
      { name: "apple-mobile-web-app-title", content: "NairaLeap — Indicator Drivers" },
      { title: "NairaLeap — Indicator Drivers" },
      {
        name: "description",
        content:
          "NairaLeap — Indicator Drivers: insight, opportunity, and editorial coverage across Nigeria.",
      },
      { name: "theme-color", content: "#1a0b2e" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { property: "og:title", content: "NairaLeap — Indicator Drivers" },
      {
        property: "og:description",
        content: "Editorial insights, opportunities, and indicator reporting across Nigeria.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://nairaleap.com/nairaleap-3d-logo.png?v=20261119-official-logo",
      },
      { property: "og:image:width", content: "2536" },
      { property: "og:image:height", content: "673" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:alt", content: "Official NairaLeap.com — Indicator Drivers logo" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://nairaleap.com/nairaleap-3d-logo.png?v=20261119-official-logo",
      },
      { name: "twitter:image:alt", content: "Official NairaLeap.com — Indicator Drivers logo" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico?v=20261119-official-logo", type: "image/x-icon" },
      {
        rel: "icon",
        href: "/icons/favicon-16x16.png?v=20261119-official-logo",
        type: "image/png",
        sizes: "16x16",
      },
      {
        rel: "icon",
        href: "/icons/favicon-32x32.png?v=20261119-official-logo",
        type: "image/png",
        sizes: "32x32",
      },
      {
        rel: "icon",
        href: "/icons/favicon-48x48.png?v=20261119-official-logo",
        type: "image/png",
        sizes: "48x48",
      },
      {
        rel: "icon",
        href: "/icons/favicon-96x96.png?v=20261119-official-logo",
        type: "image/png",
        sizes: "96x96",
      },
      {
        rel: "apple-touch-icon",
        href: "/icons/apple-touch-icon.png?v=20261119-official-logo",
        sizes: "180x180",
      },
      { rel: "manifest", href: "/manifest.webmanifest?v=20261119-official-logo" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "NairaLeap",
          slogan: "Indicator Drivers",
          url: "https://nairaleap.com",
          logo: "https://nairaleap.com/nairaleap-3d-logo.png?v=20261119-official-logo",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
  pendingComponent: AppSkeleton,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div data-app-hydrated={hydrated ? "true" : "false"}>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <AuthProvider>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <PageTransition>
              <Outlet />
            </PageTransition>
          </AuthProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </div>
  );
}
