import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  ChevronRight,
  Download,
  ExternalLink,
  FolderTree,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Plus,
  Pencil,
  Phone,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react";
import { EditorialLayout } from "@/components";
import {
  createStudioArticle,
  createStudioCategory,
  deleteStudioCategory,
  readStudioArticles,
  readStudioCategories,
  readHomepageSettings,
  renameStudioCategory,
  saveStudioArticles,
  saveStudioCategories,
  saveHomepageSettings,
  STUDIO_CHANGE_EVENT,
  type HomepageSettings,
  type StudioArticle,
  type StudioCategory,
} from "@/features/editorial/studio";
import { SERVICE_CATALOG } from "@/features/services/serviceCatalog";
import { EDITORIAL_POSTS } from "@/data/wordpressEditorial";
import { listAdminServiceRequests, updateAdminServiceRequest } from "@/features/service-requests";
import { getAdminAccess } from "@/features/auth/server";
import { useAuth } from "@/features/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const { user, isAdmin } = await getAdminAccess();
    if (!user || !isAdmin) throw redirect({ to: "/admin-login" });
    return { user };
  },
  component: AdminStudioPage,
});

type Workspace = "website" | "portal";
type AdminView =
  "overview" | "homepage" | "articles" | "categories" | "services" | "requests" | "plugins";

function AdminStudioPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace>("website");
  const [view, setView] = useState<AdminView>("overview");
  const [articles, setArticles] = useState<StudioArticle[]>([]);
  const [categories, setCategories] = useState<StudioCategory[]>([]);

  const selectWorkspace = (nextWorkspace: Workspace) => {
    setWorkspace(nextWorkspace);
    setView("overview");
  };

  const reload = () => {
    setArticles(readStudioArticles());
    setCategories(readStudioCategories());
  };

  useEffect(() => {
    reload();
    window.addEventListener(STUDIO_CHANGE_EVENT, reload);
    return () => window.removeEventListener(STUDIO_CHANGE_EVENT, reload);
  }, []);

  const workspaceLabel = workspace === "website" ? "Website" : "Service Portal";

  return (
    <EditorialLayout>
      <div className="min-h-[calc(100vh-12rem)] bg-[#f8f7fb]">
        <section className="border-b border-[#e7e1f1] bg-[#21142f] px-4 py-8 text-white sm:px-6 sm:py-10">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d2b8ff]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin Studio
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-5xl">
                  Control the {workspaceLabel.toLowerCase()}.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
                  Publish editorial content, manage the taxonomy, and keep the NairaLeap website and
                  service portal organized from one focused workspace.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/75">
                  <LockKeyhole className="h-3.5 w-3.5 text-[#d2b8ff]" /> Admin access enabled
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    await navigate({ to: "/admin-login", replace: true });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectWorkspace("website")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${workspace === "website" ? "border-[#c8a7ff] bg-[#7a2ce2]/25" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                  <Globe2 className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-sm">Website</strong>
                  <span className="text-xs text-white/55">Articles, categories and publishing</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => selectWorkspace("portal")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${workspace === "portal" ? "border-[#c8a7ff] bg-[#7a2ce2]/25" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                  <Store className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-sm">Service Portal</strong>
                  <span className="text-xs text-white/55">Services, requests and integrations</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1240px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
          <AdminSidebar
            workspace={workspace}
            view={view}
            onNavigate={setView}
            onWorkspaceChange={selectWorkspace}
          />

          <main>
            {view === "overview" && workspace === "website" && (
              <Overview
                workspace={workspace}
                articles={articles}
                categories={categories}
                onView={setView}
              />
            )}
            {view === "homepage" && workspace === "website" && (
              <HomepageStudio categories={categories} />
            )}
            {view === "articles" && <ArticleStudio categories={categories} onPublished={reload} />}
            {view === "categories" && <CategoryStudio categories={categories} onChanged={reload} />}
            {view === "overview" && workspace === "portal" && <PortalOverview onView={setView} />}
            {view === "services" && <PortalServices />}
            {view === "requests" && <PortalRequests />}
            {view === "plugins" && <PluginStudio workspace={workspace} />}
          </main>
        </div>
      </div>
    </EditorialLayout>
  );
}

function AdminSidebar({
  workspace,
  view,
  onNavigate,
  onWorkspaceChange,
}: {
  workspace: Workspace;
  view: AdminView;
  onNavigate: (view: AdminView) => void;
  onWorkspaceChange: (workspace: Workspace) => void;
}) {
  const group = (
    title: string,
    groupWorkspace: Workspace,
    items: { id: AdminView; label: string; icon: typeof LayoutDashboard }[],
  ) => (
    <div className="mb-4 last:mb-0">
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a29caf]">
        {title}
      </p>
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            onWorkspaceChange(groupWorkspace);
            onNavigate(id);
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${view === id && ((workspace === "website" && ["overview", "homepage", "articles", "categories"].includes(id)) || (workspace === "portal" && ["overview", "services", "requests"].includes(id)) || id === "plugins") ? "bg-[#f2ebff] text-[#6f23dd]" : "text-[#6f6f82] hover:bg-[#faf8ff]"}`}
        >
          <Icon className="h-4 w-4" /> {label}
        </button>
      ))}
    </div>
  );

  return (
    <aside className="h-fit rounded-2xl border border-[#e8e1f1] bg-white p-3 shadow-[0_8px_24px_rgba(43,25,79,0.05)]">
      {group("Website", "website", [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "homepage", label: "Homepage", icon: Globe2 },
        { id: "articles", label: "Articles", icon: BookOpen },
        { id: "categories", label: "Categories", icon: FolderTree },
      ])}
      {group("Services portal", "portal", [
        { id: "overview", label: "Portal overview", icon: Store },
        { id: "services", label: "Service catalog", icon: Wrench },
        { id: "requests", label: "Request queue", icon: ClipboardList },
      ])}
      {group("System", workspace, [{ id: "plugins", label: "Plugins & setup", icon: Settings2 }])}
    </aside>
  );
}

function PortalOverview({ onView }: { onView: (view: AdminView) => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
          Service Portal workspace
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#262638]">Operate the service side.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77778a]">
          Manage the live service catalog, jump into customer request operations, and keep portal
          integrations separate from editorial publishing.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Available services" value={SERVICE_CATALOG.length} icon={Store} />
        <Metric label="Portal destinations" value="3" icon={ExternalLink} />
        <Metric label="Gateway status" value="Pending" icon={Settings2} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ActionCard
          icon={Wrench}
          title="Review service catalog"
          description="Inspect every service currently exposed on the public portal and jump to its live landing page."
          action="Open service catalog"
          onClick={() => onView("services")}
        />
        <ActionCard
          icon={ClipboardList}
          title="Open request operations"
          description="The customer request queue remains protected by Supabase Auth. Open it in the authenticated workspace when configured."
          action="Open request workspace"
          onClick={() => {
            window.location.href = "/requests";
          }}
        />
      </div>
    </div>
  );
}

function PortalServices() {
  return (
    <section className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
            Service Portal workspace
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#262638]">Service catalog</h2>
          <p className="mt-2 text-sm text-[#77778a]">
            The catalog is the source of truth for the public portal cards and service landing
            pages.
          </p>
        </div>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 rounded-xl border border-[#e5dafa] px-3 py-2 text-xs font-bold text-[#6f23dd]"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View portal
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SERVICE_CATALOG.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.id}
              to="/services/$service"
              params={{ service: service.id }}
              className="flex items-start gap-3 rounded-xl border border-[#eeeaf6] p-4 transition hover:-translate-y-0.5 hover:border-[#d8c9f3] hover:bg-[#fbf9ff]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2ebff] text-[#7a2ce2]">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <strong className="block text-sm text-[#262638]">{service.title}</strong>
                <span className="mt-1 block text-xs leading-5 text-[#77778a]">
                  {service.shortDescription}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PortalRequests() {
  type AdminRequest = Awaited<ReturnType<typeof listAdminServiceRequests>>["requests"][number];
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadRequests = async (isRefresh = false) => {
    setError("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await listAdminServiceRequests();
      setRequests(result.requests);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not load the request queue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const updateStatus = async (requestId: string, status: AdminRequest["status"]) => {
    setUpdatingId(requestId);
    setError("");
    try {
      await updateAdminServiceRequest({ data: { requestId, status } });
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status, updated_at: new Date().toISOString() }
            : request,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not update this request.");
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleRequests = useMemo(() => {
    const filtered = requests.filter((request) => {
      const payload = request.submitted_payload as Record<string, unknown>;
      const haystack = [
        request.id,
        request.user_id,
        request.service_id,
        request.status,
        ...Object.values(payload).map((value) => String(value)),
      ]
        .join(" ")
        .toLowerCase();
      return (
        (statusFilter === "all" || request.status === statusFilter) &&
        (serviceFilter === "all" || request.service_id === serviceFilter) &&
        haystack.includes(query.trim().toLowerCase())
      );
    });

    return [...filtered].sort((left, right) => {
      const leftPayload = left.submitted_payload as Record<string, unknown>;
      const rightPayload = right.submitted_payload as Record<string, unknown>;
      const leftName = String(leftPayload.contactName ?? "Customer");
      const rightName = String(rightPayload.contactName ?? "Customer");

      if (sortBy === "oldest") {
        return left.created_at.localeCompare(right.created_at);
      }
      if (sortBy === "customer-asc") {
        return leftName.localeCompare(rightName);
      }
      if (sortBy === "customer-desc") {
        return rightName.localeCompare(leftName);
      }
      if (sortBy === "status") {
        return (
          left.status.localeCompare(right.status) || right.created_at.localeCompare(left.created_at)
        );
      }
      return right.created_at.localeCompare(left.created_at);
    });
  }, [query, requests, serviceFilter, sortBy, statusFilter]);

  const exportCsv = () => {
    const payloadKeys = Array.from(
      new Set(
        requests.flatMap((request) =>
          Object.keys(request.submitted_payload as Record<string, unknown>),
        ),
      ),
    );
    const headers = [
      "request_id",
      "customer_id",
      "service_id",
      "status",
      "source",
      "created_at",
      "updated_at",
      ...payloadKeys,
    ];
    const csvValue = (value: unknown) => {
      const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
      return `"${text.replaceAll('"', '""')}"`;
    };
    const rows = requests.map((request) => {
      const payload = request.submitted_payload as Record<string, unknown>;
      return [
        request.id,
        request.user_id,
        request.service_id,
        request.status,
        request.source,
        request.created_at,
        request.updated_at,
        ...payloadKeys.map((key) => payload[key]),
      ]
        .map(csvValue)
        .join(",");
    });
    const blob = new Blob([[headers.map(csvValue).join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nairaleap-customer-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
              Service Portal workspace
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#262638]">Customer request queue</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77778a]">
              Review onboarding answers submitted from the customer workspace, update follow-up
              status, and export a CSV for your operations team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadRequests(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e5dafa] px-3 py-2 text-xs font-bold text-[#6f23dd] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={requests.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7a2ce2] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(16rem,1fr)_12rem_12rem_12rem]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9a95a8]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer, request or details"
              className="studio-input pl-9"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="studio-input"
          >
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Needs attention</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(event) => setServiceFilter(event.target.value)}
            className="studio-input"
            aria-label="Filter by service"
          >
            <option value="all">All services</option>
            {SERVICE_CATALOG.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="studio-input"
            aria-label="Sort customer requests"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="customer-asc">Customer A–Z</option>
            <option value="customer-desc">Customer Z–A</option>
            <option value="status">Status</option>
          </select>
        </div>
        <p className="mt-3 text-xs text-[#858598]">
          Showing {visibleRequests.length} of {requests.length} customer requests
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#f1c5c5] bg-[#fff5f5] p-4 text-xs font-semibold text-[#a33a3a]"
        >
          {error}
        </div>
      )}
      {loading ? (
        <div className="rounded-2xl border border-[#e8e1f1] bg-white p-8 text-sm text-[#77778a]">
          Loading customer requests…
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="rounded-2xl border border-[#e8e1f1] bg-white p-8 text-center text-sm text-[#77778a]">
          {requests.length === 0
            ? "No customer requests are available for this admin account."
            : "No requests match the current filters."}
        </div>
      ) : (
        visibleRequests.map((request) => {
          const payload = request.submitted_payload as Record<string, unknown>;
          const service = SERVICE_CATALOG.find((item) => item.id === request.service_id);
          const email = typeof payload.contactEmail === "string" ? payload.contactEmail : "";
          const phone = typeof payload.contactPhone === "string" ? payload.contactPhone : "";
          const name = typeof payload.contactName === "string" ? payload.contactName : "Customer";
          return (
            <article
              key={request.id}
              className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
                    {service?.title ?? request.service_id}
                  </p>
                  <h3 className="mt-1 text-lg font-black text-[#262638]">{name}</h3>
                  <p className="mt-1 text-xs text-[#858598]">
                    Request {request.id.slice(0, 8)} · Customer {request.user_id.slice(0, 8)} ·
                    Submitted {new Date(request.created_at).toLocaleString()}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                    {email && (
                      <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-1.5 text-[#6f23dd] hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" /> {email}
                      </a>
                    )}
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex items-center gap-1.5 text-[#6f23dd] hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" /> {phone}
                      </a>
                    )}
                  </div>
                </div>
                <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#858598]">
                  Follow-up status
                  <select
                    value={request.status}
                    disabled={updatingId === request.id}
                    onChange={(event) =>
                      void updateStatus(request.id, event.target.value as AdminRequest["status"])
                    }
                    className="studio-input min-w-40 text-xs normal-case tracking-normal"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="in_review">In review</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Needs attention</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 grid gap-3 border-t border-[#f0ebf6] pt-4 sm:grid-cols-2">
                {Object.entries(payload).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-[#fbf9ff] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9292a4]">
                      {key
                        .replace(/[A-Z]/g, (letter) => ` ${letter}`)
                        .replace(/^./, (letter) => letter.toUpperCase())}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#4f4f61]">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

function Overview({
  workspace,
  articles,
  categories,
  onView,
}: {
  workspace: Workspace;
  articles: StudioArticle[];
  categories: StudioCategory[];
  onView: (view: AdminView) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Published in this browser" value={articles.length} icon={BookOpen} />
        <Metric label="Available categories" value={categories.length} icon={FolderTree} />
        <Metric
          label="Active workspace"
          value={workspace === "website" ? "Website" : "Portal"}
          icon={workspace === "website" ? Globe2 : Store}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ActionCard
          icon={Globe2}
          title="Shape the homepage"
          description="Edit the first ticker text, choose the second ticker taxonomy, and control the final carousel taxonomy and item limit."
          action="Open homepage controls"
          onClick={() => onView("homepage")}
        />
        <ActionCard
          icon={Plus}
          title="Publish a new article"
          description="Create a headline, excerpt, body, category and tags, then publish it to this studio workspace."
          action="Open article studio"
          onClick={() => onView("articles")}
        />
        <ActionCard
          icon={FolderTree}
          title="Build the taxonomy"
          description="Start from the imported Naira & Kubo category hierarchy and add new parent or child categories."
          action="Manage categories"
          onClick={() => onView("categories")}
        />
      </div>
      <div className="rounded-2xl border border-[#eadffb] bg-[#fbf9ff] p-5">
        <p className="flex items-center gap-2 text-xs font-bold text-[#6f23dd]">
          <ShieldCheck className="h-4 w-4" /> Studio readiness
        </p>
        <p className="mt-2 text-sm leading-6 text-[#66667a]">
          The browser studio is ready for content modeling and preview. Gateway authentication and
          shared server persistence remain intentionally marked as setup steps until their
          credentials and Supabase schema are supplied.
        </p>
      </div>
    </div>
  );
}

function HomepageStudio({ categories }: { categories: StudioCategory[] }) {
  const [settings, setSettings] = useState<HomepageSettings>(readHomepageSettings);
  const [saved, setSaved] = useState(false);
  const taxonomyOptions = useMemo(
    () => ["all", ...Array.from(new Set(categories.map((category) => category.name)))],
    [categories],
  );
  const update = <K extends keyof HomepageSettings>(key: K, value: HomepageSettings[K]) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveHomepageSettings({
      ...settings,
      primaryTickerText: settings.primaryTickerText.trim() || "20 on the desk",
      carouselLimit: Math.max(3, Math.min(5000, Math.round(Number(settings.carouselLimit) || 5))),
    });
    setSettings(readHomepageSettings());
    setSaved(true);
  };
  const selectClassName =
    "mt-2 w-full rounded-xl border border-[#e8e1f1] bg-white px-3 py-3 text-sm text-[#333346] outline-none transition focus:border-[#9b63e8] focus:ring-2 focus:ring-[#eadcff]";
  return (
    <form onSubmit={save} className="space-y-6">
      <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
          Website / Homepage
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#262638]">Homepage presentation controls</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77778a]">
          These settings control the live homepage layout. The first ticker accepts free-form text;
          the second ticker and final carousel are driven by the taxonomy selectors below.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
            First ticker
          </p>
          <h3 className="mt-2 text-lg font-extrabold text-[#262638]">Custom ticker text</h3>
          <p className="mt-2 text-sm leading-6 text-[#77778a]">
            Type the label that appears at the start of the first scrolling ticker.
          </p>
          <label
            className="mt-5 block text-xs font-bold text-[#4c4c60]"
            htmlFor="primary-ticker-text"
          >
            Ticker text
          </label>
          <input
            id="primary-ticker-text"
            data-testid="homepage-primary-ticker-text"
            value={settings.primaryTickerText}
            onChange={(event) => update("primaryTickerText", event.target.value)}
            className={selectClassName}
            placeholder="20 on the desk"
          />
        </section>

        <section className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
            Second ticker
          </p>
          <h3 className="mt-2 text-lg font-extrabold text-[#262638]">Taxonomy selection</h3>
          <p className="mt-2 text-sm leading-6 text-[#77778a]">
            Choose the taxonomy used to filter the second ticker’s indicator stories.
          </p>
          <label
            className="mt-5 block text-xs font-bold text-[#4c4c60]"
            htmlFor="secondary-ticker-taxonomy"
          >
            Ticker taxonomy
          </label>
          <select
            id="secondary-ticker-taxonomy"
            data-testid="homepage-secondary-ticker-taxonomy"
            value={settings.secondaryTickerTaxonomy}
            onChange={(event) => update("secondaryTickerTaxonomy", event.target.value)}
            className={selectClassName}
          >
            {taxonomyOptions.map((taxonomy) => (
              <option key={taxonomy} value={taxonomy}>
                {taxonomy === "all" ? "All taxonomies" : taxonomy}
              </option>
            ))}
          </select>
        </section>
      </div>

      <section className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
          Final parallel grid carousel
        </p>
        <h3 className="mt-2 text-lg font-extrabold text-[#262638]">Carousel content rules</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77778a]">
          Select the taxonomy shown in the final “More perspectives” carousel and set how many
          stories it may contain. The limit is constrained to 3–5,000.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="block text-xs font-bold text-[#4c4c60]" htmlFor="carousel-taxonomy">
            Carousel taxonomy
            <select
              id="carousel-taxonomy"
              data-testid="homepage-carousel-taxonomy"
              value={settings.carouselTaxonomy}
              onChange={(event) => update("carouselTaxonomy", event.target.value)}
              className={selectClassName}
            >
              {taxonomyOptions.map((taxonomy) => (
                <option key={taxonomy} value={taxonomy}>
                  {taxonomy === "all" ? "All taxonomies" : taxonomy}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold text-[#4c4c60]" htmlFor="carousel-limit">
            Story limit
            <input
              id="carousel-limit"
              data-testid="homepage-carousel-limit"
              type="number"
              min={3}
              max={5000}
              step={1}
              value={settings.carouselLimit}
              onChange={(event) => update("carouselLimit", Number(event.target.value))}
              className={selectClassName}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eadffb] bg-[#fbf9ff] p-4">
        <p className="text-xs text-[#66667a]">
          Settings are saved to this Admin Studio browser and applied immediately on the homepage.
        </p>
        <button
          type="submit"
          data-testid="save-homepage-settings"
          className="inline-flex items-center gap-2 rounded-xl bg-[#7a2ce2] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#6820c9]"
        >
          <Save className="h-4 w-4" /> Save homepage controls
        </button>
        {saved ? <span className="text-xs font-bold text-[#2f8a5b]">Saved</span> : null}
      </div>
    </form>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof BookOpen;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)]">
      <Icon className="h-5 w-5 text-[#7a2ce2]" />
      <p className="mt-5 text-2xl font-black text-[#262638]">{value}</p>
      <p className="mt-1 text-xs text-[#858598]">{label}</p>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: typeof Plus;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)]">
      <Icon className="h-5 w-5 text-[#7a2ce2]" />
      <h2 className="mt-5 text-lg font-extrabold text-[#262638]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#74748a]">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#7a2ce2]"
      >
        {action}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ArticleStudio({
  categories,
  onPublished,
}: {
  categories: StudioCategory[];
  onPublished: () => void;
}) {
  const roots = categories.filter((category) => category.parent === 0);
  const tagOptions = useMemo(
    () =>
      Array.from(new Set(EDITORIAL_POSTS.flatMap((post) => post.tags)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 80),
    [],
  );
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(roots[0]?.id ?? 0);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [author, setAuthor] = useState("NairaLeap Editorial");
  const [message, setMessage] = useState("");
  const [publishedSlug, setPublishedSlug] = useState("");
  const selectedCategory = categories.find((category) => category.id === categoryId) ?? roots[0];

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const addCustomTag = () => {
    const cleanTag = customTag.trim();
    if (cleanTag && !selectedTags.includes(cleanTag))
      setSelectedTags((current) => [...current, cleanTag]);
    setCustomTag("");
  };

  const handleImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file for the featured image.");
      return;
    }
    if (file.size > 2_000_000) {
      setMessage("Choose an image smaller than 2 MB for browser publishing.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setImageName(file.name);
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const publish = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !selectedCategory || !content.trim()) {
      setMessage("Add a title, category and article body before publishing.");
      return;
    }
    const tags = [
      ...selectedTags,
      ...customTag
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ];
    const article = createStudioArticle({
      title,
      category: selectedCategory,
      excerpt: excerpt || content.slice(0, 180),
      content,
      tags: Array.from(new Set(tags)),
      image,
      author,
    });
    saveStudioArticles([article, ...readStudioArticles()]);
    setTitle("");
    setExcerpt("");
    setContent("");
    setSelectedTags([]);
    setCustomTag("");
    setImage("");
    setImageName("");
    setPublishedSlug(article.slug);
    setMessage(`Published “${article.title}” to the Website workspace.`);
    onPublished();
  };

  return (
    <section className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
            Website workspace
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#262638]">Publish an article</h2>
          <p className="mt-2 text-sm text-[#77778a]">
            Published content is stored in this browser until the shared editorial database is
            connected.
          </p>
        </div>
        <Upload className="h-6 w-6 text-[#7a2ce2]" />
      </div>
      <form onSubmit={publish} className="mt-7 grid gap-5">
        <Field label="Headline">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Article headline"
            className="studio-input"
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Category — choose where this article belongs">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
              className="studio-input"
            >
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >{`${"— ".repeat(Math.max(0, category.path.length - 1))}${category.name}`}</option>
              ))}
            </select>
          </Field>
          <Field label="Author">
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              className="studio-input"
            />
          </Field>
        </div>
        <Field label="Excerpt">
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={3}
            placeholder="Short summary for cards and metadata"
            className="studio-input"
          />
        </Field>
        <Field label="Article body">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            placeholder="Write the article body. Blank lines become paragraphs."
            className="studio-input"
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tags — select one or more">
            <div className="rounded-xl border border-[#e5dff0] bg-[#fcfbff] p-3">
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${selectedTags.includes(tag) ? "border-[#7a2ce2] bg-[#7a2ce2] text-white" : "border-[#e4dcef] bg-white text-[#6f6f82] hover:border-[#c8a7ff]"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={customTag}
                  onChange={(event) => setCustomTag(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="Add a custom tag"
                  className="studio-input"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="rounded-xl border border-[#d9c9f3] px-3 text-xs font-bold text-[#6f23dd]"
                >
                  Add
                </button>
              </div>
              {selectedTags.length > 0 && (
                <p className="mt-2 text-[11px] text-[#6f23dd]">
                  Selected: {selectedTags.join(", ")}
                </p>
              )}
            </div>
          </Field>
          <Field label="Featured image">
            <div className="space-y-2 rounded-xl border border-[#e5dff0] bg-[#fcfbff] p-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="block w-full text-xs text-[#6f6f82] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f2ebff] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#6f23dd]"
              />
              <input
                value={image.startsWith("data:") ? "" : image}
                onChange={(event) => {
                  setImage(event.target.value);
                  setImageName("");
                }}
                placeholder="Or paste an image URL"
                className="studio-input"
              />
              {imageName && (
                <p className="text-[11px] font-semibold text-[#6f23dd]">Selected: {imageName}</p>
              )}
              {image && (
                <img
                  src={image}
                  alt="Featured image preview"
                  className="h-28 w-full rounded-lg object-cover"
                />
              )}
            </div>
          </Field>
        </div>
        {message && (
          <p className="rounded-xl bg-[#f8f3ff] px-4 py-3 text-xs font-semibold text-[#6f23dd]">
            {message}
          </p>
        )}
        {publishedSlug && (
          <Link
            to="/articles/$slug"
            params={{ slug: publishedSlug }}
            className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#16824d] hover:underline"
          >
            Published successfully — view article
          </Link>
        )}
        <button
          type="submit"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#7a2ce2] px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5"
        >
          <Save className="h-4 w-4" /> Publish article
        </button>
      </form>
    </section>
  );
}

function CategoryStudio({
  categories,
  onChanged,
}: {
  categories: StudioCategory[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(0);
  const [message, setMessage] = useState("");
  const grouped = useMemo(
    () => categories.filter((category) => category.parent === 0),
    [categories],
  );
  const addCategory = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setMessage("Enter a category name.");
    if (
      categories.some(
        (category) =>
          category.name.toLowerCase() === name.trim().toLowerCase() && category.parent === parentId,
      )
    )
      return setMessage("That category already exists at this level.");
    saveStudioCategories([...categories, createStudioCategory(name, parentId, categories)]);
    setName("");
    setMessage("Category created in the studio taxonomy.");
    onChanged();
  };
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
          Website workspace
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#262638]">Category builder</h2>
        <p className="mt-2 text-sm leading-6 text-[#77778a]">
          The imported Naira & Kubo taxonomy is available below. Add a new parent category or nest
          it under an existing one.
        </p>
        <form onSubmit={addCategory} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New category name"
            className="studio-input"
          />
          <select
            value={parentId}
            onChange={(event) => setParentId(Number(event.target.value))}
            className="studio-input"
          >
            <option value={0}>Top-level category</option>
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >{`${"— ".repeat(Math.max(0, category.path.length - 1))}${category.name}`}</option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7a2ce2] px-4 py-3 text-xs font-bold text-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
        {message && <p className="mt-3 text-xs font-semibold text-[#6f23dd]">{message}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {grouped.map((root) => (
          <CategoryCard
            key={root.id}
            category={root}
            categories={categories}
            onChanged={onChanged}
            onMessage={setMessage}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  categories,
  onChanged,
  onMessage,
}: {
  category: StudioCategory;
  categories: StudioCategory[];
  onChanged: () => void;
  onMessage: (message: string) => void;
}) {
  const children = categories.filter((item) => item.parent === category.id).slice(0, 7);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const canDelete = category.source === "studio" && children.length === 0;

  const saveName = () => {
    const next = renameStudioCategory(category.id, name, categories);
    if (next === categories) {
      onMessage("Enter a new category name.");
      return;
    }
    saveStudioCategories(next);
    setEditing(false);
    onMessage(`Updated “${name.trim()}” and its category path.`);
    onChanged();
  };

  const remove = () => {
    if (category.source !== "studio") {
      onMessage(
        "Imported WordPress categories are locked. Create a studio category to manage it here.",
      );
      return;
    }
    if (children.length > 0) {
      onMessage("Move or delete child categories before deleting this parent.");
      return;
    }
    saveStudioCategories(deleteStudioCategory(category.id, categories));
    onMessage(`Deleted “${category.name}”.`);
    onChanged();
  };

  return (
    <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="studio-input max-w-[15rem]"
                aria-label={`Rename ${category.name}`}
              />
              <button
                type="button"
                onClick={saveName}
                className="rounded-lg bg-[#7a2ce2] px-2.5 py-2 text-[10px] font-bold text-white"
              >
                Save
              </button>
            </div>
          ) : (
            <h3 className="font-extrabold text-[#262638]">{category.name}</h3>
          )}
          <p className="mt-1 text-[11px] text-[#9292a4]">
            {category.source === "studio" ? "Created in studio" : "Imported from WordPress"}
          </p>
        </div>
        <span className="rounded-full bg-[#f4efff] px-2 py-1 text-[10px] font-bold text-[#7a2ce2]">
          {category.count} posts
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-[#f0ebf6] pt-3">
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6f23dd]"
        >
          <Pencil className="h-3.5 w-3.5" /> Rename
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={!canDelete && category.source !== "studio"}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#b04a5a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
      {children.length > 0 && (
        <ul className="mt-4 space-y-2 border-l border-[#e8e1f1] pl-4">
          {children.map((child) => (
            <li key={child.id} className="text-xs text-[#6f6f82]">
              {child.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PluginStudio({ workspace }: { workspace: Workspace }) {
  const plugins = {
    website: [
      {
        title: "WordPress editorial source",
        description:
          "Feeds the local editorial snapshot and can optionally sync public posts from the WordPress REST API.",
        ready: Boolean(import.meta.env.VITE_WORDPRESS_API_URL),
        env: "VITE_WORDPRESS_API_URL",
        link: "/",
        action: "View website",
      },
    ],
    portal: [
      {
        title: "Supabase Auth & requests",
        description:
          "Powers portal authentication and customer service-request persistence. Admin triage still requires a protected role and RLS policy.",
        ready: Boolean(
          import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        ),
        env: "VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY",
        link: "/services",
        action: "View portal",
      },
    ],
    shared: [
      {
        title: "KeyPay gateway",
        description:
          "Reserved for portal payments and paid website flows. Only the public key belongs in the frontend; gateway pass and secret credentials stay server-side.",
        ready: Boolean(import.meta.env.VITE_KEYPAY_PUBLIC_KEY),
        env: "VITE_KEYPAY_PUBLIC_KEY",
        link: "/services",
        action: "View payment surfaces",
      },
    ],
  };
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
          {workspace === "website" ? "Website" : "Service Portal"} workspace
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#262638]">Plugins & setup</h2>
        <p className="mt-2 text-sm leading-6 text-[#77778a]">
          Configure the website and portal plugins from one place. Values are read at build time
          from the deployment environment; this panel never stores or exposes gateway secrets.
        </p>
      </div>
      <PluginGroup
        title="Website plugins"
        description="Editorial publishing, content source, and public website operations."
        plugins={plugins.website}
        active={workspace === "website"}
      />
      <PluginGroup
        title="Services portal plugins"
        description="Authentication, request persistence, and portal operations."
        plugins={plugins.portal}
        active={workspace === "portal"}
      />
      <PluginGroup
        title="Shared payment plugin"
        description="Available to both workspaces when the merchant gateway is configured."
        plugins={plugins.shared}
        active
      />
    </section>
  );
}

function PluginGroup({
  title,
  description,
  plugins,
  active,
}: {
  title: string;
  description: string;
  plugins: {
    title: string;
    description: string;
    ready: boolean;
    env: string;
    link: string;
    action: string;
  }[];
  active: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 ${active ? "border-[#d8c9f3] bg-[#fcfaff]" : "border-[#e8e1f1] bg-white"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-[#262638]">{title}</h3>
          <p className="mt-1 text-sm text-[#77778a]">{description}</p>
        </div>
        {active && (
          <span className="rounded-full bg-[#f2ebff] px-2.5 py-1 text-[10px] font-bold text-[#6f23dd]">
            Active workspace
          </span>
        )}
      </div>
      <div className="mt-4 grid gap-3">
        {plugins.map((plugin) => (
          <PluginCard key={plugin.title} {...plugin} />
        ))}
      </div>
    </section>
  );
}

function PluginCard({
  title,
  description,
  ready,
  env,
  link,
  action,
}: {
  title: string;
  description: string;
  ready: boolean;
  env: string;
  link: string;
  action: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#e8e1f1] bg-white p-5 sm:flex-row sm:items-start">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${ready ? "bg-[#e9f9f0] text-[#16824d]" : "bg-[#fff6df] text-[#a36b00]"}`}
      >
        {ready ? <CheckCircle2 className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold text-[#262638]">{title}</h3>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${ready ? "bg-[#e9f9f0] text-[#16824d]" : "bg-[#fff6df] text-[#a36b00]"}`}
          >
            {ready ? "Ready" : "Setup pending"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#77778a]">{description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="rounded-lg bg-[#f8f5ff] px-2 py-1 font-mono text-[#6f23dd]">{env}</span>
          <Link
            to={link}
            className="inline-flex items-center gap-1 font-bold text-[#6f23dd] hover:underline"
          >
            {action} <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-bold text-[#5f5f73]">
      <span>{label}</span>
      {children}
    </label>
  );
}
