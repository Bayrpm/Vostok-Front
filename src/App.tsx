import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import ProductoEmpresa from "./pages/ProductoEmpresa";
import Categorias from "./pages/Categorias";
import Movimientos from "./pages/Movimientos";
import IngresoComprobante from "./pages/IngresoComprobante";
import VisualizarComprobante from "./pages/VisualizarComprobante";
import Almacenes from "./pages/Almacenes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RedirectHome = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RedirectHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRoute>
                  <Productos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/producto-empresa"
              element={
                <ProtectedRoute>
                  <ProductoEmpresa />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorias"
              element={
                <ProtectedRoute>
                  <Categorias />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movimientos"
              element={
                <ProtectedRoute>
                  <Movimientos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comprobantes"
              element={
                <ProtectedRoute>
                  <IngresoComprobante />
                </ProtectedRoute>
              }
            />
            <Route
              path="/visualizar-comprobante"
              element={
                <ProtectedRoute>
                  <VisualizarComprobante />
                </ProtectedRoute>
              }
            />
            <Route
              path="/almacenes"
              element={
                <ProtectedRoute>
                  <Almacenes />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
