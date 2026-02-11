import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Almacen } from "@/services/AlmacenService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { almacenService } from "@/services/AlmacenService";
import { useAuth } from "@/contexts/AuthContext";

const almacenSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido").max(100),
  codigo: z.string().min(1, "Código es requerido").max(20),
  descripcion: z.string().max(500, "Máximo 500 caracteres").optional(),
  esPrincipal: z.boolean().default(false),
});

type AlmacenFormData = z.infer<typeof almacenSchema>;

interface AlmacenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  almacen: Almacen | null;
}

export function AlmacenDialog({
  open,
  onOpenChange,
  almacen,
}: AlmacenDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session, usuario } = useAuth();

  const form = useForm<AlmacenFormData>({
    resolver: zodResolver(almacenSchema),
    defaultValues: {
      nombre: "",
      codigo: "",
      descripcion: "",
      esPrincipal: false,
    },
  });

  useEffect(() => {
    if (almacen) {
      form.reset({
        nombre: almacen.nombre || "",
        codigo: almacen.codigo || "",
        descripcion: almacen.descripcion || "",
        esPrincipal: almacen.esPrincipal || false,
      });
    } else {
      form.reset({
        nombre: "",
        codigo: "",
        descripcion: "",
        esPrincipal: false,
      });
    }
  }, [almacen, form]);

  const mutation = useMutation({
    mutationFn: async (data: AlmacenFormData) => {
      if (almacen) {
        await almacenService.updateAlmacen(
          almacen.id,
          {
            nombre: data.nombre,
            codigo: data.codigo,
            descripcion: data.descripcion,
            esPrincipal: data.esPrincipal,
          },
          session?.access_token || "",
        );
      } else {
        await almacenService.createAlmacen(
          {
            empresaId: usuario?.EmpresaId || "",
            nombre: data.nombre,
            codigo: data.codigo,
            descripcion: data.descripcion,
            esPrincipal: data.esPrincipal,
          },
          session?.access_token || "",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["almacenes"] });
      onOpenChange(false);
      toast({
        title: almacen ? "Almacén actualizado" : "Almacén creado",
        description: almacen
          ? "El almacén ha sido actualizado exitosamente."
          : "El almacén ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AlmacenFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {almacen ? "Editar almacén" : "Crear almacén"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa el nombre del almacén"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa el código del almacén"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingresa la descripción (máx. 500 caracteres)"
                      {...field}
                      maxLength={500}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/500
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Guardando..."
                  : almacen
                    ? "Actualizar"
                    : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
