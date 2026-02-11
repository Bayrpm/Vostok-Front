import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerService } from "@/services/registerService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, UserPlus } from "lucide-react";
import type { Empresa } from "@/types/auth";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    empresaId: "",
  });
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const data = await registerService.getEmpresas();
        setEmpresas(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar empresas",
          description:
            error instanceof Error ? error.message : "Error desconocido",
        });
      } finally {
        setLoadingEmpresas(false);
      }
    };

    loadEmpresas();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    if (!formData.empresaId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar una empresa",
      });
      return;
    }

    setLoading(true);

    try {
      await registerService.registerUser(formData.email, formData.password, {
        nombres: formData.nombres,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        empresaId: formData.empresaId,
      });

      toast({
        title: "Registro exitoso",
        description:
          "Por favor verifica tu correo electrónico para confirmar tu cuenta.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al registrar",
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Crear cuenta
          </CardTitle>
          <CardDescription>Registra tu empresa en Vostok</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  placeholder="Juan Carlos"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
                <Input
                  id="apellidoPaterno"
                  name="apellidoPaterno"
                  placeholder="González"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidoMaterno">Apellido materno</Label>
              <Input
                id="apellidoMaterno"
                name="apellidoMaterno"
                placeholder="Pérez"
                value={formData.apellidoMaterno}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresaId">Empresa</Label>
              <Select
                value={formData.empresaId}
                onValueChange={(value) =>
                  setFormData({ ...formData, empresaId: value })
                }
                disabled={loadingEmpresas}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.Id} value={empresa.Id}>
                      {empresa.Nombre} - {empresa.RutEmpresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? (
                "Registrando..."
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear cuenta
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-accent hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
