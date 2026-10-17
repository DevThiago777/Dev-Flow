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
import { useFinanceMutations } from "@/hooks/useFinance";
import type { TransactionType } from "@/lib/types";

const schema = z.object({
  type: z.enum(["earning", "expense"]),
  amount: z.coerce.number().positive("Informe um valor válido"),
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const TYPE_LABEL: Record<TransactionType, string> = {
  earning: "Receita",
  expense: "Despesa",
};

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionFormDialog({ open, onOpenChange }: TransactionFormDialogProps) {
  const { createTransaction } = useFinanceMutations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: "earning" } });

  async function onSubmit(values: FormValues) {
    try {
      await createTransaction.mutateAsync(values);
      toast.success("Transação registrada");
      reset({ type: "earning", amount: 0, description: "", category: "" });
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível registrar a transação");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={watch("type")} onValueChange={(value) => setValue("type", value as TransactionType)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: TransactionType) => TYPE_LABEL[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="earning">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Valor</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" {...register("category")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
