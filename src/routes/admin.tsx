import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FolderTree,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Store,
  Upload,
} from "lucide-react";
import { EditorialLayout } from "@/components";
import {
  createStudioArticle,
  createStudioCategory,
  readStudioArticles,
  readStudioCategories,
  saveStudioArticles,
  saveStudioCategories,
  STUDIO_CHANGE_EVENT,
  type StudioArticle,
  type StudioCategory,
} from "@/features/editorial/studio";

export const Route = createFileRoute("/admin")({
  component: AdminStudioPage,
});

type Workspace = "website" | "portal";
type AdminView = "overview" | "articles" | "categories" | "plugins";

function AdminStudioPage() {
  const [workspace, setWorkspace] = useState<Workspace>("website");
  const [view, setView] = useState<AdminView>("overview");
  const [articles, setArticles] = useState<StudioArticle[]>([]);
  const [categories, setCategories] = useState<StudioCategory[]>([]);

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
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/75">
                <LockKeyhole className="h-3.5 w-3.5 text-[#d2b8ff]" /> Gateway pass pending setup
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setWorkspace("website")}
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
                onClick={() => setWorkspace("portal")}
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
          <aside className="h-fit rounded-2xl border border-[#e8e1f1] bg-white p-2 shadow-[0_8px_24px_rgba(43,25,79,0.05)]">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "articles", label: "Articles", icon: BookOpen },
              { id: "categories", label: "Categories", icon: FolderTree },
              { id: "plugins", label: "Plugins & setup", icon: Settings2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id as AdminView)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${view === id ? "bg-[#f2ebff] text-[#6f23dd]" : "text-[#6f6f82] hover:bg-[#faf8ff]"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </aside>

          <main>
            {view === "overview" && (
              <Overview
                workspace={workspace}
                articles={articles}
                categories={categories}
                onView={setView}
              />
            )}
            {view === "articles" && <ArticleStudio categories={categories} onPublished={reload} />}
            {view === "categories" && <CategoryStudio categories={categories} onChanged={reload} />}
            {view === "plugins" && <PluginStudio workspace={workspace} />}
          </main>
        </div>
      </div>
    </EditorialLayout>
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
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(roots[0]?.id ?? 0);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("NairaLeap Editorial");
  const [message, setMessage] = useState("");
  const selectedCategory = categories.find((category) => category.id === categoryId) ?? roots[0];

  const publish = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !selectedCategory || !content.trim()) {
      setMessage("Add a title, category and article body before publishing.");
      return;
    }
    const article = createStudioArticle({
      title,
      category: selectedCategory,
      excerpt: excerpt || content.slice(0, 180),
      content,
      tags: tags.split(",").map((tag) => tag.trim()),
      image,
      author,
    });
    saveStudioArticles([article, ...readStudioArticles()]);
    setTitle("");
    setExcerpt("");
    setContent("");
    setTags("");
    setImage("");
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
          <Field label="Category">
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
          <Field label="Tags (comma separated)">
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="policy, economy, Nigeria"
              className="studio-input"
            />
          </Field>
          <Field label="Featured image URL (optional)">
            <input
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="https://..."
              className="studio-input"
            />
          </Field>
        </div>
        {message && (
          <p className="rounded-xl bg-[#f8f3ff] px-4 py-3 text-xs font-semibold text-[#6f23dd]">
            {message}
          </p>
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
        {grouped.slice(0, 16).map((root) => (
          <CategoryCard key={root.id} category={root} categories={categories} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  categories,
}: {
  category: StudioCategory;
  categories: StudioCategory[];
}) {
  const children = categories.filter((item) => item.parent === category.id).slice(0, 7);
  return (
    <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-[#262638]">{category.name}</h3>
          <p className="mt-1 text-[11px] text-[#9292a4]">
            {category.source === "studio" ? "Created in studio" : "Imported from WordPress"}
          </p>
        </div>
        <span className="rounded-full bg-[#f4efff] px-2 py-1 text-[10px] font-bold text-[#7a2ce2]">
          {category.count} posts
        </span>
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
  const keyPayReady = Boolean(import.meta.env.VITE_KEYPAY_PUBLIC_KEY);
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-[#e8e1f1] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)] sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
          {workspace === "website" ? "Website" : "Service Portal"} workspace
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#262638]">Plugins & setup</h2>
        <p className="mt-2 text-sm leading-6 text-[#77778a]">
          Keep website publishing and portal operations separate while managing their integrations
          from the same studio.
        </p>
      </div>
      <PluginCard
        title="KeyPay gateway"
        description="Payment gateway configuration is scaffolded here. Add the public key and gateway pass when the merchant account is ready."
        ready={keyPayReady}
      />
      <PluginCard
        title="Editorial source"
        description="Local WordPress migration is active, with optional REST synchronization configured through VITE_WORDPRESS_API_URL."
        ready={Boolean(import.meta.env.VITE_WORDPRESS_API_URL)}
      />
      <PluginCard
        title="Supabase service portal"
        description="Authentication and service request persistence are available when the Supabase project is configured and migrations are applied."
        ready={Boolean(
          import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        )}
      />
    </section>
  );
}

function PluginCard({
  title,
  description,
  ready,
}: {
  title: string;
  description: string;
  ready: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#e8e1f1] bg-white p-5">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${ready ? "bg-[#e9f9f0] text-[#16824d]" : "bg-[#fff6df] text-[#a36b00]"}`}
      >
        {ready ? <CheckCircle2 className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold text-[#262638]">{title}</h3>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${ready ? "bg-[#e9f9f0] text-[#16824d]" : "bg-[#fff6df] text-[#a36b00]"}`}
          >
            {ready ? "Ready" : "Setup pending"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#77778a]">{description}</p>
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
