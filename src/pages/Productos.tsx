import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { productosService } from "@/services/productosService";
import type { Producto } from "@/types/producto";
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
import { ProductDialog } from "@/components/products/ProductDialog";
import { DeleteDialog } from "@/components/common/DeleteDialog";

export default function Productos() {
  const { session, usuario } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: () => productosService.getProductos(session?.access_token || ""),
    enabled: !!session?.access_token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      productosService.deleteProducto({ id: id }, session?.access_token || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setDeleteOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
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
            <h1 className="text-3xl font-bold text-primary">Productos</h1>
            <p className="text-muted-foreground mt-1">Gestiona tu inventario</p>
          </div>
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setDialogOpen(true);
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Listado de productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código de Barras</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : productos && productos.length > 0 ? (
                    productos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">
                          {producto.nombre}
                        </TableCell>
                        <TableCell className="text-right">
                          {producto.codigoBarra}
                        </TableCell>
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
                        colSpan={2}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        empresaId={usuario?.EmpresaId || ""}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar producto"
        description={`¿Estás seguro de que quieres eliminar el producto "${selectedProduct?.nombre}"? Esta acción no se puede deshacer.`}
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
