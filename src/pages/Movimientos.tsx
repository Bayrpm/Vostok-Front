import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { movimientosService } from "@/services/movimientosService";
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
import type { MovimientoInventario } from "@/types/movimiento";

export default function Movimientos() {
  const { usuario } = useAuth();
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");

  const { data: movimientos, isLoading } = useQuery({
    queryKey: ["movimientos"],
    queryFn: async () => {
      if (!usuario?.EmpresaId) return [];
      return await movimientosService.getMovimientos(usuario.EmpresaId);
    },
  });

  const { data: tiposMovimiento } = useQuery({
    queryKey: ["tipos-movimiento"],
    queryFn: async () => {
      return await movimientosService.getTiposMovimiento();
    },
  });

  const getMovementIcon = (tipo: number) => {
    switch (tipo) {
      case 1:
        return <TrendingUp className="h-4 w-4 text-stock-healthy" />;
      case 2:
        return <TrendingDown className="h-4 w-4 text-stock-danger" />;
      case 3:
        return <RefreshCw className="h-4 w-4 text-stock-warning" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMovementColor = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "bg-stock-healthy/10 text-stock-healthy border-stock-healthy";
      case 2:
        return "bg-stock-danger/10 text-stock-danger border-stock-danger";
      case 3:
        return "bg-stock-warning/10 text-stock-warning border-stock-warning";
      default:
        return "bg-muted text-muted-foreground border-muted-foreground";
    }
  };

  const filteredMovimientos = movimientos?.filter((m) => {
    const matchesSearch =
      (m as any).ProductoEmpresa?.Producto?.Nombre?.toLowerCase().includes(
        search.toLowerCase(),
      ) ||
      (m as any).ProductoEmpresa?.SKU?.toLowerCase().includes(
        search.toLowerCase(),
      ) ||
      m.Motivo?.toLowerCase().includes(search.toLowerCase());
    const matchesTipo =
      tipoFilter === "all" || parseInt(tipoFilter) === m.TipoMovimiento;
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
                      <SelectItem key={tipo.Id} value={tipo.Codigo.toString()}>
                        {tipo.Nombre}
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
                      <TableCell colSpan={7} className="text-center py-8">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : filteredMovimientos && filteredMovimientos.length > 0 ? (
                    filteredMovimientos.map((mov) => (
                      <TableRow key={mov.Id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(mov.FechaMovimiento).toLocaleString(
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
                            className={`flex items-center gap-1.5 w-fit ${getMovementColor(mov.TipoMovimiento)}`}
                          >
                            {getMovementIcon(mov.TipoMovimiento)}
                            {mov.TipoMovimiento}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {(mov as any).ProductoEmpresa?.Producto?.Nombre}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {(mov as any).ProductoEmpresa?.SKU}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span
                            className={
                              mov.Direccion === "E"
                                ? "text-stock-healthy"
                                : mov.Direccion === "S"
                                  ? "text-stock-danger"
                                  : ""
                            }
                          >
                            {mov.Direccion === "E"
                              ? "+"
                              : mov.Direccion === "S"
                                ? "-"
                                : ""}
                            {mov.Cantidad}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {mov.CostoUnitario?.toLocaleString("es-CL") || "0.00"}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={mov.Motivo || ""}
                        >
                          {mov.Motivo}
                        </TableCell>
                        <TableCell>
                          {(mov as any).Usuarios?.Nombres}{" "}
                          {(mov as any).Usuarios?.ApellidoPaterno}
                        </TableCell>
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
