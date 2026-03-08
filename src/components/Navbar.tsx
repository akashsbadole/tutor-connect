import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, GraduationCap, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "./AuthProvider";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Find Tutors" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-bold text-foreground">TutorHub</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/dashboard"
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === "/dashboard"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/search">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth"><Button variant="outline" size="sm">Log In</Button></Link>
              <Link to="/auth"><Button size="sm">Sign Up</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Dashboard
              </Link>
            )}
            <div className="mt-3 flex gap-2">
              {user ? (
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleSignOut}>
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </Button>
              ) : (
                <>
                  <Link to="/auth" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/auth" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
