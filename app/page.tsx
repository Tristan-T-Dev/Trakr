import PageWrapper from "@/components/page-wrapper"
import PortfolioSummary from "@/components/portfolio-summary"
import AddHoldingForm from "@/components/add-holding-form"
import HoldingsTable from "@/components/holding-table"

export default function DashboardPage() {
  return (
    <PageWrapper title="Dashboard" description="Your portfolio at a glance">
      <div className="flex flex-col gap-6">
        <PortfolioSummary />
        <AddHoldingForm />
        <HoldingsTable />
      </div>
    </PageWrapper>
  )
}