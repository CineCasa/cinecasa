import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para confirmar.");
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro na autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2000&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-30"
          alt="background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Top Bar / Logo */}
      <div className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-center">
        <Link to="/" className="flex flex-col items-start leading-none group">
          <span className="text-3xl sm:text-4xl font-[900] tracking-tighter text-[#00A8E1] italic">
            CINECASA
          </span>
          <span className="text-[10px] font-bold text-white/50 tracking-[0.3em] uppercase">
            Entretenimento e lazer
          </span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[450px] p-8 sm:px-16 sm:py-12 bg-black/80 rounded-lg border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white mb-8">
          {isRegistering ? "Criar Conta" : "Entrar"}
        </h1>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#333] text-white rounded px-4 pt-6 pb-2 outline-none focus:bg-[#454545] transition-colors peer border-b-2 border-transparent focus:border-[#00A8E1]"
              placeholder=" "
            />
            <label className="absolute left-4 top-4 text-[#8c8c8c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-xs pointer-events-none">
              Email
            </label>
          </div>

          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#333] text-white rounded px-4 pt-6 pb-2 outline-none focus:bg-[#454545] transition-colors peer border-b-2 border-transparent focus:border-[#00A8E1]"
              placeholder=" "
            />
            <label className="absolute left-4 top-4 text-[#8c8c8c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-xs pointer-events-none">
              Senha
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00A8E1] text-white font-bold py-3 mt-4 rounded transition-all hover:bg-[#00A8E1]/80 active:scale-[0.98] shadow-[0_0_20px_rgba(0,168,225,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              isRegistering ? "Cadastrar" : "Entrar"
            )}
          </button>

          {!isRegistering && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#00A8E1]" id="remember" />
                <label htmlFor="remember" className="text-xs text-[#b3b3b3] cursor-pointer">Lembre-se de mim</label>
              </div>
              <Link to="#" className="text-xs text-[#b3b3b3] hover:underline">Esqueceu a senha?</Link>
            </div>
          )}
        </form>

        <div className="mt-12 text-[#737373]">
          <p>
            {isRegistering ? "Já tem uma conta?" : "Novo por aqui?"}{" "}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-white hover:underline font-medium"
            >
              {isRegistering ? "Entrar agora." : "Assine agora."}
            </button>
          </p>
          <p className="text-[11px] mt-4 leading-relaxed">
            Esta página é protegida pelo Google reCAPTCHA para garantir que você não é um robô.{" "}
            <button className="text-[#0071eb] hover:underline">Saiba mais.</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
