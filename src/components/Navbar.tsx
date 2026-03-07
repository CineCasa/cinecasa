import { useState, useEffect } from "react";
import { Search, Bell, User, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Início", path: "/" },
  { label: "Cinema", path: "/cinema" },
  { label: "Séries", path: "/series" },
  { label: "Tv ao Vivo", path: "/tv-live" },
  { label: "Filmes Kids", path: "/kids-movies" },
  { label: "Séries Kids", path: "/kids-series" },
  { label: "Meus Favoritos", path: "/favorites" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-md shadow-2xl" : "bg-gradient-to-b from-black/90 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 h-16">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black tracking-tight text-primary">
            STREAM<span className="text-foreground">+</span>
          </h1>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="relative py-2">
                  <Link 
                    to={item.path}
                    className={`text-lg font-bold transition-all hover:scale-105 ${
                      isActive ? "text-primary border-b-2 border-primary pb-1" : "text-white/80 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className={`flex items-center transition-all duration-300 ${searchOpen ? "bg-secondary rounded-md" : ""}`}>
            {searchOpen && (
              <input
                autoFocus
                placeholder="Títulos, pessoas, gêneros"
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground px-3 py-1.5 w-40 md:w-64 outline-none"
                onBlur={() => setSearchOpen(false)}
              />
            )}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search size={20} />
            </button>
          </div>

          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            <Bell size={20} />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <User size={20} />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="p-2 text-muted-foreground hover:text-foreground transition-colors lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-lg border-t border-border">
          <ul className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="w-full text-left text-lg font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md px-3 py-3 transition-colors block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
