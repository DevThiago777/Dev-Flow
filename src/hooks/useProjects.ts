import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Project, ProjectStatus } from "@/lib/types";

export interface ProjectInput {
  name: string;
  subtitle?: string;
  budget: number;
  deadline?: string;
  status?: ProjectStatus;
  progressPct?: number;
  clientId?: string | null;
  memberIds?: string[];
}

export function useProjects(params: { status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async () => (await api.get<Project[]>("/projects", { params })).data,
  });
}

export function useProjectMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation({
    mutationFn: async (input: ProjectInput) => (await api.post<Project>("/projects", input)).data,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<ProjectInput> }) =>
      (await api.put<Project>(`/projects/${id}`, input)).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/projects/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
