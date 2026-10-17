import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Moon,
  Sun,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projetos", icon: FolderKanban },
  { to: "/calendar", label: "Calendário", icon: CalendarDays },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/finance", label: "Financeiro", icon: Wallet },
  { to: "/support", label: "Suporte", icon: LifeBuoy },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
      <Link to="/" className="flex items-center gap-2 px-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="size-4" />
        </span>
        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">DEVThiago</span>
      </Link>

      <div className="mt-8 flex-1">
        <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Main Menu</p>
        <nav className="mt-2 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-sidebar-border px-3 py-2">
        <span className="text-sm text-muted-foreground">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-7 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
      </div>
    </aside>
  );
}
