import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { initials } from "@/lib/format";
import type { PublicUser } from "@/lib/types";

const schema = z
  .object({
    name: z.string().min(1, "Informe o nome"),
    email: z.string().email("E-mail inválido"),
    avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().optional().or(z.literal("")),
  })
  .refine((data) => !data.newPassword || data.newPassword.length >= 6, {
    message: "A nova senha deve ter ao menos 6 caracteres",
    path: ["newPassword"],
  })
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: "Informe a senha atual para defini-la novamente",
    path: ["currentPassword"],
  });

type FormValues = z.infer<typeof schema>;

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { user, updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [open, user, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const res = await api.put<{ user: PublicUser }>("/auth/me", {
        name: values.name,
        email: values.email,
        avatarUrl: values.avatarUrl || "",
        currentPassword: values.currentPassword || undefined,
        newPassword: values.newPassword || undefined,
      });
      updateUser(res.data.user);
      toast.success("Perfil atualizado");
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Não foi possível atualizar o perfil";
      toast.error(message);
    }
  }

  const previewUrl = watch("avatarUrl");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-3">
            <Avatar className="size-14">
              <AvatarImage src={previewUrl || undefined} alt={user?.name} />
              <AvatarFallback>{user ? initials(user.name) : "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatarUrl">URL da foto</Label>
              <Input id="avatarUrl" placeholder="https://..." {...register("avatarUrl")} className="mt-1" />
              {errors.avatarUrl && <p className="mt-1 text-xs text-destructive">{errors.avatarUrl.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">Preencha os campos abaixo apenas para alterar sua senha</p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input id="currentPassword" type="password" {...register("currentPassword")} />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
