import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users, CheckCircle, XCircle, ShieldCheck, Mail, Calendar, CreditCard,
  LogOut, Home, BarChart3, Settings, Eye, EyeOff, Layers
} from "lucide-react";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  email: string;
  plan: string;
  is_active: boolean;
  is_admin: boolean;
  updated_at: string;
}

type AdminTab = "dashboard" | "users" | "sections";

const Admin = () => {
  // Auth state - inline login
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [homeSections, setHomeSections] = useState<any[]>([]);

  // Check auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else { setProfile(null); setAuthLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await (supabase as any).from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setAuthLoading(false);
  };

  const isAdmin = profile?.is_admin === true;

  // Load admin data when authenticated
  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
      fetchHomeSections();
    }
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("profiles").select("*").order("updated_at", { ascending: false });
    if (error) toast.error("Erro ao carregar perfis: " + error.message);
    else setProfiles(data || []);
    setLoading(false);
  };

  const fetchHomeSections = async () => {
    const { data } = await supabase.from("home_sections").select("*").order("ordem", { ascending: true });
    setHomeSections(data || []);
  };

  const handleUpdateStatus = async (id: string, active: boolean) => {
    const { error } = await (supabase as any).from("profiles").update({ is_active: active }).eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success(`Usuário ${active ? "ativado" : "desativado"}!`); fetchProfiles(); }
  };

  const handleUpdatePlan = async (id: string, plan: string) => {
    const { error } = await (supabase as any).from("profiles").update({ plan, is_active: true }).eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success(`Plano atualizado para ${plan.toUpperCase()}!`); fetchProfiles(); }
  };

  // === LOADING ===
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // === LOGIN INLINE ===
  if (!session) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-primary" size={32} />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email" required autoFocus
              className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary border border-border"
            />
            <input
              type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Senha" required
              className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary border border-border"
            />
            <button type="submit" disabled={loginLoading}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50">
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // === ACCESS DENIED ===
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center text-foreground p-4">
        <div className="text-center">
          <XCircle size={64} className="mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
          <button onClick={handleLogout} className="text-primary hover:underline">Sair e tentar outra conta</button>
        </div>
      </div>
    );
  }

  // === ADMIN PANEL ===
  const totalUsers = profiles.length;
  const activeUsers = profiles.filter(p => p.is_active).length;
  const proUsers = profiles.filter(p => p.plan === "pro").length;

  const sidebarItems = [
    { id: "dashboard" as AdminTab, label: "Dashboard", icon: BarChart3 },
    { id: "users" as AdminTab, label: "Usuários", icon: Users },
    { id: "sections" as AdminTab, label: "Seções Home", icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            <span className="text-lg font-black tracking-tight">CINECASA</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Painel Admin</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
            <Home size={16} /> Ir para Home
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-3xl font-black mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: "Total Usuários", value: totalUsers, icon: Users, color: "text-primary" },
                { label: "Usuários Ativos", value: activeUsers, icon: CheckCircle, color: "text-green-500" },
                { label: "Plano PRO", value: proUsers, icon: CreditCard, color: "text-amber-500" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</span>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <span className={`text-4xl font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black">Usuários</h1>
              <button onClick={fetchProfiles} className="text-sm text-primary hover:underline font-semibold">Atualizar</button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-5 border border-border hover:border-border/80 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${p.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                          <Users size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{p.email}</span>
                            {p.is_admin && <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">Admin</span>}
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(p.updated_at).toLocaleDateString()}</span>
                            <span className={`font-bold ${p.plan === "pro" ? "text-amber-500" : "text-primary"}`}>
                              <CreditCard size={12} className="inline mr-1" />{p.plan?.toUpperCase() || "NONE"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.is_active ? (
                          <button onClick={() => handleUpdateStatus(p.id, false)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-destructive/10 text-destructive hover:bg-destructive text-xs font-bold rounded-lg transition-all hover:text-white">
                            <XCircle size={14} /> Desativar
                          </button>
                        ) : (
                          <button onClick={() => handleUpdateStatus(p.id, true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 text-xs font-bold rounded-lg transition-all hover:text-white">
                            <CheckCircle size={14} /> Ativar
                          </button>
                        )}
                        <div className="flex gap-1 ml-2">
                          {["basic", "pro"].map((plan) => (
                            <button key={plan} onClick={() => handleUpdatePlan(p.id, plan)}
                              className={`px-3 py-2 text-[10px] font-black rounded-lg transition-all ${
                                p.plan === plan
                                  ? plan === "pro" ? "bg-amber-500 text-white" : "bg-primary text-white"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}>
                              {plan.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Home Sections */}
        {activeTab === "sections" && (
          <div>
            <h1 className="text-3xl font-black mb-8">Seções da Home</h1>
            <p className="text-muted-foreground text-sm mb-6">Gerencie as seções exibidas na página inicial. Adicione seções diretamente no Supabase (tabela home_sections).</p>
            {homeSections.length === 0 ? (
              <p className="text-muted-foreground text-center py-20">Nenhuma seção configurada ainda.</p>
            ) : (
              <div className="space-y-3">
                {homeSections.map((s) => (
                  <div key={s.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">{s.nome}</span>
                      <span className="text-xs text-muted-foreground ml-3">Tipo: {s.tipo} | Query: {s.query || "—"} | Ordem: {s.ordem}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${s.ativo ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                      {s.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
