import { useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import type { Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
};

const STATUS_BAR_CLASS: Record<ProjectStatus, string> = {
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  on_hold: "bg-muted-foreground",
};

interface ProjectsTableProps {
  projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [tab, setTab] = useState<"all" | ProjectStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesTab = tab === "all" || project.status === tab;
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [projects, tab, search]);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Projects</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 pl-9"
            />
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">All Project</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Project</th>
              <th className="py-2 pr-4 font-medium">Budget</th>
              <th className="py-2 pr-4 font-medium">Assigned</th>
              <th className="py-2 pr-4 font-medium">Task</th>
              <th className="py-2 pr-4 font-medium">Deadline</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id} className="border-b border-border/60 last:border-0">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name[0]}
                    </span>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      {project.subtitle && <p className="text-xs text-muted-foreground">{project.subtitle}</p>}
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 font-medium">{formatCurrency(project.budget)}</td>
                <td className="py-3 pr-4">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="size-7 border-2 border-card">
                        <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
                        <AvatarFallback className="text-[10px]">{initials(member.name)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members.length > 3 && (
                      <span className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium">
                        +{project.members.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{project.taskCount}</td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {project.deadline ? formatDate(project.deadline) : "—"}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex w-32 flex-col gap-1">
                    <span className="text-xs font-medium">{STATUS_LABEL[project.status]}</span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", STATUS_BAR_CLASS[project.status])}
                        style={{ width: `${project.progressPct}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum projeto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
