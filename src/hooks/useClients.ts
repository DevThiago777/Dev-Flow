import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Client } from "@/lib/types";

export interface ClientInput {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}

export function useClients(search?: string) {
  return useQuery({
    queryKey: ["clients", search],
    queryFn: async () => (await api.get<Client[]>("/clients", { params: { search } })).data,
  });
}

export function useClientMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["clients"] });

  const create = useMutation({
    mutationFn: async (input: ClientInput) => (await api.post<Client>("/clients", input)).data,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ClientInput }) =>
      (await api.put<Client>(`/clients/${id}`, input)).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/clients/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
