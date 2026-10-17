import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Invoice, InvoiceStatus, Transaction, TransactionType } from "@/lib/types";

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
}

export interface InvoiceInput {
  number: string;
  amount: number;
  status?: InvoiceStatus;
  dueDate: string;
  clientId: string;
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await api.get<Transaction[]>("/finance/transactions")).data,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await api.get<Invoice[]>("/finance/invoices")).data,
  });
}

export function useFinanceMutations() {
  const queryClient = useQueryClient();
  const invalidateTransactions = () => queryClient.invalidateQueries({ queryKey: ["transactions"] });
  const invalidateInvoices = () => queryClient.invalidateQueries({ queryKey: ["invoices"] });

  const createTransaction = useMutation({
    mutationFn: async (input: TransactionInput) =>
      (await api.post<Transaction>("/finance/transactions", input)).data,
    onSuccess: invalidateTransactions,
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => api.delete(`/finance/transactions/${id}`),
    onSuccess: invalidateTransactions,
  });

  const createInvoice = useMutation({
    mutationFn: async (input: InvoiceInput) => (await api.post<Invoice>("/finance/invoices", input)).data,
    onSuccess: invalidateInvoices,
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<InvoiceInput> }) =>
      (await api.put<Invoice>(`/finance/invoices/${id}`, input)).data,
    onSuccess: invalidateInvoices,
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => api.delete(`/finance/invoices/${id}`),
    onSuccess: invalidateInvoices,
  });

  return { createTransaction, deleteTransaction, createInvoice, updateInvoice, deleteInvoice };
}
