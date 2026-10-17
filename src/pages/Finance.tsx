import { ArrowDownRight, ArrowUpRight, Plus, Trash2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceFormDialog } from "@/components/finance/InvoiceFormDialog";
import { TransactionFormDialog } from "@/components/finance/TransactionFormDialog";
import { useFinanceMutations, useInvoices, useTransactions } from "@/hooks/useFinance";
import { formatCurrency, formatDate } from "@/lib/format";
import type { InvoiceStatus } from "@/lib/types";

const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  paid: "Paga",
  overdue: "Atrasada",
};

const INVOICE_STATUS_VARIANT: Record<InvoiceStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  sent: "secondary",
  paid: "default",
  overdue: "destructive",
};

export function Finance() {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const { data: transactions, isLoading: loadingTransactions } = useTransactions();
  const { data: invoices, isLoading: loadingInvoices } = useInvoices();
  const { deleteTransaction } = useFinanceMutations();

  const summary = useMemo(() => {
    const earning = transactions?.filter((t) => t.type === "earning").reduce((sum, t) => sum + t.amount, 0) ?? 0;
    const expense = transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) ?? 0;
    return { earning, expense, balance: earning - expense };
  }, [transactions]);

  async function handleDeleteTransaction(id: string) {
    try {
      await deleteTransaction.mutateAsync(id);
      toast.success("Transação removida");
    } catch {
      toast.error("Não foi possível remover a transação");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Acompanhe receitas, despesas e faturas</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label="Receita" value={summary.earning} icon={ArrowUpRight} tone="emerald" />
        <SummaryCard label="Despesa" value={summary.expense} icon={ArrowDownRight} tone="destructive" />
        <SummaryCard label="Saldo" value={summary.balance} icon={Wallet} tone="primary" />
      </div>

      <Tabs defaultValue="transactions">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Transações</CardTitle>
              <Button size="sm" onClick={() => setTransactionDialogOpen(true)}>
                <Plus className="size-4" />
                Nova transação
              </Button>
            </CardHeader>
            <CardContent>
              {loadingTransactions && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Descrição</th>
                      <th className="py-2 pr-4 font-medium">Categoria</th>
                      <th className="py-2 pr-4 font-medium">Data</th>
                      <th className="py-2 pr-4 font-medium">Valor</th>
                      <th className="py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 font-medium">{transaction.description}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{transaction.category ?? "—"}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{formatDate(transaction.date)}</td>
                        <td
                          className={
                            transaction.type === "earning"
                              ? "py-3 pr-4 font-medium text-emerald-500"
                              : "py-3 pr-4 font-medium text-destructive"
                          }
                        >
                          {transaction.type === "earning" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions && transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                          Nenhuma transação registrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Faturas</CardTitle>
              <Button size="sm" onClick={() => setInvoiceDialogOpen(true)}>
                <Plus className="size-4" />
                Nova fatura
              </Button>
            </CardHeader>
            <CardContent>
              {loadingInvoices && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Número</th>
                      <th className="py-2 pr-4 font-medium">Cliente</th>
                      <th className="py-2 pr-4 font-medium">Vencimento</th>
                      <th className="py-2 pr-4 font-medium">Valor</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices?.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 font-medium">{invoice.number}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{invoice.client.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                        <td className="py-3 pr-4 font-medium">{formatCurrency(invoice.amount)}</td>
                        <td className="py-3">
                          <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
                            {INVOICE_STATUS_LABEL[invoice.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {invoices && invoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                          Nenhuma fatura cadastrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TransactionFormDialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} />
      <InvoiceFormDialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Wallet;
  tone: "emerald" | "destructive" | "primary";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-500/15 text-emerald-500"
      : tone === "destructive"
        ? "bg-destructive/15 text-destructive"
        : "bg-primary/15 text-primary";

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(value)}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
