import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { EditorialLayout } from "@/components";
import { EDITORIAL_POSTS } from "@/data/wordpressEditorial";

export const Route = createFileRoute("/")({ component: EditorialHomePage });

function EditorialHomePage() {
  const [lead, ...stories] = EDITORIAL_POSTS;

  return (
    <EditorialLayout>
      <section className="mx-auto max-w-[1180px] px-4 pt-6 sm:px-6">
        <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[linear-gradient(115deg,#20202d,#555565)] px-6 py-10 text-white shadow-sm sm:min-h-[410px] sm:px-10 sm:py-14">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(164,89,255,0.5),transparent_34%),linear-gradient(90deg,rgba(12,12,24,0.72),rgba(18,18,30,0.1))]"
            aria-hidden="true"
          />
          <div className="relative flex min-h-[290px] max-w-2xl flex-col justify-end sm:min-h-[330px]">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              <Sparkles className="h-3.5 w-3.5" />
              {lead.category}
            </span>
            <p className="text-xs font-medium text-white/70">{lead.date}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-5xl">
              {lead.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">{lead.excerpt}</p>
            <a
              href={`/articles/${lead.slug}`}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-[#5f20c9] transition hover:-translate-y-0.5"
            >
              Read story <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
            <span className="text-[#7a2ce2]">✦</span> Top Stories
          </h2>
          <a
            href="#all-stories"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#7a2ce2]"
          >
            All Stories <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stories.slice(0, 8).map((post, index) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-xl border border-[#ececf3] bg-white shadow-[0_8px_24px_rgba(43,25,79,0.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(43,25,79,0.12)]"
            >
              <div
                className={`h-32 bg-gradient-to-br ${index % 3 === 0 ? "from-[#d9c7ff] via-[#8f65d9] to-[#34284e]" : index % 3 === 1 ? "from-[#f0c1d7] via-[#d86b85] to-[#51304e]" : "from-[#c9d9e7] via-[#7198ae] to-[#23384c]"}`}
              />
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-[#7a2ce2]">
                  {post.category}
                </p>
                <p className="mt-2 text-[10px] text-[#9292a4]">{post.date}</p>
                <h3 className="mt-2 line-clamp-3 text-sm font-bold leading-5 text-[#262638]">
                  <a href={`/articles/${post.slug}`} className="hover:text-[#7a2ce2]">
                    {post.title}
                  </a>
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="all-stories" className="mx-auto max-w-[1180px] px-4 pb-8 sm:px-6">
        <div className="mb-5 flex items-center justify-between border-b border-[#e9e9f0] pb-3">
          <h2 className="text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">All Stories</h2>
          <span className="text-xs text-[#89899b]">Indicators</span>
        </div>
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {stories.slice(8).map((post) => (
            <article key={post.slug} className="flex gap-4 border-b border-[#efeff4] pb-5">
              <div className="h-20 w-24 shrink-0 rounded-lg bg-gradient-to-br from-[#e7d6ff] to-[#78609f]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7a2ce2]">
                  {post.category}
                </p>
                <p className="mt-1 text-[10px] text-[#9292a4]">{post.date}</p>
                <h3 className="mt-1 text-sm font-bold leading-5 text-[#28283a]">
                  <a href={`/articles/${post.slug}`} className="hover:text-[#7a2ce2]">
                    {post.title}
                  </a>
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </EditorialLayout>
  );
}
