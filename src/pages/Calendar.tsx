import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventFormDialog } from "@/components/calendar/EventFormDialog";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { formatTime } from "@/lib/format";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }).map((_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return date;
  });
}

export function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const range = useMemo(
    () => ({ from: days[0].toISOString(), to: days[days.length - 1].toISOString() }),
    [days]
  );

  const { data: events } = useCalendarEvents(range);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events ?? []) {
      const key = new Date(event.startAt).toDateString();
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  const today = new Date();
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(cursor);

  function changeMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  function openCreate(date: Date) {
    setEditingEvent(null);
    setDefaultDate(date);
    setDialogOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    setEditingEvent(event);
    setDefaultDate(undefined);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
          <p className="text-sm text-muted-foreground">Organize reuniões e compromissos da equipe</p>
        </div>
        <Button onClick={() => openCreate(today)}>
          <Plus className="size-4" />
          Novo evento
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-xs">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="bg-card py-2 text-center font-medium text-muted-foreground">
                {label}
              </div>
            ))}

            {days.map((date) => {
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === today.toDateString();
              const dayEvents = eventsByDay.get(date.toDateString()) ?? [];

              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() => openCreate(date)}
                  className={cn(
                    "flex min-h-24 flex-col items-start gap-1 bg-card p-2 text-left align-top transition-colors hover:bg-accent/60",
                    !isCurrentMonth && "opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {date.getDate()}
                  </span>

                  <div className="flex w-full flex-col gap-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <span
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(event);
                        }}
                        className="truncate rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/25"
                      >
                        {formatTime(event.startAt)} {event.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} mais</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        defaultDate={defaultDate}
      />
    </div>
  );
}
