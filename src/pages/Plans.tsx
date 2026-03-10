import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Zap, Star, Copy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const PIX_KEY = "6c4d357b-9ec7-4900-84cf-a221f4d990d9";

const Plans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pixModal, setPixModal] = useState<{ plan: string; price: string } | null>(null);

  const handleSelectPlan = (plan: string, price: string) => {
    setPixModal({ plan, price });
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    toast.success("Chave Pix copiada!");
  };

  const handleConfirmPayment = async () => {
    if (!pixModal) return;

    if (!user) {
      // Save selected plan in state and redirect to login
      navigate("/login", { state: { selectedPlan: pixModal.plan } });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          plan: pixModal.plan,
          is_active: false,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success(`Plano ${pixModal.plan.toUpperCase()} selecionado! Aguarde a ativação pelo administrador.`);
      setPixModal(null);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao selecionar plano.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-20 px-4 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-3xl sm:text-4xl font-[900] tracking-tighter text-primary italic">CINECASA</span>
          <p className="text-[10px] font-bold text-muted-foreground tracking-[0.3em] uppercase">Entretenimento e lazer</p>
        </div>

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-6"
          >
            <span className="text-primary font-black tracking-[0.3em] uppercase text-xs sm:text-sm">Assine o Cinecasa</span>
            <h1 className="text-4xl sm:text-6xl font-[900] tracking-tighter italic text-foreground">ESCOLHA SEU PLANO</h1>
          </motion.div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Seja bem-vindo ao melhor do entretenimento. Escolha o plano que melhor se adapta a você e comece sua jornada agora mesmo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Básico */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all group flex flex-col h-full"
          >
            <div className="mb-6">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-black mb-1 italic text-foreground">PLANO BÁSICO</h3>
              <p className="text-muted-foreground text-sm">O essencial para sua diversão diária.</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-[900] text-foreground">R$ 6,99</span>
              <span className="text-muted-foreground text-sm"> /mês</span>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="Filmes selecionados (Até 2024)" />
              <FeatureItem text="Séries selecionadas (Até 2023)" />
              <FeatureItem text="Filmes Kids" />
              <FeatureItem text="Séries Kids" />
              <FeatureItem text="Qualidade HD" />
            </div>

            <button
              onClick={() => handleSelectPlan("basic", "R$ 6,99")}
              className="w-full py-4 bg-muted border border-border rounded-xl font-black italic hover:bg-muted/80 text-foreground transition-all active:scale-95"
            >
              SELECIONAR BÁSICO
            </button>
          </motion.div>

          {/* Plano Pro */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-card to-background rounded-2xl p-8 border-2 border-primary shadow-[0_0_40px_hsl(var(--primary)/0.2)] group relative flex flex-col h-full overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Recomendado
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-black mb-1 italic text-foreground">PLANO PRO</h3>
              <p className="text-muted-foreground text-sm">Acesso total sem limites ou restrições.</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-[900] text-foreground">R$ 9,99</span>
              <span className="text-muted-foreground text-sm"> /mês</span>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="Todos os Conteúdos Liberados" highlight />
              <FeatureItem text="Lançamentos 2025 e 2026" highlight />
              <FeatureItem text="🎁 Brinde: Canais de TV ao Vivo" highlight />
              <FeatureItem text="Catálogo Kids Completo" highlight />
              <FeatureItem text="Suporte Prioritário" highlight />
              <FeatureItem text="Qualidade máxima de imagem" highlight />
            </div>

            <button
              onClick={() => handleSelectPlan("pro", "R$ 9,99")}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black italic hover:bg-primary/80 transition-all active:scale-95 shadow-[0_10px_20px_hsl(var(--primary)/0.3)]"
            >
              ASSINAR AGORA (PRO)
            </button>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Shield size={16} /> Pagamento 100% seguro via Pix.
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">
            Já tem uma conta?{" "}
            <button onClick={() => navigate("/login")} className="text-primary hover:underline font-semibold">
              Faça login aqui
            </button>
          </p>
        </div>
      </div>

      {/* Pix Payment Modal */}
      <AnimatePresence>
        {pixModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPixModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black italic text-foreground">Pagamento via Pix</h2>
                <button onClick={() => setPixModal(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-muted rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Plano selecionado</p>
                <p className="text-2xl font-black text-primary italic">{pixModal.plan.toUpperCase()}</p>
                <p className="text-3xl font-[900] text-foreground mt-2">{pixModal.price}<span className="text-sm text-muted-foreground">/mês</span></p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Copie a chave Pix abaixo e realize o pagamento:</p>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                  <code className="text-xs text-foreground flex-1 break-all font-mono">{PIX_KEY}</code>
                  <button
                    onClick={handleCopyPix}
                    className="flex-shrink-0 bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/80 transition-colors"
                    title="Copiar chave Pix"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Após o pagamento, clique em "Já fiz o pagamento". Seu acesso será liberado em até 24 horas após confirmação.
              </p>

              <button
                onClick={handleConfirmPayment}
                disabled={isLoading}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black italic hover:bg-primary/80 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  "JÁ FIZ O PAGAMENTO"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureItem = ({ text, disabled = false, highlight = false }: { text: string; disabled?: boolean; highlight?: boolean }) => (
  <div className={`flex items-center gap-3 ${disabled ? "opacity-30" : "opacity-100"}`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
      <Check size={14} />
    </div>
    <span className={`text-sm font-semibold ${highlight ? "text-foreground" : "text-muted-foreground"}`}>{text}</span>
  </div>
);

export default Plans;
