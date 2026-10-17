import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
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
import { useCalendarEventMutations } from "@/hooks/useCalendarEvents";
import { useUsers } from "@/hooks/useUsers";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Informe o título"),
  date: z.string().min(1, "Informe a data"),
  startTime: z.string().min(1, "Informe o início"),
  endTime: z.string().min(1, "Informe o fim"),
  attendeeIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

function toLocalInputParts(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
}

export function EventFormDialog({ open, onOpenChange, event, defaultDate }: EventFormDialogProps) {
  const { data: users } = useUsers();
  const { create, update, remove } = useCalendarEventMutations();
  const isEditing = Boolean(event);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { attendeeIds: [] } });

  useEffect(() => {
    if (!open) return;

    if (event) {
      const start = toLocalInputParts(event.startAt);
      const end = toLocalInputParts(event.endAt);
      reset({
        title: event.title,
        date: start.date,
        startTime: start.time,
        endTime: end.time,
        attendeeIds: event.attendees.map((a) => a.id),
      });
    } else {
      const base = defaultDate ?? new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      reset({
        title: "",
        date: `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`,
        startTime: "09:00",
        endTime: "10:00",
        attendeeIds: [],
      });
    }
  }, [open, event, defaultDate, reset]);

  const selectedAttendees = watch("attendeeIds");

  function toggleAttendee(id: string) {
    const current = watch("attendeeIds");
    setValue("attendeeIds", current.includes(id) ? current.filter((a) => a !== id) : [...current, id]);
  }

  async function onSubmit(values: FormValues) {
    const startAt = new Date(`${values.date}T${values.startTime}`).toISOString();
    const endAt = new Date(`${values.date}T${values.endTime}`).toISOString();

    try {
      if (isEditing && event) {
        await update.mutateAsync({
          id: event.id,
          input: { title: values.title, startAt, endAt, attendeeIds: values.attendeeIds },
        });
        toast.success("Evento atualizado");
      } else {
        await create.mutateAsync({ title: values.title, startAt, endAt, attendeeIds: values.attendeeIds });
        toast.success("Evento criado");
      }
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível salvar o evento");
    }
  }

  async function handleDelete() {
    if (!event) return;
    try {
      await remove.mutateAsync(event.id);
      toast.success("Evento removido");
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível remover o evento");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar evento" : "Novo evento"}</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">Início</Label>
              <Input id="startTime" type="time" {...register("startTime")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endTime">Fim</Label>
              <Input id="endTime" type="time" {...register("endTime")} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Participantes</Label>
            <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2">
              {users?.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => toggleAttendee(user.id)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                    selectedAttendees.includes(user.id) && "bg-accent"
                  )}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className={isEditing ? "sm:justify-between" : undefined}>
            {isEditing && (
              <Button type="button" variant="outline" onClick={handleDelete} className="text-destructive">
                <Trash2 className="size-4" />
                Excluir
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
