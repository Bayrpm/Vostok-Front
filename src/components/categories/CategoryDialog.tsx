import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { categoriaService } from "@/services/categoriaService";
import type { Categoria } from "@/types/categoria";
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

const categorySchema = z.object({
  Nombre: z.string().min(1, "Nombre es requerido").max(100),
  CategoriaPadreId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Categoria | null;
  empresaId: string;
  categories: Categoria[];
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  empresaId,
  categories,
}: CategoryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const [currentCategory, setCurrentCategory] = useState<Categoria | null>(
    category,
  );

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      Nombre: "",
      CategoriaPadreId: "",
    },
  });

  useEffect(() => {
    setCurrentCategory(category);
  }, [category]);

  useEffect(() => {
    if (currentCategory) {
      form.reset({
        Nombre: currentCategory.Nombre,
        CategoriaPadreId: currentCategory.CategoriaPadreId || "none",
      });
    } else {
      form.reset({
        Nombre: "",
        CategoriaPadreId: "none",
      });
    }
  }, [currentCategory, form]);

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const payload = {
        Nombre: data.Nombre,
        CategoriaPadreId:
          data.CategoriaPadreId === "none" ? null : data.CategoriaPadreId,
        EmpresaId: empresaId,
      };

      if (currentCategory) {
        await categoriaService.updateCategoria(
          currentCategory.Id,
          payload,
          session?.access_token || "",
        );
      } else {
        await categoriaService.createCategoria(
          payload,
          session?.access_token || "",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias-full"] });
      queryClient.invalidateQueries({ queryKey: ["categorias-count"] });
      toast({
        title: currentCategory ? "Categoría actualizada" : "Categoría creada",
      });
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

  const onSubmit = (data: CategoryFormData) => {
    mutation.mutate(data);
  };

  const availableCategories = categories.filter(
    (c) => c.Id !== currentCategory?.Id,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentCategory ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="Nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la categoría" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="CategoriaPadreId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría padre (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin categoría padre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría padre</SelectItem>
                      {availableCategories.map((cat) => (
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
                  : category
                    ? "Guardar cambios"
                    : "Crear categoría"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
