import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { motion } from "framer-motion";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, plan, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in → go to plans
  if (!session) {
    return <Navigate to="/plans" state={{ from: location }} replace />;
  }

  // Logged in but not active → show waiting screen
  if (profile && !profile.is_active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-black italic text-foreground mb-3">Aguardando Ativação</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Sua conta foi criada com sucesso! O administrador está verificando seu pagamento e liberará seu acesso em breve.
          </p>
          {profile.plan && profile.plan !== "none" && (
            <div className="bg-muted rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground">Plano selecionado</p>
              <p className="text-lg font-black text-primary italic">{profile.plan.toUpperCase()}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Caso já tenha feito o pagamento, aguarde até 24h para a ativação.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/80 transition-colors"
          >
            Verificar novamente
          </button>
        </motion.div>
      </div>
    );
  }

  // Has no plan → go to plans
  if (plan === "none" && location.pathname !== "/plans") {
    return <Navigate to="/plans" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
