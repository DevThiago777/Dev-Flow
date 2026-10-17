import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CalendarEvent } from "@/lib/types";

export interface CalendarEventInput {
  title: string;
  startAt: string;
  endAt: string;
  attendeeIds?: string[];
}

export function useCalendarEvents(range: { from: string; to: string }) {
  return useQuery({
    queryKey: ["calendar-events", range],
    queryFn: async () =>
      (await api.get<CalendarEvent[]>("/calendar/events", { params: range })).data,
  });
}

export function useCalendarEventMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation({
    mutationFn: async (input: CalendarEventInput) =>
      (await api.post<CalendarEvent>("/calendar/events", input)).data,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<CalendarEventInput> }) =>
      (await api.put<CalendarEvent>(`/calendar/events/${id}`, input)).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/calendar/events/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
