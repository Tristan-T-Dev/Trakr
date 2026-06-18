import PageWrapper from "@/components/page-wrapper"
import NewsFeed from "@/components/news-feed"

export default function NewsPage() {
  return (
    <PageWrapper title="News" description="Latest market news">
      <NewsFeed />
    </PageWrapper>
  )
}