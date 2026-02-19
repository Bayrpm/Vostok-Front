import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";
import { movimientosService } from "@/services/movimientosService";
import type { MovimientoInventario } from "@/types/movimiento";
import { Loader } from "@/components/common/Loader";

export default function Movimientos() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");

  const { data: movimientos, isLoading } = useQuery<MovimientoInventario[]>({
    queryKey: ["movimientos"],
    queryFn: async () => {
      return await movimientosService.getMovimientos(session?.access_token);
    },
    initialData: [],
  });

  // Extraer tipos de movimiento únicos del listado
  const tiposMovimiento = Array.from(
    new Set(movimientos?.map((m) => m.tipoMovimiento)),
  ).map((tipo) => ({
    codigo: tipo,
    nombre: tipo,
  }));

  const getMovementIcon = (tipo: string) => {
    switch (tipo) {
      case "INGRESO_COMPRA":
        return <TrendingUp className="h-4 w-4 text-stock-healthy" />;
      case "SALIDA_VENTA":
        return <TrendingDown className="h-4 w-4 text-stock-danger" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMovementColor = (tipo: string) => {
    switch (tipo) {
      case "INGRESO_COMPRA":
        return "bg-stock-healthy/10 text-stock-healthy border-stock-healthy";
      case "SALIDA_VENTA":
        return "bg-stock-danger/10 text-stock-danger border-stock-danger";
      default:
        return "bg-muted text-muted-foreground border-muted-foreground";
    }
  };

  const filteredMovimientos = movimientos?.filter((m) => {
    const matchesSearch =
      m.productoNombre?.toLowerCase().includes(search.toLowerCase()) ||
      m.sku?.toLowerCase().includes(search.toLowerCase()) ||
      (m.motivo || "").toLowerCase().includes(search.toLowerCase());
    const matchesTipo = tipoFilter === "all" || tipoFilter === m.tipoMovimiento;
    return matchesSearch && matchesTipo;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Movimientos</h1>
          <p className="text-muted-foreground mt-1">
            Historial de movimientos de inventario
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-accent" />
                Historial de movimientos
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 ml-auto">
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de movimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {tiposMovimiento?.map((tipo) => (
                      <SelectItem key={tipo.codigo} value={tipo.codigo}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar movimiento..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Loader size="md" message="Cargando movimientos..." />
                      </TableCell>
                    </TableRow>
                  ) : filteredMovimientos && filteredMovimientos.length > 0 ? (
                    filteredMovimientos.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(mov.fechaMovimiento).toLocaleString(
                            "es-CL",
                            {
                              dateStyle: "short",
                              timeStyle: "short",
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1.5 w-fit ${getMovementColor(mov.tipoMovimiento)}`}
                          >
                            {getMovementIcon(mov.tipoMovimiento)}
                            {mov.tipoMovimiento}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{mov.productoNombre}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {mov.sku}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span
                            className={
                              mov.direccion === "E"
                                ? "text-stock-healthy"
                                : mov.direccion === "S"
                                  ? "text-stock-danger"
                                  : ""
                            }
                          >
                            {mov.direccion === "E"
                              ? "+"
                              : mov.direccion === "S"
                                ? "-"
                                : ""}
                            {mov.cantidad}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {mov.costoUnitario?.toLocaleString("es-CL") || "0.00"}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={mov.motivo || ""}
                        >
                          {mov.motivo}
                        </TableCell>
                        <TableCell>{mov.usuarioNombre}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron movimientos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
