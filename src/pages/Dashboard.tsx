import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  FolderTree,
  ArrowLeftRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { usuario } = useAuth();

  const { data: productosEmpresa, isLoading: loadingProducts } = useQuery({
    queryKey: ["productos-count"],
    queryFn: async () => {
      if (!usuario?.EmpresaId) return [];
      return await dashboardService.getProductosEmpresa(usuario.EmpresaId);
    },
  });

  const { data: categorias, isLoading: loadingCategories } = useQuery({
    queryKey: ["categorias-count"],
    queryFn: async () => {
      if (!usuario?.EmpresaId) return [];
      return await dashboardService.getCategoriasEmpresa(usuario.EmpresaId);
    },
  });

  const { data: movimientos, isLoading: loadingMovements } = useQuery({
    queryKey: ["movimientos-count"],
    queryFn: async () => {
      if (!usuario?.EmpresaId) return [];
      return await dashboardService.getMovimientosRecientes(usuario.EmpresaId);
    },
  });

  const { stockBajo, sinStock, stockSaludable } =
    dashboardService.calculateStockStatus(productosEmpresa || []);

  const stats = [
    {
      title: "Total Productos",
      value: productosEmpresa?.length || 0,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Categorías",
      value: categorias?.length || 0,
      icon: FolderTree,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Stock Bajo",
      value: stockBajo.length,
      icon: AlertTriangle,
      color: "text-stock-warning",
      bgColor: "bg-stock-warning/10",
    },
    {
      title: "Sin Stock",
      value: sinStock.length,
      icon: TrendingDown,
      color: "text-stock-danger",
      bgColor: "bg-stock-danger/10",
    },
  ];

  const isLoading = loadingProducts || loadingCategories || loadingMovements;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen de tu inventario</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stock Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Estado del Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-stock-healthy/10">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-stock-healthy" />
                      <span className="font-medium">Stock saludable</span>
                    </div>
                    <span className="text-lg font-bold text-stock-healthy">
                      {stockSaludable.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-stock-warning/10">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-stock-warning" />
                      <span className="font-medium">Stock mínimo</span>
                    </div>
                    <span className="text-lg font-bold text-stock-warning">
                      {stockBajo.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-stock-danger/10">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 text-stock-danger" />
                      <span className="font-medium">Quiebre de stock</span>
                    </div>
                    <span className="text-lg font-bold text-stock-danger">
                      {sinStock.length}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-accent" />
                Últimos Movimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : movimientos && movimientos.length > 0 ? (
                <div className="space-y-3">
                  {movimientos.map((mov) => (
                    <div
                      key={mov.Id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {mov.tipomovimiento === 1 ? (
                          <TrendingUp className="h-4 w-4 text-stock-healthy" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-stock-danger" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{mov.motivo}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(mov.fechamovimiento).toLocaleDateString(
                              "es-CL",
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${mov.tipomovimiento === 1 ? "text-stock-healthy" : "text-stock-danger"}`}
                      >
                        {mov.tipomovimiento === 1 ? "+" : "-"}
                        {mov.cantidad}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay movimientos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
