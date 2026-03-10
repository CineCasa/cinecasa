import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, plan } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00A8E1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/plans" state={{ from: location }} replace />;
  }

  // Se o usuário não tem plano e não está na página de planos, redireciona
  if (plan === "none" && location.pathname !== "/plans") {
    return <Navigate to="/plans" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
