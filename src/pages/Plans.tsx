import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const Plans = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (plan: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles" as any)
        .upsert({
          id: user.id,
          plan: plan,
          is_active: false, // Wait for admin confirmation
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success(`Plano ${plan.toUpperCase()} selecionado! Aguarde a ativação pelo administrador.`);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao selecionar plano.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans py-20 px-4 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#00A8E1]/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#00A8E1]/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-6"
          >
             <span className="text-[#00A8E1] font-black tracking-[0.3em] uppercase text-xs sm:text-sm">Assine o Cinecasa</span>
             <h1 className="text-4xl sm:text-6xl font-[900] tracking-tighter italic">ESCOLHA SEU PLANO</h1>
          </motion.div>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Seja bem-vindo ao melhor do entretenimento. Escolha o plano que melhor se adapta a você e comece sua jornada agora mesmo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Básico */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#151515] rounded-2xl p-8 border border-white/10 hover:border-[#00A8E1]/50 transition-all group flex flex-col h-full"
          >
            <div className="mb-8">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="text-[#00A8E1]" size={28} />
              </div>
              <h3 className="text-2xl font-black mb-2 italic">PLANO BÁSICO</h3>
              <p className="text-white/40 text-sm">O essencial para sua diversão diária.</p>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="50 Filmes (Até 2024)" />
              <FeatureItem text="50 Séries (Até 2023)" />
              <FeatureItem text="10 Filmes Kids" />
              <FeatureItem text="5 Séries Kids" />
              <FeatureItem text="Sem TV ao Vivo" disabled />
              <FeatureItem text="Sem Lançamentos 2025/2026" disabled />
            </div>

            <button
              onClick={() => handleSelectPlan("basic")}
              disabled={isLoading}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-black italic hover:bg-white/10 transition-all active:scale-95"
            >
              SELECIONAR BÁSICO
            </button>
          </motion.div>

          {/* Plano Pro */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#1c1c1c] to-[#0f171e] rounded-2xl p-8 border-2 border-[#00A8E1] shadow-[0_0_40px_rgba(0,168,225,0.2)] group relative flex flex-col h-full overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-[#00A8E1] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Recomendado
            </div>
            
            <div className="mb-8">
              <div className="w-12 h-12 bg-[#00A8E1]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="text-[#00A8E1]" size={28} />
              </div>
              <h3 className="text-2xl font-black mb-2 italic">PLANO PRO</h3>
              <p className="text-white/40 text-sm">Acesso total sem limites ou restrições.</p>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="Todos os Conteúdos Liberados" highlight />
              <FeatureItem text="Lançamentos 2025 e 2026" highlight />
              <FeatureItem text="Canais de TV ao Vivo" highlight />
              <FeatureItem text="Catálogo Kids Completo" highlight />
              <FeatureItem text="Suporte Prioritário" highlight />
              <FeatureItem text="Qualidade máxima de imagem" highlight />
            </div>

            <button
              onClick={() => handleSelectPlan("pro")}
              disabled={isLoading}
              className="w-full py-4 bg-[#00A8E1] text-white rounded-xl font-black italic hover:bg-[#00A8E1]/80 transition-all active:scale-95 shadow-[0_10px_20px_rgba(0,168,225,0.3)]"
            >
              ASSINAR AGORA (PRO)
            </button>
          </motion.div>
        </div>

        <div className="mt-20 text-center">
            <p className="text-white/40 text-sm flex items-center justify-center gap-2">
                <Shield size={16} /> Pagamento 100% seguro via confirmação administrativa.
            </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, disabled = false, highlight = false }: { text: string; disabled?: boolean; highlight?: boolean }) => (
  <div className={`flex items-center gap-3 ${disabled ? "opacity-30" : "opacity-100"}`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? "bg-[#00A8E1]/20 text-[#00A8E1]" : "bg-white/10 text-white/60"}`}>
      <Check size={14} />
    </div>
    <span className={`text-sm font-semibold ${highlight ? "text-white" : "text-white/70"}`}>{text}</span>
  </div>
);

export default Plans;
