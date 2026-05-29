import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Loader2, GraduationCap } from 'lucide-react';

const Layout = () => {
  const { loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-mesh-bg" />
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-md animate-glow-pulse">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise-overlay">
      {/* Gradient mesh background */}
      <div className="gradient-mesh-bg" />

      {/* Main layout */}
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <Sidebar 
          isMobileOpen={mobileMenuOpen} 
          onMobileClose={() => setMobileMenuOpen(false)} 
        />

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
          <footer className="border-t border-border/50 py-4 sm:py-5 mt-auto">
            <div className="container mx-auto px-4 text-center text-xs text-muted-foreground/60">
              <p>© {new Date().getFullYear()} Placement Cell Management System. Built with ❤️</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;

