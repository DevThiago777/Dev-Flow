import { Briefcase, Users, Wallet } from "lucide-react";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/format";
import { useDashboard } from "@/hooks/useDashboard";

export function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bem-vindo de volta, {user?.name?.split(" ")[0]}</p>
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os dados do dashboard.
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <KpiCard
              icon={Briefcase}
              iconClassName="bg-primary/15 text-primary"
              label="Projects"
              value={String(data.kpis.projects.total)}
              deltaPct={data.kpis.projects.deltaPct}
            />
            <KpiCard
              icon={Users}
              iconClassName="bg-emerald-500/15 text-emerald-500"
              label="Clients"
              value={String(data.kpis.clients.total)}
              deltaPct={data.kpis.clients.deltaPct}
            />
            <KpiCard
              icon={Wallet}
              iconClassName="bg-amber-500/15 text-amber-500"
              label="Revenue"
              value={formatCurrency(data.kpis.revenue.total)}
              deltaPct={data.kpis.revenue.deltaPct}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EarningsChart earnings={data.earnings} />
            </div>
            <MiniCalendar events={data.todayEvents} />
          </div>

          <ProjectsTable projects={data.recentProjects} />
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
