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
import { useClients } from "@/hooks/useClients";
import { useFinanceMutations } from "@/hooks/useFinance";

const schema = z.object({
  number: z.string().min(1, "Informe o número"),
  amount: z.coerce.number().positive("Informe um valor válido"),
  dueDate: z.string().min(1, "Informe o vencimento"),
  clientId: z.string().min(1, "Selecione um cliente"),
});

type FormValues = z.infer<typeof schema>;

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceFormDialog({ open, onOpenChange }: InvoiceFormDialogProps) {
  const { data: clients } = useClients();
  const { createInvoice } = useFinanceMutations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await createInvoice.mutateAsync({ ...values, dueDate: new Date(values.dueDate).toISOString() });
      toast.success("Fatura criada");
      reset({ number: "", amount: 0, dueDate: "", clientId: "" });
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível criar a fatura");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova fatura</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="number">Número</Label>
            <Input id="number" placeholder="INV-1003" {...register("number")} />
            {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Cliente</Label>
            <Select value={watch("clientId")} onValueChange={(value) => setValue("clientId", value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o cliente">
                  {(value: string) => clients?.find((c) => c.id === value)?.name ?? "Selecione o cliente"}
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
            {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Valor</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">Vencimento</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
