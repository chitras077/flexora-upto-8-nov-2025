import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { name: "Image Tools", path: "/image-tools" },
  { name: "Video Tools", path: "/video-tools" },
  { name: "Document Editor", path: "/document-editor" },
  { name: "Converters", path: "/converters" },
  { name: "AI Writing", path: "/ai-writing" },
  { name: "Utilities", path: "/utilities" },
  { name: "File Converter", path: "/file-converter" },
];

export const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const handleSignIn = () => {
    toast({ title: "Sign In", description: "Sign in functionality coming soon!" });
  };

  const handleGetPremium = () => {
    toast({ title: "Get Premium", description: "Premium subscription coming soon!" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-smooth hover:opacity-80">
            <div className="gradient-hero h-8 w-8 rounded-lg" />
            <span className="text-xl font-bold">Flexora</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
                  location === category.path
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={handleSignIn} data-testid="button-sign-in">
              Sign In
            </Button>
            <Button size="sm" className="hidden md:inline-flex" onClick={handleGetPremium} data-testid="button-get-premium">
              Get Premium
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
                  location === category.path
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {category.name}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleSignIn} data-testid="button-sign-in-mobile">
                Sign In
              </Button>
              <Button size="sm" className="flex-1" onClick={handleGetPremium} data-testid="button-get-premium-mobile">
                Get Premium
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
