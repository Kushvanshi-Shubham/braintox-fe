import { useState, lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useContent } from '../hooks/useContent';
import { Navbar } from '../components/NavBar';
import { Sidebar } from '../components/ui/Sidebar';
import { MobileNavigation } from '../components/ui/MobileNavigation';
import { Spinner } from '../components/ui/Spinner';
import { EmailVerificationBanner } from '../components/EmailVerificationBanner';
import { OnboardingTour } from '../components/ui/OnboardingTour';
import { cn } from '../utlis/cn';

// Lazy load heavy modal components for better initial load
const CreateContentModal = lazy(() => 
  import('../components/ui/CreateContent').then(module => ({ 
    default: module.CreateContentModal 
  }))
);

// Pages that should show sidebar
const SIDEBAR_PAGES = new Set(['/feed', '/dashboard', '/explore']);

export const MainLayout = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { refresh } = useContent();
  const location = useLocation();

  const showSidebar = SIDEBAR_PAGES.has(location.pathname);
  
  // Only apply margin on desktop
  let marginLeft = '';
  if (showSidebar) {
    marginLeft = collapsed ? 'md:ml-20' : 'md:ml-64';
  }

  return (
    <div className={cn(
      "flex min-h-screen",
      "bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30",
      "dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20"
    )}>
      {/* Desktop Sidebar - Hidden on mobile */}
      {showSidebar && (
        <div className="hidden md:block">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
      )}
      
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300 ease-out",
        marginLeft,
        "pb-20 md:pb-0" // Add padding for mobile bottom nav
      )}>
        <Navbar onAddContent={() => setModalOpen(true)} />
        <EmailVerificationBanner />
        <main className="flex-1 relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-500/5 pointer-events-none" />
          <div className="relative">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation onAddContent={() => setModalOpen(true)} />
      
      {modalOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl">
              <Spinner size="lg" className="text-purple-600" />
            </div>
          </div>
        }>
          <CreateContentModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            refreshContent={refresh}
          />
        </Suspense>
      )}

      {/* Global Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
};