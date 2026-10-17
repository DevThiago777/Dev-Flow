import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime, initials } from "@/lib/format";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  events: CalendarEvent[];
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const EVENT_ACCENTS = ["border-l-primary", "border-l-emerald-500", "border-l-amber-500"];

export function MiniCalendar({ events }: MiniCalendarProps) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);

  const weekDays = Array.from({ length: 5 }).map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(today);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="capitalize">{monthLabel}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-5 gap-1">
          {weekDays.map((date) => {
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg py-2 text-center",
                  isToday && "bg-primary text-primary-foreground"
                )}
              >
                <span className={cn("text-[10px] uppercase", !isToday && "text-muted-foreground")}>
                  {WEEKDAY_LABELS[date.getDay()]}
                </span>
                <span className="text-sm font-semibold">{date.getDate()}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {events.length === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">Sem eventos para hoje</p>
          )}
          {events.map((event, i) => (
            <div
              key={event.id}
              className={cn(
                "rounded-lg border-l-4 bg-accent/60 p-3",
                EVENT_ACCENTS[i % EVENT_ACCENTS.length]
              )}
            >
              <p className="text-xs text-muted-foreground">
                {formatTime(event.startAt)} - {formatTime(event.endAt)}
              </p>
              <p className="mt-1 text-sm font-medium leading-snug">{event.title}</p>
              <div className="mt-2 flex -space-x-2">
                {event.attendees.map((attendee) => (
                  <Avatar key={attendee.id} className="size-6 border-2 border-card">
                    <AvatarImage src={attendee.avatarUrl ?? undefined} alt={attendee.name} />
                    <AvatarFallback className="text-[10px]">{initials(attendee.name)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
