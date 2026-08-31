import { Skeleton } from "./skeleton";

export function AppSkeleton() {
  return (
    <main className="min-h-dvh bg-background pb-20 text-foreground" aria-busy="true">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <section className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-12 w-full max-w-xl rounded-xl" />
            <Skeleton className="h-5 w-full max-w-2xl" />
            <Skeleton className="h-5 w-5/6 max-w-xl" />
            <div className="flex flex-wrap gap-3 pt-3">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-36 rounded-xl" />
            </div>
          </div>
          <div className="glass-panel space-y-5 p-6 sm:p-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-3 pt-3">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-4/5 rounded-xl" />
            </div>
          </div>
        </section>
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="glass-panel space-y-4 p-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </section>
        <p className="sr-only" role="status">
          Loading page
        </p>
      </div>
    </main>
  );
}
