import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  deltaPct: number;
}

export function KpiCard({ icon: Icon, iconClassName, label, value, deltaPct }: KpiCardProps) {
  const isPositive = deltaPct >= 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className={cn("flex size-8 items-center justify-center rounded-lg", iconClassName)}>
            <Icon className="size-4" />
          </span>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>

        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isPositive ? "text-emerald-500" : "text-destructive"
            )}
          >
            {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(deltaPct)}%
          </span>
        </div>
        <span className="-mt-2 text-xs text-muted-foreground">este mês</span>
      </CardContent>
    </Card>
  );
}
