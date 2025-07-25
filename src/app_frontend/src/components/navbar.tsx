import { Button } from "@/components/ui/button";
import {
  Menu,
  Plus,
  Moon,
  Sun,
  Wallet,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-mint rounded-xl flex items-center justify-center">
                <span className="text-text-inverse font-bold text-lg">M</span>
              </div>
              <h1 className="heading-medium text-text-primary">MegFi</h1>
            </div>

            {/* Main navigation - desktop only */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="body-regular text-text-secondary hover:text-text-primary transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/asset")}
                className="body-regular text-text-secondary hover:text-text-primary transition-colors"
              >
                Assets
              </button>
              <button
                onClick={() => navigate("/account")}
                className="body-regular text-text-secondary hover:text-text-primary transition-colors"
              >
                Account
              </button>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Balance display */}
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.05] rounded-xl px-4 py-2">
              <Wallet className="w-4 h-4 text-text-muted" />
              <span className="body-small text-text-secondary">Balance:</span>
              <span className="body-regular font-semibold text-text-primary">
                $30.00
              </span>
            </div>

            {/* Quick add button */}
            <button className="btn-icon group">
              <Plus className="w-5 h-5 text-text-primary group-hover:scale-110 transition-transform" />
            </button>

            {/* Theme toggle */}
            <ModeToggle />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="btn-icon">
                  <User className="w-5 h-5 text-text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-bg-secondary border-white/[0.08] mt-2">
                <div className="px-3 py-2">
                  <p className="body-small text-text-muted">Signed in as</p>
                  <p className="body-regular text-text-primary font-medium truncate">
                    user@example.com
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-white/[0.08]" />

                <DropdownMenuItem
                  onSelect={() => navigate("/account")}
                  className="text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span>Account Overview</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="text-text-secondary hover:text-text-primary hover:bg-white/[0.05]">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="text-text-secondary hover:text-text-primary hover:bg-white/[0.05]">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span>Help & Support</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/[0.08]" />

                {isAuthenticated && (
                  <DropdownMenuItem
                    onSelect={logout}
                    className="text-semantic-negative hover:bg-semantic-negative/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="btn-icon md:hidden">
                  <Menu className="w-5 h-5 text-text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-bg-secondary border-white/[0.08] mt-2 md:hidden">
                <DropdownMenuItem
                  onSelect={() => navigate("/")}
                  className="text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => navigate("/asset")}
                  className="text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                >
                  Assets
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => navigate("/account-overview")}
                  className="text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                >
                  Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const getSystemTheme = () => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light"; // Default to light if window is not available
  };

  const currentTheme = theme === "system" ? getSystemTheme() : theme;

  return (
    <button onClick={toggleTheme} className="btn-icon group">
      {currentTheme === "light" ? (
        <Sun className="w-5 h-5 text-text-primary group-hover:rotate-180 transition-all duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-text-primary group-hover:rotate-12 transition-all duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
