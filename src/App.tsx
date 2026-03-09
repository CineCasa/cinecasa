import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Cinema from "./pages/Cinema";
import Series from "./pages/Series";
import TvAoVivo from "./pages/TvAoVivo";
import FilmesKids from "./pages/FilmesKids";
import SeriesKids from "./pages/SeriesKids";
import DataLoader from "./pages/DataLoader";
import Details from "./pages/Details";
import Favorites from "./pages/Favorites";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import NetflixLoader from "./components/NetflixLoader";
import Login from "./pages/Login";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

import { motion, AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const HomeRedirect = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasRedirected = sessionStorage.getItem("initialRedirect");
    if (!hasRedirected && location.pathname !== "/" && location.pathname !== "/login") {
       navigate("/", { replace: true });
       sessionStorage.setItem("initialRedirect", "true");
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/cinema" element={<ProtectedRoute><Cinema /></ProtectedRoute>} />
          <Route path="/series" element={<ProtectedRoute><Series /></ProtectedRoute>} />
          <Route path="/tv-live" element={<ProtectedRoute><TvAoVivo /></ProtectedRoute>} />
          <Route path="/kids-movies" element={<ProtectedRoute><FilmesKids /></ProtectedRoute>} />
          <Route path="/kids-series" element={<ProtectedRoute><SeriesKids /></ProtectedRoute>} />
          <Route path="/details/:type/:id" element={<ProtectedRoute><Details /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/admin/data-loader" element={<DataLoader />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AnimatePresence>
            {loading && <NetflixLoader onComplete={() => setLoading(false)} />}
          </AnimatePresence>
          {!loading && (
            <BrowserRouter>
              <HomeRedirect>
                <AppRoutes />
              </HomeRedirect>
            </BrowserRouter>
          )}
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
