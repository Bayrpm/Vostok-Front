import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { almacenService } from "@/services/AlmacenService";
import { productosEmpresaService } from "@/services/productosEmpresaService";
import { comprobanteService } from "@/services/comprobanteService";
import { tipoComprobanteService } from "@/services/tipoComprobanteService";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Validaciones del formulario
const detalleSchema = z
  .object({
    productoEmpresaId: z.string().min(1, "Producto es requerido"),
    cantidad: z.number().min(0.01, "Cantidad debe ser mayor a 0"),
    almacenOrigenId: z.string().optional(),
    almacenDestinoId: z.string().optional(),
  })
  .refine(
    (data) => {
      // Esta validación se hará en el backend
      return true;
    },
    {
      message: "Validación fallida",
    },
  );

const comprobanteSchema = z.object({
  tipoComprobanteCodigo: z.string().min(1, "Tipo de comprobante es requerido"),
  numero: z.string().min(1, "Número de comprobante es requerido"),
  fecha: z.string().min(1, "Fecha es requerida"),
  observacion: z.string().max(500, "Máximo 500 caracteres").optional(),
  detalles: z.array(detalleSchema).min(1, "Debe agregar al menos un detalle"),
});

type ComprobanteFormData = z.infer<typeof comprobanteSchema>;

export default function IngresoComprobante() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, usuario } = useAuth();

  // Obtener tipos de comprobante
  const { data: tiposComprobantes = [], isLoading: isLoadingTipos } = useQuery({
    queryKey: ["tiposComprobantes"],
    queryFn: () =>
      tipoComprobanteService.getTiposComprobantes(session?.access_token || ""),
    enabled: !!session?.access_token,
  });

  // Obtener productos de empresa
  const { data: productosEmpresa = [], isLoading: isLoadingProductos } =
    useQuery({
      queryKey: ["productosEmpresa"],
      queryFn: () =>
        productosEmpresaService.getProductosEmpresa(
          session?.access_token || "",
        ),
      enabled: !!session?.access_token,
    });

  // Obtener almacenes
  const { data: almacenes = [], isLoading: isLoadingAlmacenes } = useQuery({
    queryKey: ["almacenes"],
    queryFn: () => almacenService.getAlmacenes(session?.access_token || ""),
    enabled: !!session?.access_token,
  });

  // Obtener fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const form = useForm<ComprobanteFormData>({
    resolver: zodResolver(comprobanteSchema),
    defaultValues: {
      tipoComprobanteCodigo: "",
      numero: "",
      fecha: today,
      observacion: "",
      detalles: [{ productoEmpresaId: "", cantidad: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles",
  });

  const selectedTipo = form.watch("tipoComprobanteCodigo");

  const createMutation = useMutation({
    mutationFn: (data: ComprobanteFormData) =>
      comprobanteService.createComprobante(data, session?.access_token || ""),
    onSuccess: () => {
      toast({
        title: "Comprobante creado",
        description:
          "El comprobante ha sido guardado como borrador exitosamente.",
      });
      setTimeout(() => {
        navigate("/comprobantes");
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ComprobanteFormData) => {
    createMutation.mutate(data);
  };

  const agregarDetalle = () => {
    append({ productoEmpresaId: "", cantidad: 1 });
  };

  const eliminarDetalle = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast({
        title: "Error",
        description: "Debe mantener al menos un detalle",
        variant: "destructive",
      });
    }
  };

  // Determinar si un campo es obligatorio según el tipo de comprobante
  // Códigos: 10/11=INGRESO, 20/21=SALIDA, 30/31=AJUSTE, 40=TRANSFERENCIA, 90=DOCUMENTO
  const tipoCodigoNum = parseInt(selectedTipo);
  const isAlmacenOrigenObligatorio =
    tipoCodigoNum === 20 || tipoCodigoNum === 21 || tipoCodigoNum === 40; // SALIDA o TRANSFERENCIA
  const isAlmacenDestinoObligatorio =
    tipoCodigoNum === 10 || tipoCodigoNum === 11 || tipoCodigoNum === 40; // INGRESO o TRANSFERENCIA

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Ingresar Comprobante
          </h1>
          <p className="text-muted-foreground mt-1">
            Crear un nuevo comprobante (borrador)
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* SECCIÓN 1: DATOS DEL COMPROBANTE */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Comprobante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="tipoComprobanteCodigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Comprobante *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingTipos}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingTipos
                                  ? "Cargando tipos..."
                                  : "Selecciona un tipo"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposComprobantes
                            .filter((tipo) => tipo.codigo != null)
                            .map((tipo) => (
                              <SelectItem
                                key={tipo.codigo}
                                value={tipo.codigo.toString()}
                              >
                                {tipo.nombre}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Comprobante *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingresa el número de comprobante"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observación</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ingresa observaciones (máx. 500 caracteres)"
                          {...field}
                          maxLength={500}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/500
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SECCIÓN 2: DETALLE DEL COMPROBANTE */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detalle del Comprobante</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={agregarDetalle}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Fila
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border rounded-lg space-y-3 bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">
                          Detalle {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => eliminarDetalle(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`detalles.${index}.productoEmpresaId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Producto *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un producto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productosEmpresa.map((producto) => (
                                  <SelectItem
                                    key={producto.id}
                                    value={producto.id}
                                  >
                                    {producto.productoNombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`detalles.${index}.cantidad`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isAlmacenOrigenObligatorio && (
                        <FormField
                          control={form.control}
                          name={`detalles.${index}.almacenOrigenId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Almacén Origen{" "}
                                {isAlmacenOrigenObligatorio && "*"}
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                                disabled={isLoadingAlmacenes}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        isLoadingAlmacenes
                                          ? "Cargando almacenes..."
                                          : "Selecciona almacén origen"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {almacenes.map((almacen) => (
                                    <SelectItem
                                      key={almacen.id}
                                      value={almacen.id}
                                    >
                                      {almacen.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {isAlmacenDestinoObligatorio && (
                        <FormField
                          control={form.control}
                          name={`detalles.${index}.almacenDestinoId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Almacén Destino{" "}
                                {isAlmacenDestinoObligatorio && "*"}
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                                disabled={isLoadingAlmacenes}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        isLoadingAlmacenes
                                          ? "Cargando almacenes..."
                                          : "Selecciona almacén destino"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {almacenes.map((almacen) => (
                                    <SelectItem
                                      key={almacen.id}
                                      value={almacen.id}
                                    >
                                      {almacen.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SECCIÓN 3: ACCIONES */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Guardando..." : "Guardar Borrador"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
