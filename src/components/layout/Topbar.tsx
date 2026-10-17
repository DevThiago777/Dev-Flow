import { Bell, CalendarClock, ChevronDown, LifeBuoy, LogOut, Search, UserCog } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ProfileEditDialog } from "@/components/layout/ProfileEditDialog";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/hooks/useDashboard";
import { useTickets } from "@/hooks/useSupport";
import { formatTime } from "@/lib/format";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: dashboard } = useDashboard();
  const { data: tickets } = useTickets();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const openTickets = tickets?.filter((t) => t.status !== "closed") ?? [];
  const todayEvents = dashboard?.todayEvents ?? [];
  const notificationCount = openTickets.length + todayEvents.length;

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar..." className="pl-9" />
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground"
            aria-label="Notificações"
          >
            <Bell className="size-5" />
            {notificationCount > 0 && (
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {notificationCount === 0 && (
              <DropdownMenuItem disabled>Nenhuma notificação por aqui</DropdownMenuItem>
            )}

            {todayEvents.map((event) => (
              <DropdownMenuItem key={event.id} onClick={() => navigate("/calendar")} className="items-start gap-2">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{event.title}</span>
                  <span className="text-xs text-muted-foreground">Hoje às {formatTime(event.startAt)}</span>
                </div>
              </DropdownMenuItem>
            ))}

            {openTickets.map((ticket) => (
              <DropdownMenuItem key={ticket.id} onClick={() => navigate("/support")} className="items-start gap-2">
                <LifeBuoy className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{ticket.subject}</span>
                  <span className="text-xs text-muted-foreground">Chamado de suporte</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
            <Avatar className="size-9">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name} />
              <AvatarFallback>{user ? initials(user.name) : "?"}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem disabled className="flex-col items-start gap-0">
              <span className="w-full truncate text-sm font-medium">{user?.name}</span>
              <span className="w-full truncate text-xs text-muted-foreground">{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
              <UserCog className="size-4" />
              Editar perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} variant="destructive">
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileEditDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
    </header>
  );
}
