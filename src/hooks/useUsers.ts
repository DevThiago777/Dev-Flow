import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProjectMemberRef } from "@/lib/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get<ProjectMemberRef[]>("/users")).data,
  });
}
