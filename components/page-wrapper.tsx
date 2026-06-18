interface PageWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function PageWrapper({ children, title, description }: PageWrapperProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {title && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}