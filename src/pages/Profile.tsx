import { useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { User, Camera, Save, ChevronLeft } from "lucide-react";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarPreview(`${publicUrl}?t=${Date.now()}`);
      toast.success("Foto atualizada!");
    } catch (error: any) {
      toast.error("Erro ao enviar foto: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("profiles").update({
        display_name: displayName,
        avatar_url: avatarPreview,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

      if (error) throw error;
      toast.success("Perfil salvo com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      <Navbar />
      <main className="pt-24 px-4 md:px-8 max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft size={20} /> Voltar
        </button>

        <h1 className="text-3xl font-black mb-8">Meu Perfil</h1>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-primary/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                  <User size={40} className="text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/80 transition-colors shadow-lg"
              >
                <Camera size={16} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            {uploading && <span className="text-xs text-muted-foreground animate-pulse">Enviando...</span>}
          </div>

          {/* Display Name */}
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-2 block">Nome de exibição</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como quer ser chamado?"
              className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary border border-border"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-2 block">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full bg-muted text-muted-foreground rounded-lg px-4 py-3 border border-border cursor-not-allowed"
            />
          </div>

          {/* Plan Info */}
          <div className="bg-muted rounded-lg p-4">
            <span className="text-xs text-muted-foreground font-bold uppercase">Plano atual</span>
            <p className="text-lg font-black text-primary">{profile?.plan?.toUpperCase() || "NENHUM"}</p>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
