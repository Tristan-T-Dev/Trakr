export default function Badge({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const isPositive = value >= 0
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
      isPositive
        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    }`}>
      {isPositive ? "+" : ""}{prefix}{value.toFixed(2)}{suffix}
    </span>
  )
}