import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ProductoEmpresa,
  CreateProductoEmpresaPayload,
  UpdateProductoEmpresaPayload,
} from "@/types/productoEmpresa";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { productosEmpresaService } from "@/services/productosEmpresaService";
import { productosService } from "@/services/productosService";
import { categoriaService } from "@/services/categoriaService";
import { useAuth } from "@/contexts/AuthContext";
import type { Producto } from "@/types/producto";
import type { Categoria } from "@/types/categoria";

const productEmpresaSchema = z.object({
  productoId: z.string().min(1, "Producto es requerido"),
  categoriaId: z.string().min(1, "Categoría es requerida"),
  sku: z.string().min(1, "SKU es requerido"),
  precio: z.number().min(0, "Precio debe ser mayor o igual a 0"),
});

type ProductEmpresaFormData = z.infer<typeof productEmpresaSchema>;

interface ProductoEmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductoEmpresa | null;
}

export function ProductoEmpresaDialog({
  open,
  onOpenChange,
  product,
}: ProductoEmpresaDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session, usuario } = useAuth();

  const form = useForm<ProductEmpresaFormData>({
    resolver: zodResolver(productEmpresaSchema),
    defaultValues: {
      productoId: "",
      categoriaId: "",
      sku: "",
      precio: 0,
    },
  });

  const { data: productos = [] } = useQuery({
    queryKey: ["productos"],
    queryFn: () => productosService.getProductos(session?.access_token || ""),
    enabled: !!session?.access_token,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () =>
      categoriaService.getCategorias(
        session?.access_token || "",
        usuario?.EmpresaId,
      ),
    enabled: !!session?.access_token,
  });

  useEffect(() => {
    if (product) {
      form.reset({
        productoId: product.productoId || "",
        categoriaId: product.categoriaId || "",
        sku: product.sku || "",
        precio: product.precio || 0,
      });
    } else {
      form.reset({
        productoId: "",
        categoriaId: "",
        sku: "",
        precio: 0,
      });
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProductEmpresaFormData) => {
      if (product) {
        const payload: UpdateProductoEmpresaPayload = {
          id: product.id,
          categoriaId: data.categoriaId,
          sku: data.sku,
          precio: data.precio,
        };
        await productosEmpresaService.updateProductoEmpresa(
          payload,
          session?.access_token || "",
        );
      } else {
        const payload: CreateProductoEmpresaPayload = {
          productoId: data.productoId,
          categoriaId: data.categoriaId,
          sku: data.sku,
          precio: data.precio,
        };
        await productosEmpresaService.createProducto(
          payload,
          session?.access_token || "",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productosEmpresa"] });
      onOpenChange(false);
      toast({
        title: product ? "Producto actualizado" : "Producto creado",
        description: product
          ? "El producto de empresa ha sido actualizado exitosamente."
          : "El producto de empresa ha sido creado exitosamente.",
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

  const onSubmit = (data: ProductEmpresaFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {product
              ? "Editar producto de empresa"
              : "Crear producto de empresa"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productos.map((prod: Producto) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((cat: Categoria) => (
                        <SelectItem key={cat.Id} value={cat.Id}>
                          {cat.Nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa el SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="precio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
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
                  : product
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
