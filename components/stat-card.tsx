interface StatCardProps {
  label: string
  value: string
  subValue?: string
  positive?: boolean
  negative?: boolean
}

export default function StatCard({ label, value, subValue, positive, negative }: StatCardProps) {
  const subColor = positive
    ? "text-green-500"
    : negative
    ? "text-red-500"
    : "text-slate-500 dark:text-slate-400"

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      {subValue && (
        <p className={`text-xs mt-0.5 font-medium ${subColor}`}>{subValue}</p>
      )}
    </div>
  )
}