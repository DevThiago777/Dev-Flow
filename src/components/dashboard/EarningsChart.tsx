import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { DashboardResponse } from "@/lib/types";

interface EarningsChartProps {
  earnings: DashboardResponse["earnings"];
}

export function EarningsChart({ earnings }: EarningsChartProps) {
  const data = earnings.series.map((point) => ({
    ...point,
    label: formatDate(point.date, { day: "2-digit", month: "short" }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-6">
          <LegendStat colorClassName="bg-primary" label="Earning" value={formatCurrency(earnings.totalEarning)} />
          <LegendStat
            colorClassName="bg-muted-foreground/40"
            label="Expense"
            value={formatCurrency(earnings.totalExpense)}
          />
          <LegendStat colorClassName="bg-transparent" label="Total Revenue" value={formatCurrency(earnings.totalRevenue)} />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(v) => `${Math.round(v / 1000)}K`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="earning" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="var(--muted-foreground)" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function LegendStat({
  colorClassName,
  label,
  value,
}: {
  colorClassName: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-2.5 rounded-sm ${colorClassName}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
