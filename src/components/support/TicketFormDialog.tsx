import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useTicketMutations } from "@/hooks/useSupport";
import type { TicketPriority } from "@/lib/types";

const schema = z.object({
  subject: z.string().min(1, "Informe o assunto"),
  description: z.string().min(1, "Descreva o problema"),
  priority: z.enum(["low", "medium", "high"]),
});

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

type FormValues = z.infer<typeof schema>;

interface TicketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketFormDialog({ open, onOpenChange }: TicketFormDialogProps) {
  const { create } = useTicketMutations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { priority: "medium" } });

  async function onSubmit(values: FormValues) {
    try {
      await create.mutateAsync(values);
      toast.success("Chamado aberto");
      reset({ subject: "", description: "", priority: "medium" });
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível abrir o chamado");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo chamado</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input id="subject" {...register("subject")} />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Prioridade</Label>
            <Select
              value={watch("priority")}
              onValueChange={(value) => setValue("priority", value as TicketPriority)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione">{(value: TicketPriority) => PRIORITY_LABEL[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Abrir chamado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
