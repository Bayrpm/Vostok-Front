import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { almacenService } from "@/services/AlmacenService";
import type { Almacen } from "@/services/AlmacenService";
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
import { Plus, Pencil, Trash2, Warehouse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlmacenDialog } from "@/components/almacenes/AlmacenDialog";
import { DeleteDialog } from "@/components/common/DeleteDialog";

export default function Almacenes() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAlmacen, setSelectedAlmacen] = useState<Almacen | null>(null);

  const { data: almacenes = [], isLoading } = useQuery({
    queryKey: ["almacenes"],
    queryFn: () => almacenService.getAlmacenes(session?.access_token || ""),
    enabled: !!session?.access_token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      almacenService.deleteAlmacen({ id }, session?.access_token || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["almacenes"] });
      setDeleteOpen(false);
      setSelectedAlmacen(null);
      toast({
        title: "Almacén eliminado",
        description: "El almacén ha sido eliminado exitosamente.",
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
            <h1 className="text-3xl font-bold text-primary">Almacenes</h1>
            <p className="text-muted-foreground mt-1">Gestiona tus almacenes</p>
          </div>
          <Button
            onClick={() => {
              setSelectedAlmacen(null);
              setDialogOpen(true);
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo almacén
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-accent" />
              Listado de almacenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Estado</TableHead>
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
                  ) : almacenes && almacenes.length > 0 ? (
                    almacenes.map((almacen) => (
                      <TableRow key={almacen.id}>
                        <TableCell className="font-medium">
                          {almacen.nombre}
                        </TableCell>
                        <TableCell>{almacen.codigo}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {almacen.descripcion || "-"}
                        </TableCell>
                        <TableCell>
                          {almacen.esPrincipal ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                              Sí
                            </span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {almacen.activo ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                              Inactivo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedAlmacen(almacen);
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
                                setSelectedAlmacen(almacen);
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
                        No se encontraron almacenes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlmacenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        almacen={selectedAlmacen}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar almacén"
        description={`¿Estás seguro de que quieres eliminar el almacén "${selectedAlmacen?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => {
          if (selectedAlmacen) {
            deleteMutation.mutate(selectedAlmacen.id);
          }
        }}
        loading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
