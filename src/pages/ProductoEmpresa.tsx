import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { productosEmpresaService } from "@/services/productosEmpresaService";
import type { ProductoEmpresa } from "@/types/productoEmpresa";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductoEmpresaDialog } from "@/components/products/ProductoEmpresaDialog";
import { DeleteDialog } from "@/components/common/DeleteDialog";

export default function ProductoEmpresa() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductoEmpresa | null>(null);

  const { data: productosEmpresa = [], isLoading } = useQuery({
    queryKey: ["productosEmpresa"],
    queryFn: () =>
      productosEmpresaService.getProductosEmpresa(session?.access_token || ""),
    enabled: !!session?.access_token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      productosEmpresaService.deleteProductoEmpresa(
        { id },
        session?.access_token || "",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productosEmpresa"] });
      setDeleteOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Producto eliminado",
        description: "El producto de empresa ha sido eliminado exitosamente.",
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Productos de Empresa
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus productos de empresa
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setDialogOpen(true);
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto de empresa
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Listado de productos de empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : productosEmpresa && productosEmpresa.length > 0 ? (
                    productosEmpresa.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">
                          {producto.productoNombre}
                        </TableCell>
                        <TableCell>{producto.categoriaNombre}</TableCell>
                        <TableCell>{producto.sku}</TableCell>
                        <TableCell>
                          ${producto.precio.toLocaleString()}
                        </TableCell>
                        <TableCell>{producto.activo ? "Sí" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedProduct(producto);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedProduct(producto);
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
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron productos de empresa
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProductoEmpresaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar producto de empresa"
        description={`¿Estás seguro de que quieres eliminar el producto "${selectedProduct?.productoNombre}" con SKU "${selectedProduct?.sku}"? Esta acción no se puede deshacer.`}
        onConfirm={() => {
          if (selectedProduct) {
            deleteMutation.mutate(selectedProduct.id);
          }
        }}
        loading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
