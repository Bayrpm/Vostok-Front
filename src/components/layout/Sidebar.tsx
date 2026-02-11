import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ArrowLeftRight,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileText,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    label: "Productos",
    icon: Package,
    subItems: [
      { href: "/productos", label: "Productos" },
      { href: "/producto-empresa", label: "Productos de Empresa" },
    ],
  },
  { href: "/categorias", icon: FolderTree, label: "Categorías" },
  { href: "/almacenes", icon: Warehouse, label: "Almacenes" },
  { href: "/movimientos", icon: ArrowLeftRight, label: "Movimientos" },
  {
    label: "Comprobantes",
    icon: FileText,
    subItems: [
      { href: "/comprobantes", label: "Ingresar Comprobante" },
      { href: "/visualizar-comprobante", label: "Visualizar Comprobante" },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, usuario } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productosOpen, setProductosOpen] = useState(false);
  const [comprobantesOpen, setComprobantesOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Package className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Vostok</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              if (item.subItems) {
                const isActive = item.subItems.some(
                  (sub) => location.pathname === sub.href,
                );
                const isProductos = item.label === "Productos";
                const isComprobantes = item.label === "Comprobantes";
                const isOpen = isProductos ? productosOpen : comprobantesOpen;
                const setOpen = isProductos
                  ? setProductosOpen
                  : setComprobantesOpen;

                return (
                  <Collapsible
                    key={item.label}
                    open={isOpen}
                    onOpenChange={setOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-6">
                      {item.subItems.map((subItem) => {
                        const subIsActive = location.pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              subIsActive
                                ? "bg-sidebar-accent text-sidebar-primary"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                            )}
                          >
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              } else {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              }
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
              <p className="text-sm font-medium truncate">
                {usuario?.Nombres} {usuario?.ApellidoPaterno}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {usuario?.Correo}
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={signOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
