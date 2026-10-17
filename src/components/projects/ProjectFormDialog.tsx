import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { useProjectMutations } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import type { Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  subtitle: z.string().optional(),
  budget: z.coerce.number().nonnegative("Informe um valor válido"),
  deadline: z.string().optional(),
  status: z.enum(["in_progress", "completed", "on_hold"]),
  progressPct: z.coerce.number().min(0).max(100),
  clientId: z.string().optional(),
  memberIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

const STATUS_LABEL: Record<ProjectStatus, string> = {
  in_progress: "Em andamento",
  completed: "Concluído",
  on_hold: "Pausado",
};

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { data: clients } = useClients();
  const { data: users } = useUsers();
  const { create, update } = useProjectMutations();
  const isEditing = Boolean(project);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "in_progress", progressPct: 0, memberIds: [] },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: project?.name ?? "",
        subtitle: project?.subtitle ?? "",
        budget: project?.budget ?? 0,
        deadline: project?.deadline ? project.deadline.slice(0, 10) : "",
        status: project?.status ?? "in_progress",
        progressPct: project?.progressPct ?? 0,
        clientId: project?.client?.id ?? undefined,
        memberIds: project?.members.map((m) => m.id) ?? [],
      });
    }
  }, [open, project, reset]);

  const selectedMembers = watch("memberIds");

  function toggleMember(id: string) {
    const current = watch("memberIds");
    setValue("memberIds", current.includes(id) ? current.filter((m) => m !== id) : [...current, id]);
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
      clientId: values.clientId || null,
    };

    try {
      if (isEditing && project) {
        await update.mutateAsync({ id: project.id, input: payload });
        toast.success("Projeto atualizado");
      } else {
        await create.mutateAsync(payload);
        toast.success("Projeto criado");
      }
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível salvar o projeto");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar projeto" : "Novo projeto"}</DialogTitle>
        </DialogHeader>

        <form className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input id="subtitle" placeholder="Ex: Landing Page Design" {...register("subtitle")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="budget">Orçamento</Label>
              <Input id="budget" type="number" step="0.01" {...register("budget")} />
              {errors.budget && <p className="text-xs text-destructive">{errors.budget.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="deadline">Prazo</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as ProjectStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(value: ProjectStatus) => STATUS_LABEL[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="on_hold">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="progressPct">Progresso (%)</Label>
              <Input id="progressPct" type="number" min={0} max={100} {...register("progressPct")} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Cliente</Label>
            <Select value={watch("clientId") ?? ""} onValueChange={(v) => setValue("clientId", v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem cliente">
                  {(value: string) => clients?.find((c) => c.id === value)?.name ?? "Sem cliente"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Equipe</Label>
            <div className="flex flex-col gap-1 rounded-lg border border-border p-2">
              {users?.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => toggleMember(user.id)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                    selectedMembers.includes(user.id) && "bg-accent"
                  )}
                >
                  {user.name}
                  {selectedMembers.includes(user.id) && <span className="text-xs text-primary">Selecionado</span>}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
