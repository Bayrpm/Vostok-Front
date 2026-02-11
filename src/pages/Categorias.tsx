import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { categoriaService } from "@/services/categoriaService";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import type { Categoria } from "@/types/categoria";

export default function Categorias() {
  const { usuario, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(
    null,
  );

  const { data: categorias, isLoading } = useQuery({
    queryKey: ["categorias-full"],
    queryFn: async () => {
      return await categoriaService.getCategorias(
        session?.access_token || "",
        usuario?.EmpresaId,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await categoriaService.deleteCategoria(id, session?.access_token || "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias-full"] });
      queryClient.invalidateQueries({ queryKey: ["categorias-count"] });
      toast({ title: "Categoría eliminada correctamente" });
      setDeleteOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message.includes("productos asociados")
          ? "No se puede eliminar una categoría con productos asociados"
          : error.message,
      });
    },
  });

  const filteredCategories = categorias?.filter(
    (c) => c.Nombre && c.Nombre.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Categorías</h1>
            <p className="text-muted-foreground mt-1">Organiza tus productos</p>
          </div>
          <Button
            onClick={() => {
              setDialogOpen(true);
              setSelectedCategory(null);
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-accent" />
                Listado de categorías
              </CardTitle>
              <div className="relative flex-1 max-w-sm ml-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar categoría..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría padre</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : filteredCategories && filteredCategories.length > 0 ? (
                    filteredCategories.map((categoria) => (
                      <TableRow key={categoria.Id}>
                        <TableCell className="font-medium">
                          {categoria.Nombre}
                        </TableCell>
                        <TableCell>
                          {categoria.CategoriaPadreId ? "Subcategoría" : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDialogOpen(true);
                                setSelectedCategory(categoria);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedCategory(categoria);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron categorías
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        empresaId={usuario ? usuario.EmpresaId : ""}
        categories={categorias || []}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar categoría"
        description={`¿Estás seguro de eliminar "${selectedCategory?.Nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() =>
          selectedCategory && deleteMutation.mutate(selectedCategory.Id)
        }
        loading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
