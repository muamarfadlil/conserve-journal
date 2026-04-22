export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-[var(--bg-surface-alt)]" />
        <div className="h-4 w-64 rounded bg-[var(--bg-surface-alt)]" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[var(--bg-surface)]
                                  border border-[var(--border-default)]" />
        ))}
      </div>

      {/* Content rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--bg-surface)]
                                  border border-[var(--border-default)]" />
        ))}
      </div>
    </div>
  )
}
