import PageWrapper from "@/components/page-wrapper"
import PortfolioSummary from "@/components/portfolio-summary"
import AddHoldingForm from "@/components/add-holding-form"
import HoldingsTable from "@/components/holding-table"
import AddHoldingFAB from "@/components/add-holding-fab"

export default function DashboardPage() {
  return (
    <PageWrapper title="Dashboard" description="Your portfolio at a glance">
      <div className="flex flex-col gap-6">
        <PortfolioSummary />

        {/* Inline form — desktop only; FAB handles mobile */}
        <div className="hidden sm:block">
          <AddHoldingForm />
        </div>

        <HoldingsTable />
      </div>

      {/* Mobile floating action button */}
      <AddHoldingFAB />
    </PageWrapper>
  )
}