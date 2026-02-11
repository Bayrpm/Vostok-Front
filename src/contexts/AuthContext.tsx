import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { validateAuthToken } from "@/services/authMiddleware";
import type { Tables } from "@/integrations/supabase/types";

type Usuario = Tables<"Usuarios">;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  usuario: Usuario | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data, error } = await supabase
          .from("Usuarios")
          .select("*")
          .eq("Id", session.user.id)
          .single();

        if (isMounted) {
          if (error) {
            console.error("Error fetching user profile:", error);
            setUsuario(null);
          } else {
            setUsuario(data);
          }
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setUsuario(null);
          setLoading(false);
        }
      }
    });

    // Verificar sesión inicial con validación del token
    validateAuthToken()
      .then((session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          supabase
            .from("Usuarios")
            .select("*")
            .eq("Id", session.user.id)
            .single()
            .then(({ data, error }) => {
              if (isMounted) {
                if (error) {
                  console.error("Error fetching user profile:", error);
                  setUsuario(null);
                } else {
                  setUsuario(data);
                }
                setLoading(false);
              }
            })
            .catch((error) => {
              if (isMounted) {
                console.error("Error fetching user profile:", error);
                setUsuario(null);
                setLoading(false);
              }
            });
        } else {
          if (isMounted) {
            setUsuario(null);
            setLoading(false);
          }
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Error validating token:", error);
          setSession(null);
          setUser(null);
          setUsuario(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
