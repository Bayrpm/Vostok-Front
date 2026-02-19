import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { comprobanteService } from "@/services/comprobanteService";
import { tipoComprobanteService } from "@/services/tipoComprobanteService";
import { almacenService } from "@/services/AlmacenService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle,
  Loader2,
  Eye,
  Edit,
  XCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ComprobanteDetalle = {
  id?: string;
  productoEmpresaNombre?: string;
  cantidad?: number;
  costoUnitario?: number;
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
  totalDetalles?: number;
  creadoPorNombre?: string;
  creadoEn?: string;
  detalles?: ComprobanteDetalle[];
  contraDeId?: string;
  almacenes?: { id: string; nombre: string }[];
};

type TipoComprobante = {
  id: string;
  codigo: number;
  nombre: string;
  afectaStock: boolean;
};

type Almacen = {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  esPrincipal: boolean;
  activo: boolean;
  fechaCreacion: string;
};

// Estados de comprobante
const ESTADO_BORRADOR = 1;
const ESTADO_CONFIRMADO = 2;
const ESTADO_ANULADO = 3;

export default function VisualizarComprobante() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para filtros
  const [filtroNumero, setFiltroNumero] = useState("");
  const [filtroTipoComprobante, setFiltroTipoComprobante] =
    useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroAlmacen, setFiltroAlmacen] = useState<string>("todos");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<Date | undefined>();
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<Date | undefined>();

  // Estados para diálogo de detalle
  const [comprobanteDetalle, setComprobanteDetalle] =
    useState<ComprobanteData | null>(null);
  const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false);

  // Obtener comprobantes
  const { data: comprobantesData = [], isLoading: isLoadingComprobantes } =
    useQuery({
      queryKey: ["comprobantes"],
      queryFn: () =>
        comprobanteService.getComprobantes(session?.access_token || ""),
      enabled: !!session?.access_token,
    });

  // Obtener tipos de comprobante
  const { data: tiposComprobante = [] } = useQuery({
    queryKey: ["tipos-comprobante"],
    queryFn: () =>
      tipoComprobanteService.getTiposComprobantes(session?.access_token || ""),
    enabled: !!session?.access_token,
  });

  // Obtener almacenes
  const { data: almacenes = [] } = useQuery({
    queryKey: ["almacenes"],
    queryFn: () => almacenService.getAlmacenes(session?.access_token || ""),
    enabled: !!session?.access_token,
  });

  // Confirmar comprobante
  const confirmarMutation = useMutation({
    mutationFn: (id: string) =>
      comprobanteService.confirmarComprobante(id, session?.access_token || ""),
    onSuccess: () => {
      toast({
        title: "Comprobante confirmado",
        description: "El comprobante ha sido confirmado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["comprobantes"] });
      setDialogDetalleOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Anular comprobante
  const anularMutation = useMutation({
    mutationFn: (id: string) =>
      comprobanteService.anularComprobante(id, session?.access_token || ""),
    onSuccess: () => {
      toast({
        title: "Comprobante anulado",
        description: "El comprobante ha sido anulado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["comprobantes"] });
      setDialogDetalleOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mapear datos de comprobantes
  const comprobantes: ComprobanteData[] = (
    comprobantesData as Record<string, unknown>[]
  ).map((comp) => ({
    id: (comp.id ?? comp.Id) as string,
    numero: (comp.numero ?? comp.Numero) as string,
    fecha: (comp.fecha ?? comp.Fecha) as string,
    tipoComprobanteNombre: (comp.tipoComprobanteNombre ??
      comp.TipoComprobanteNombre) as string,
    tipoComprobanteCodigo: (comp.tipoComprobanteCodigo ??
      comp.TipoComprobanteCodigo) as number,
    estadoComprobanteNombre: (comp.estadoComprobanteNombre ??
      comp.EstadoComprobanteNombre) as string,
    estadoComprobanteCodigo: (comp.estadoComprobanteCodigo ??
      comp.EstadoComprobanteCodigo) as number,
    observacion: (comp.observacion ?? comp.Observacion) as string,
    totalDetalles: (comp.totalDetalles ?? comp.TotalDetalles) as number,
    creadoPorNombre: (comp.creadoPorNombre ?? comp.CreadoPorNombre) as string,
    creadoEn: (comp.creadoEn ?? comp.CreadoEn) as string,
    contraDeId: (comp.contraDeId ?? comp.ContraDeId) as string | undefined,
    almacenes: (comp.almacenes ?? comp.Almacenes) as
      | { id: string; nombre: string }[]
      | undefined,
  }));

  // Ordenar por número de mayor a menor (asumiendo que el número es numérico, si no, se puede ajustar)
  const comprobantesOrdenados = [...comprobantes].sort((a, b) => {
    if (!a.numero) return 1;
    if (!b.numero) return -1;
    const numA = Number(a.numero);
    const numB = Number(b.numero);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numB - numA;
    }
    return b.numero.localeCompare(a.numero);
  });

  // Aplicar filtros
  const comprobantesFiltrados = comprobantesOrdenados.filter((comp) => {
    // Filtro por número
    if (
      filtroNumero &&
      !comp.numero?.toLowerCase().includes(filtroNumero.toLowerCase())
    ) {
      return false;
    }

    // Filtro por tipo de comprobante
    if (
      filtroTipoComprobante !== "todos" &&
      String(comp.tipoComprobanteCodigo) !== filtroTipoComprobante
    ) {
      return false;
    }

    // Filtro por estado
    if (
      filtroEstado !== "todos" &&
      String(comp.estadoComprobanteCodigo) !== filtroEstado
    ) {
      return false;
    }

    // Filtro por rango de fechas
    if (filtroFechaDesde || filtroFechaHasta) {
      const fechaComp = comp.fecha ? new Date(comp.fecha) : null;
      if (!fechaComp) return false;

      if (filtroFechaDesde && fechaComp < filtroFechaDesde) {
        return false;
      }

      if (filtroFechaHasta) {
        const fechaHastaFin = new Date(filtroFechaHasta);
        fechaHastaFin.setHours(23, 59, 59, 999);
        if (fechaComp > fechaHastaFin) {
          return false;
        }
      }
    }

    // Filtro por almacén
    if (
      filtroAlmacen !== "todos" &&
      (!comp.almacenes ||
        !comp.almacenes.some((almacen) => almacen.id === filtroAlmacen))
    ) {
      return false;
    }

    return true;
  });

  const handleVerDetalle = async (comp: ComprobanteData) => {
    try {
      // Obtener el comprobante completo con detalles
      const data = await comprobanteService.getComprobante(
        comp.id!,
        session?.access_token || "",
      );

      const mappedData: ComprobanteData = {
        id: (data.Id ?? data.id) as string,
        numero: (data.Numero ?? data.numero) as string,
        fecha: (data.Fecha ?? data.fecha) as string,
        tipoComprobanteNombre: (data.TipoComprobanteNombre ??
          data.tipoComprobanteNombre) as string,
        tipoComprobanteCodigo: (data.TipoComprobanteCodigo ??
          data.tipoComprobanteCodigo) as number,
        estadoComprobanteNombre: (data.EstadoComprobanteNombre ??
          data.estadoComprobanteNombre) as string,
        estadoComprobanteCodigo: (data.EstadoComprobanteCodigo ??
          data.estadoComprobanteCodigo) as number,
        observacion: (data.Observacion ?? data.observacion) as string,
        detalles: (
          (data.Detalles ?? data.detalles ?? []) as Record<string, unknown>[]
        ).map((det) => ({
          id: (det.Id ?? det.id) as string,
          productoEmpresaNombre: (det.ProductoEmpresaNombre ??
            det.productoEmpresaNombre ??
            det.productoNombre) as string,
          cantidad: (det.Cantidad ?? det.cantidad) as number,
          costoUnitario: (det.CostoUnitario ?? det.costoUnitario) as number,
          almacenOrigenNombre: (det.AlmacenOrigenNombre ??
            det.almacenOrigenNombre) as string,
          almacenDestinoNombre: (det.AlmacenDestinoNombre ??
            det.almacenDestinoNombre) as string,
        })),
        contraDeId: (data.ContraDeId ?? data.contraDeId) as string | undefined,
      };

      setComprobanteDetalle(mappedData);
      setDialogDetalleOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al cargar el detalle",
        variant: "destructive",
      });
    }
  };

  const handleEditar = (comp: ComprobanteData) => {
    // TODO: Navegar a la página de edición
    toast({
      title: "Función en desarrollo",
      description: "La edición de comprobantes estará disponible próximamente.",
    });
  };

  const handleConfirmarDirecto = (id: string) => {
    confirmarMutation.mutate(id);
  };

  const handleAnular = (id: string) => {
    anularMutation.mutate(id);
  };

  const limpiarFiltros = () => {
    setFiltroNumero("");
    setFiltroTipoComprobante("todos");
    setFiltroEstado("todos");
    setFiltroAlmacen("todos");
    setFiltroFechaDesde(undefined);
    setFiltroFechaHasta(undefined);
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getEstadoBadgeVariant = (estadoCodigo?: number) => {
    switch (estadoCodigo) {
      case ESTADO_BORRADOR:
        return "secondary" as const;
      case ESTADO_CONFIRMADO:
        return "default" as const;
      case ESTADO_ANULADO:
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Comprobantes</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza y gestiona todos los comprobantes del sistema
          </p>
        </div>

        {/* SECCIÓN DE FILTROS */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primera fila: Búsqueda rápida y selectores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por número */}
              <div className="space-y-2">
                <Label htmlFor="filtroNumero" className="text-sm font-medium">
                  Número de Comprobante
                </Label>
                <Input
                  id="filtroNumero"
                  placeholder="Ej: 123"
                  value={filtroNumero}
                  onChange={(e) => setFiltroNumero(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Filtro por tipo de comprobante */}
              <div className="space-y-2">
                <Label htmlFor="filtroTipo" className="text-sm font-medium">
                  Tipo de Comprobante
                </Label>
                <Select
                  value={filtroTipoComprobante}
                  onValueChange={setFiltroTipoComprobante}
                >
                  <SelectTrigger id="filtroTipo" className="h-10">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    {tiposComprobante.map((tipo: TipoComprobante) => (
                      <SelectItem
                        key={tipo.codigo}
                        value={tipo.codigo.toString()}
                      >
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por estado */}
              <div className="space-y-2">
                <Label htmlFor="filtroEstado" className="text-sm font-medium">
                  Estado
                </Label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger id="filtroEstado" className="h-10">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="1">Borrador</SelectItem>
                    <SelectItem value="2">Confirmado</SelectItem>
                    <SelectItem value="3">Anulado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por almacén */}
              <div className="space-y-2">
                <Label htmlFor="filtroAlmacen" className="text-sm font-medium">
                  Almacén
                </Label>
                <Select value={filtroAlmacen} onValueChange={setFiltroAlmacen}>
                  <SelectTrigger id="filtroAlmacen" className="h-10">
                    <SelectValue placeholder="Seleccionar almacén" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los almacenes</SelectItem>
                    {almacenes.map((almacen) => (
                      <SelectItem key={almacen.id} value={almacen.id}>
                        {almacen.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Segunda fila: Rango de fechas y acciones */}
            <div className="flex flex-col sm:flex-row gap-4 items-end pt-2 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Filtro fecha desde */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fecha Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !filtroFechaDesde && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtroFechaDesde ? (
                          format(filtroFechaDesde, "dd/MM/yyyy", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filtroFechaDesde}
                        onSelect={setFiltroFechaDesde}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Filtro fecha hasta */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fecha Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !filtroFechaHasta && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtroFechaHasta ? (
                          format(filtroFechaHasta, "dd/MM/yyyy", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filtroFechaHasta}
                        onSelect={setFiltroFechaHasta}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Botón limpiar filtros */}
              <Button
                variant="outline"
                onClick={limpiarFiltros}
                className="w-full sm:w-auto h-10 gap-2 border-dashed"
              >
                <XCircle className="h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TABLA DE COMPROBANTES */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Listado de Comprobantes</CardTitle>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {comprobantesFiltrados.length}{" "}
                {comprobantesFiltrados.length === 1 ? "registro" : "registros"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingComprobantes ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : comprobantesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron comprobantes
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprobantesFiltrados.map((comp) => (
                      <TableRow key={comp.id}>
                        <TableCell className="font-medium">
                          {comp.numero}
                        </TableCell>
                        <TableCell>{formatFecha(comp.fecha)}</TableCell>
                        <TableCell>{comp.tipoComprobanteNombre}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getEstadoBadgeVariant(
                              comp.estadoComprobanteCodigo,
                            )}
                          >
                            {comp.estadoComprobanteNombre}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Ver */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerDetalle(comp)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>

                            {/* Editar (solo borrador) */}
                            {comp.estadoComprobanteCodigo ===
                              ESTADO_BORRADOR && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditar(comp)}
                                className="gap-1"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </Button>
                            )}

                            {/* Confirmar (solo borrador) */}
                            {comp.estadoComprobanteCodigo ===
                              ESTADO_BORRADOR && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleConfirmarDirecto(comp.id!)}
                                disabled={confirmarMutation.isPending}
                                className="gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Confirmar
                              </Button>
                            )}

                            {/* Anular (solo confirmado) */}
                            {comp.estadoComprobanteCodigo ===
                              ESTADO_CONFIRMADO && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAnular(comp.id!)}
                                disabled={
                                  anularMutation.isPending || !!comp.contraDeId
                                }
                                className="gap-1"
                                title={
                                  comp.contraDeId
                                    ? "No se puede anular un contra comprobante"
                                    : undefined
                                }
                              >
                                <XCircle className="h-4 w-4" />
                                Anular
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DIÁLOGO DE DETALLE */}
      <Dialog open={dialogDetalleOpen} onOpenChange={setDialogDetalleOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Comprobante</DialogTitle>
            <DialogDescription>
              Información completa del comprobante {comprobanteDetalle?.numero}
            </DialogDescription>
          </DialogHeader>

          {comprobanteDetalle && (
            <div className="space-y-4">
              {/* Información general */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Información General
                    </CardTitle>
                    <Badge
                      variant={getEstadoBadgeVariant(
                        comprobanteDetalle.estadoComprobanteCodigo,
                      )}
                    >
                      {comprobanteDetalle.estadoComprobanteNombre}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Tipo de Comprobante
                      </Label>
                      <p className="font-medium">
                        {comprobanteDetalle.tipoComprobanteNombre || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Número</Label>
                      <p className="font-medium">
                        {comprobanteDetalle.numero || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Fecha</Label>
                      <p className="font-medium">
                        {formatFecha(comprobanteDetalle.fecha)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estado</Label>
                      <p className="font-medium">
                        {comprobanteDetalle.estadoComprobanteNombre || "-"}
                      </p>
                    </div>
                    {comprobanteDetalle.observacion && (
                      <div className="md:col-span-2">
                        <Label className="text-muted-foreground">
                          Observación
                        </Label>
                        <p className="font-medium">
                          {comprobanteDetalle.observacion}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Detalles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">
                          Costo Unitario
                        </TableHead>
                        <TableHead>Almacén Origen</TableHead>
                        <TableHead>Almacén Destino</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comprobanteDetalle.detalles &&
                      comprobanteDetalle.detalles.length > 0 ? (
                        comprobanteDetalle.detalles.map((detalle, index) => (
                          <TableRow key={detalle.id || index}>
                            <TableCell className="font-medium">
                              {detalle.productoEmpresaNombre || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {detalle.cantidad || 0}
                            </TableCell>
                            <TableCell className="text-right">
                              {detalle.costoUnitario !== undefined &&
                              detalle.costoUnitario !== null
                                ? `$${Math.round(detalle.costoUnitario).toLocaleString("de-DE")}`
                                : "-"}
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
                          <TableCell colSpan={5} className="text-center">
                            No hay detalles disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Acciones en el diálogo */}
              <div className="flex justify-end gap-3">
                {comprobanteDetalle.estadoComprobanteCodigo ===
                  ESTADO_BORRADOR && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleEditar(comprobanteDetalle)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={() =>
                        handleConfirmarDirecto(comprobanteDetalle.id!)
                      }
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
                          Confirmar
                        </>
                      )}
                    </Button>
                  </>
                )}
                {comprobanteDetalle.estadoComprobanteCodigo ===
                  ESTADO_CONFIRMADO && (
                  <Button
                    variant="destructive"
                    onClick={() => handleAnular(comprobanteDetalle.id!)}
                    disabled={
                      anularMutation.isPending ||
                      !!comprobanteDetalle.contraDeId
                    }
                    className="gap-2"
                    title={
                      comprobanteDetalle.contraDeId
                        ? "No se puede anular un contra comprobante"
                        : undefined
                    }
                  >
                    {anularMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Anulando...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Anular
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
