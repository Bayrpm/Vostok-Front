import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Perfil incompleto</h2>
          <p className="text-muted-foreground mb-4">
            Tu cuenta de usuario existe pero falta información del perfil. Por
            favor, contacta al administrador o registra una nueva cuenta.
          </p>
          <Button onClick={() => supabase.auth.signOut()}>Cerrar sesión</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
