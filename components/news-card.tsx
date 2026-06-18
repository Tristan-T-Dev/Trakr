"use client"

interface Article {
  title: string
  source: string
  url: string
  publishedAt: string
  description?: string
}

export default function NewsCard({ article }: { article: Article }) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return "Just now"
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {article.source}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {timeAgo(article.publishedAt)}
        </span>
      </div>
      <h3 className="text-sm font-medium leading-snug mb-1 text-slate-900 dark:text-white">
        {article.title}
      </h3>
      {article.description && (
        <p className="text-xs leading-relaxed line-clamp-2 text-slate-500 dark:text-slate-400">
          {article.description}
        </p>
      )}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs mt-2 inline-block text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        Read more
      </a>
    </div>
  )
}