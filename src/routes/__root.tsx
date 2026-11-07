import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/features/auth";
import { LocaleProvider } from "@/features/i18n";
import { AppSkeleton, PageTransition } from "@/components";
import { NAIRALEAP_BRAND, NAIRALEAP_SITE_ORIGIN } from "@/features/brand/brand";

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
      { name: "application-name", content: NAIRALEAP_BRAND.name },
      { name: "apple-mobile-web-app-title", content: NAIRALEAP_BRAND.name },
      {
        title: `${NAIRALEAP_BRAND.name} — Nigerian Digital Media, Information & Services Ecosystem`,
      },
      {
        name: "description",
        content: NAIRALEAP_BRAND.description,
      },
      { name: "theme-color", content: "#1a0b2e" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { property: "og:site_name", content: NAIRALEAP_BRAND.name },
      {
        property: "og:title",
        content: `${NAIRALEAP_BRAND.name} — Nigerian Digital Media, Information & Services Ecosystem`,
      },
      {
        property: "og:description",
        content: NAIRALEAP_BRAND.description,
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: `${NAIRALEAP_SITE_ORIGIN}/nairaleap-wordmark.png`,
      },
      { property: "og:image:width", content: "1706" },
      { property: "og:image:height", content: "922" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:alt", content: NAIRALEAP_BRAND.name },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: `${NAIRALEAP_SITE_ORIGIN}/nairaleap-wordmark.png`,
      },
      { name: "twitter:image:alt", content: NAIRALEAP_BRAND.name },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico?v=20260825-wordmark", type: "image/x-icon" },
      { rel: "icon", href: "/icons/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/icons/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/icons/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.webmanifest" },
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

  return (
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
  );
}

