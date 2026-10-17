import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketFormDialog } from "@/components/support/TicketFormDialog";
import { useTicketMutations, useTickets } from "@/hooks/useSupport";
import { formatDate } from "@/lib/format";
import type { SupportTicket, TicketStatus } from "@/lib/types";

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Aberto",
  pending: "Pendente",
  closed: "Fechado",
};

const STATUS_VARIANT: Record<TicketStatus, "default" | "secondary" | "outline"> = {
  open: "default",
  pending: "secondary",
  closed: "outline",
};

const PRIORITY_LABEL: Record<SupportTicket["priority"], string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export function Support() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: tickets, isLoading } = useTickets();
  const { update } = useTicketMutations();

  async function handleStatusChange(ticket: SupportTicket, status: TicketStatus) {
    try {
      await update.mutateAsync({ id: ticket.id, input: { status } });
    } catch {
      toast.error("Não foi possível atualizar o status");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suporte</h1>
          <p className="text-sm text-muted-foreground">Acompanhe os chamados de suporte</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Novo chamado
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tickets?.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{ticket.subject}</p>
                  <Badge variant={STATUS_VARIANT[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
                  <Badge variant="outline">{PRIORITY_LABEL[ticket.priority]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Aberto por {ticket.requester.name} em {formatDate(ticket.createdAt)}
                </p>
              </div>

              <Select value={ticket.status} onValueChange={(value) => handleStatusChange(ticket, value as TicketStatus)}>
                <SelectTrigger className="w-36">
                  <SelectValue>{(value: TicketStatus) => STATUS_LABEL[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}

        {tickets && tickets.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum chamado por aqui.
            </CardContent>
          </Card>
        )}
      </div>

      <TicketFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
