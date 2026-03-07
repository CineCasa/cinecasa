import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Cinema from "./pages/Cinema";
import Series from "./pages/Series";
import TvAoVivo from "./pages/TvAoVivo";
import FilmesKids from "./pages/FilmesKids";
import SeriesKids from "./pages/SeriesKids";
import DataLoader from "./pages/DataLoader";
import Details from "./pages/Details";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const HomeRedirect = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redireciona para Home apenas no primeiro carregamento real (sessionStorage)
    const hasRedirected = sessionStorage.getItem("initialRedirect");
    if (!hasRedirected && location.pathname !== "/") {
       navigate("/", { replace: true });
       sessionStorage.setItem("initialRedirect", "true");
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HomeRedirect>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cinema" element={<Cinema />} />
            <Route path="/series" element={<Series />} />
            <Route path="/tv-live" element={<TvAoVivo />} />
            <Route path="/kids-movies" element={<FilmesKids />} />
            <Route path="/kids-series" element={<SeriesKids />} />
            <Route path="/details/:type/:id" element={<Details />} />
            <Route path="/admin/data-loader" element={<DataLoader />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HomeRedirect>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
