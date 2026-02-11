import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Producto } from "@/types/producto";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { productosService } from "@/services/productosService";
import { useAuth } from "@/contexts/AuthContext";

const productSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido").max(100),
  codigoBarras: z.string().max(50).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Producto | null;
  empresaId: string;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  empresaId,
}: ProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: "",
      codigoBarras: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        nombre: product.nombre || "",
        codigoBarras: product.codigoBarra || "",
      });
    } else {
      form.reset({
        nombre: "",
        codigoBarras: "",
      });
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (product) {
        // Actualizar producto existente - por ahora no implementado
        throw new Error("Actualización de productos no implementada");
      } else {
        // Crear nuevo producto usando el método POST /api/productos
        const payload: { nombre: string; codigoBarra: string } = {
          nombre: data.nombre,
          codigoBarra: data.codigoBarras,
        };

        await productosService.createProducto(
          payload,
          session?.access_token || "",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos-count"] });
      toast({ title: product ? "Producto actualizado" : "Producto creado" });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigoBarras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de barras</FormLabel>
                  <FormControl>
                    <Input placeholder="7891234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Guardando..."
                  : product
                    ? "Guardar cambios"
                    : "Crear producto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
