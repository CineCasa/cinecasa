import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = (location.state as any)?.selectedPlan;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // If a plan was selected before registration, save it
        if (selectedPlan && data.user) {
          await (supabase as any)
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email,
              plan: selectedPlan,
              is_active: false,
              updated_at: new Date().toISOString(),
            });
        }

        toast.success("Conta criada! Verifique seu email para confirmar.");
        setIsRegistering(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // If a plan was selected before login, save it
        if (selectedPlan && data.user) {
          await (supabase as any)
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email,
              plan: selectedPlan,
              is_active: false,
              updated_at: new Date().toISOString(),
            });
          toast.success(`Plano ${selectedPlan.toUpperCase()} selecionado! Aguarde ativação.`);
        } else {
          toast.success("Bem-vindo de volta!");
        }
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro na autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2000&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-30"
          alt="background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-center">
        <Link to="/plans" className="flex flex-col items-start leading-none group">
          <span className="text-3xl sm:text-4xl font-[900] tracking-tighter text-primary italic">
            CINECASA
          </span>
          <span className="text-[10px] font-bold text-muted-foreground tracking-[0.3em] uppercase">
            Entretenimento e lazer
          </span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[450px] p-8 sm:px-16 sm:py-12 bg-card/80 rounded-lg border border-border backdrop-blur-xl shadow-2xl"
      >
        {selectedPlan && (
          <div className="mb-6 bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Plano selecionado</p>
            <p className="text-sm font-black text-primary italic">{selectedPlan.toUpperCase()}</p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-foreground mb-8">
          {isRegistering ? "Criar Conta" : "Entrar"}
        </h1>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              tabIndex={1}
              className="w-full bg-secondary text-foreground rounded px-4 pt-6 pb-2 outline-none focus:bg-muted transition-colors peer border-b-2 border-transparent focus:border-primary focus-visible:ring-0"
              placeholder=" "
            />
            <label className="absolute left-4 top-4 text-muted-foreground text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-xs pointer-events-none">
              Email
            </label>
          </div>

          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              tabIndex={2}
              className="w-full bg-secondary text-foreground rounded px-4 pt-6 pb-2 outline-none focus:bg-muted transition-colors peer border-b-2 border-transparent focus:border-primary focus-visible:ring-0"
              placeholder=" "
            />
            <label className="absolute left-4 top-4 text-muted-foreground text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-xs pointer-events-none">
              Senha
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            tabIndex={3}
            className="w-full bg-primary text-primary-foreground font-bold py-3 mt-4 rounded transition-all hover:bg-primary/80 active:scale-[0.98] shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              isRegistering ? "Cadastrar" : "Entrar"
            )}
          </button>

          {!isRegistering && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" id="remember" />
                <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">Lembre-se de mim</label>
              </div>
            </div>
          )}
        </form>

        <div className="mt-12 text-muted-foreground">
          <p>
            {isRegistering ? "Já tem uma conta?" : "Novo por aqui?"}{" "}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-foreground hover:underline font-medium"
            >
              {isRegistering ? "Entrar agora." : "Crie sua conta."}
            </button>
          </p>
          <p className="mt-3">
            <Link to="/plans" className="text-primary hover:underline text-sm font-semibold">
              ← Ver planos disponíveis
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
