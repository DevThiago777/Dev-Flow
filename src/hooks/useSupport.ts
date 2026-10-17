import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SupportTicket, TicketPriority, TicketStatus } from "@/lib/types";

export interface TicketInput {
  subject: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export function useTickets() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => (await api.get<SupportTicket[]>("/support/tickets")).data,
  });
}

export function useTicketMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tickets"] });

  const create = useMutation({
    mutationFn: async (input: TicketInput) => (await api.post<SupportTicket>("/support/tickets", input)).data,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<TicketInput> }) =>
      (await api.put<SupportTicket>(`/support/tickets/${id}`, input)).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/support/tickets/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
