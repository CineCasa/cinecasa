import { useState, useEffect, useRef } from "react";
import { Search, User, LogOut, Home, Film, Tv, Radio, Baby, Heart, Menu, X, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const navItems = [
  { label: "Início", path: "/", icon: Home },
  { label: "Cinema", path: "/cinema", icon: Film },
  { label: "Séries", path: "/series", icon: Tv },
  { label: "TV ao Vivo", path: "/tv-live", icon: Radio },
  { label: "Filmes Kids", path: "/kids-movies", icon: Baby },
  { label: "Séries Kids", path: "/kids-series", icon: Baby },
  { label: "Favoritos", path: "/favorites", icon: Heart },
];

// Mobile bottom bar - main items
const mobileMainItems = [
  { label: "Início", path: "/", icon: Home },
  { label: "Cinema", path: "/cinema", icon: Film },
  { label: "Séries", path: "/series", icon: Tv },
  { label: "Busca", path: "/search", icon: Search },
  { label: "Favoritos", path: "/favorites", icon: Heart },
];

const mobileMoreItems = [
  { label: "TV ao Vivo", path: "/tv-live", icon: Radio },
  { label: "Filmes Kids", path: "/kids-movies", icon: Baby },
  { label: "Séries Kids", path: "/kids-series", icon: Baby },
  { label: "Perfil", path: "/profile", icon: User },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { signOut, user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val)}`);
    } else if (location.pathname === "/search") {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "";

  return (
    <>
      {/* ===== DESKTOP/TV TOP BAR (≥768px) ===== */}
      <nav
        className={`hidden md:flex fixed top-0 left-0 right-0 z-50 transition-colors duration-300 font-sans ${
          scrolled ? "bg-[hsl(var(--background))]/95 shadow-xl border-b border-border" : "bg-gradient-to-b from-[hsl(var(--background))]/90 to-transparent"
        }`}
      >
        <div className="flex items-center justify-between w-full px-4 lg:px-12 h-16 lg:h-20">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link to="/" className="flex flex-col items-start leading-none group">
              <span className="text-2xl lg:text-3xl font-black tracking-tighter text-primary group-hover:text-foreground transition-colors">
                CINECASA
              </span>
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                Entretenimento e lazer
              </span>
            </Link>

            <ul className="flex items-center gap-1 lg:gap-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path} className="relative">
                    <Link
                      to={item.path}
                      tabIndex={0}
                      className={`nav-link-item text-sm lg:text-[15px] font-semibold transition-colors px-2 lg:px-3 py-2 rounded-md ${
                        isActive ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute -bottom-[14px] left-2 right-2 h-[3px] bg-primary rounded-t-md" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-muted-foreground">
            {/* Search */}
            <div className="flex items-center border border-transparent hover:border-border hover:bg-muted/30 rounded-full transition-all px-2 py-1 focus-within:border-primary/40 focus-within:bg-muted/30">
              {searchOpen && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Busca"
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground px-2 py-1 w-32 lg:w-48 outline-none"
                  onBlur={() => { if (!searchQuery) setTimeout(() => setSearchOpen(false), 200); }}
                  onKeyDown={(e) => { if (e.key === "Enter") setSearchOpen(false); }}
                />
              )}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full" tabIndex={0}>
                <Search size={20} />
              </button>
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full flex items-center gap-2"
                tabIndex={0}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-primary/30" />
                ) : (
                  <User size={24} />
                )}
                <span className="hidden lg:inline text-xs truncate max-w-[100px] text-muted-foreground">{displayName}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-lg shadow-2xl py-2 z-[60]">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Logado como</p>
                    <p className="text-xs text-foreground truncate font-semibold">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="w-full text-left px-4 py-3 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3 text-sm">
                    <Settings size={16} /> Configurações
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3 text-sm">
                    <LogOut size={16} /> Sair do Cinecasa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE BOTTOM BAR (<768px) ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--background))]/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileMainItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === "/search" && location.pathname === "/search");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px] ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px] ${
              moreMenuOpen ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Menu size={22} />
            <span className="text-[10px] font-semibold">Mais</span>
          </button>
        </div>

        {/* More menu popup */}
        {moreMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} />
            <div className="absolute bottom-full left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-2xl z-50 p-4">
              <div className="grid grid-cols-4 gap-4 mb-4">
                {mobileMoreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreMenuOpen(false)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                        isActive ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={() => { handleLogout(); setMoreMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-destructive/10 text-destructive rounded-xl text-sm font-bold"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </>
        )}
      </nav>

      {/* Mobile top bar - just logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-[hsl(var(--background))] to-transparent pointer-events-none">
        <div className="flex items-center justify-between px-4 h-14 pointer-events-auto">
          <Link to="/" className="flex flex-col items-start leading-none">
            <span className="text-xl font-black tracking-tighter text-primary">CINECASA</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
