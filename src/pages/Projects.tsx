import { MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { useProjectMutations, useProjects } from "@/hooks/useProjects";
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

export function Projects() {
  const [tab, setTab] = useState<"all" | ProjectStatus>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useProjects({ status: tab, search });
  const { remove } = useProjectMutations();

  function openCreate() {
    setEditingProject(null);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setDialogOpen(true);
  }

  async function handleDelete(project: Project) {
    try {
      await remove.mutateAsync(project.id);
      toast.success("Projeto removido");
    } catch {
      toast.error("Não foi possível remover o projeto");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground">Acompanhe o andamento de todos os projetos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Novo projeto
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">All Project</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="on_hold">On Hold</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          )}

          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Project</th>
                <th className="py-2 pr-4 font-medium">Cliente</th>
                <th className="py-2 pr-4 font-medium">Budget</th>
                <th className="py-2 pr-4 font-medium">Assigned</th>
                <th className="py-2 pr-4 font-medium">Task</th>
                <th className="py-2 pr-4 font-medium">Deadline</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {projects?.map((project) => (
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
                  <td className="py-3 pr-4 text-muted-foreground">{project.client?.name ?? "—"}</td>
                  <td className="py-3 pr-4 font-medium">{formatCurrency(project.budget)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="size-7 border-2 border-card">
                          <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
                          <AvatarFallback className="text-[10px]">{initials(member.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(project)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(project)}>
                          <Trash2 className="size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {projects && projects.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editingProject} />
    </div>
  );
}
