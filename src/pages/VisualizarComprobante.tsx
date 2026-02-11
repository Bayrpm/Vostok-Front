import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { comprobanteService } from "@/services/comprobanteService";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ComprobanteDetalle = {
  id?: string;
  productoEmpresaNombre?: string;
  cantidad?: number;
  almacenOrigenNombre?: string;
  almacenDestinoNombre?: string;
};

type ComprobanteData = {
  id?: string;
  numero?: string;
  fecha?: string;
  tipoComprobanteNombre?: string;
  tipoComprobanteCodigo?: number;
  estadoComprobanteNombre?: string;
  estadoComprobanteCodigo?: number;
  observacion?: string;
  detalles?: ComprobanteDetalle[];
};

export default function VisualizarComprobante() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [comprobante, setComprobante] = useState<ComprobanteData | null>(null);

  // Buscar comprobante
  const buscarMutation = useMutation({
    mutationFn: (numero: string) =>
      comprobanteService.getComprobanteByNumero(
        numero,
        session?.access_token || "",
      ),
    onSuccess: (data) => {
      // Mapear respuesta del backend a nuestro tipo local
      const mappedData: ComprobanteData = {
        id: (data.Id || data.id) as string,
        numero: (data.Numero || data.numero) as string,
        fecha: (data.Fecha || data.fecha) as string,
        tipoComprobanteNombre: (data.TipoComprobanteNombre ||
          data.tipoComprobanteNombre) as string,
        tipoComprobanteCodigo: (data.TipoComprobanteCodigo ||
          data.tipoComprobanteCodigo) as number,
        estadoComprobanteNombre: (data.EstadoComprobanteNombre ||
          data.estadoComprobanteNombre) as string,
        estadoComprobanteCodigo: (data.EstadoComprobanteCodigo ||
          data.estadoComprobanteCodigo) as number,
        observacion: (data.Observacion || data.observacion) as string,
        detalles: (
          (data.Detalles || data.detalles || []) as Record<string, unknown>[]
        ).map((det) => ({
          id: (det.Id || det.id) as string,
          productoEmpresaNombre: (det.ProductoEmpresaNombre ||
            det.productoEmpresaNombre ||
            det.productoNombre) as string,
          cantidad: (det.Cantidad || det.cantidad) as number,
          almacenOrigenNombre: (det.AlmacenOrigenNombre ||
            det.almacenOrigenNombre) as string,
          almacenDestinoNombre: (det.AlmacenDestinoNombre ||
            det.almacenDestinoNombre) as string,
        })),
      };
      setComprobante(mappedData);
      toast({
        title: "Comprobante encontrado",
        description: `Comprobante ${mappedData.numero} cargado exitosamente.`,
      });
    },
    onError: (error) => {
      setComprobante(null);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Confirmar comprobante
  const confirmarMutation = useMutation({
    mutationFn: (id: string) =>
      comprobanteService.confirmarComprobante(id, session?.access_token || ""),
    onSuccess: () => {
      toast({
        title: "Comprobante confirmado",
        description:
          "El comprobante ha sido validado y confirmado exitosamente.",
      });
      // Recargar el comprobante para actualizar el estado
      if (comprobante?.numero) {
        buscarMutation.mutate(comprobante.numero);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBuscar = () => {
    if (!numeroComprobante.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de comprobante.",
        variant: "destructive",
      });
      return;
    }
    buscarMutation.mutate(numeroComprobante.trim());
  };

  const handleConfirmar = () => {
    if (!comprobante?.id) return;
    confirmarMutation.mutate(comprobante.id);
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const esBorrador = comprobante?.estadoComprobanteCodigo === 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Visualizar Comprobante
          </h1>
          <p className="text-muted-foreground mt-1">
            Busca y visualiza comprobantes por su número
          </p>
        </div>

        {/* SECCIÓN DE BÚSQUEDA */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Comprobante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="numeroComprobante">Número de Comprobante</Label>
                <Input
                  id="numeroComprobante"
                  placeholder="Ingresa el número del comprobante"
                  value={numeroComprobante}
                  onChange={(e) => setNumeroComprobante(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleBuscar();
                    }
                  }}
                  disabled={buscarMutation.isPending}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleBuscar}
                  disabled={buscarMutation.isPending}
                  className="gap-2"
                >
                  {buscarMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INFORMACIÓN DEL COMPROBANTE */}
        {comprobante && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Información del Comprobante</CardTitle>
                  <Badge
                    variant={esBorrador ? "secondary" : "default"}
                    className="px-3 py-1"
                  >
                    {comprobante.estadoComprobanteNombre || "Sin Estado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Tipo de Comprobante
                    </Label>
                    <p className="text-lg font-medium">
                      {comprobante.tipoComprobanteNombre || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Número</Label>
                    <p className="text-lg font-medium">
                      {comprobante.numero || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha</Label>
                    <p className="text-lg font-medium">
                      {formatFecha(comprobante.fecha)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <p className="text-lg font-medium">
                      {comprobante.estadoComprobanteNombre || "-"}
                    </p>
                  </div>
                  {comprobante.observacion && (
                    <div className="md:col-span-2">
                      <Label className="text-muted-foreground">
                        Observación
                      </Label>
                      <p className="text-lg font-medium">
                        {comprobante.observacion}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* DETALLES DEL COMPROBANTE */}
            <Card>
              <CardHeader>
                <CardTitle>Detalle del Comprobante</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead>Almacén Origen</TableHead>
                      <TableHead>Almacén Destino</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprobante.detalles && comprobante.detalles.length > 0 ? (
                      comprobante.detalles.map((detalle, index) => (
                        <TableRow key={detalle.id || index}>
                          <TableCell className="font-medium">
                            {detalle.productoEmpresaNombre || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {detalle.cantidad || 0}
                          </TableCell>
                          <TableCell>
                            {detalle.almacenOrigenNombre || "-"}
                          </TableCell>
                          <TableCell>
                            {detalle.almacenDestinoNombre || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No hay detalles disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* ACCIONES */}
            {esBorrador && (
              <div className="flex justify-end gap-3">
                <Button
                  onClick={handleConfirmar}
                  disabled={confirmarMutation.isPending}
                  className="gap-2"
                >
                  {confirmarMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Validar y Confirmar
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
