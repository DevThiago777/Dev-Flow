import { MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { useClientMutations, useClients } from "@/hooks/useClients";
import { initials } from "@/lib/format";
import type { Client } from "@/lib/types";

export function Clients() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useClients(search);
  const { remove } = useClientMutations();

  function openCreate() {
    setEditingClient(null);
    setDialogOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setDialogOpen(true);
  }

  async function handleDelete(client: Client) {
    try {
      await remove.mutateAsync(client.id);
      toast.success("Cliente removido");
    } catch {
      toast.error("Não foi possível remover o cliente");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie os clientes da sua empresa</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Novo cliente
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Nome</th>
                  <th className="py-2 pr-4 font-medium">Empresa</th>
                  <th className="py-2 pr-4 font-medium">Contato</th>
                  <th className="py-2 pr-4 font-medium">Projetos</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {clients?.map((client) => (
                  <tr key={client.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={client.avatarUrl ?? undefined} alt={client.name} />
                          <AvatarFallback className="text-xs">{initials(client.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{client.company ?? "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      <div className="flex flex-col">
                        <span>{client.email ?? "—"}</span>
                        <span className="text-xs">{client.phone ?? ""}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{client._count?.projects ?? 0}</td>
                    <td className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(client)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(client)}>
                            <Trash2 className="size-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {clients && clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} client={editingClient} />
    </div>
  );
}
