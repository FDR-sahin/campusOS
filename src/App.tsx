import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { TodayModule } from './components/modules/TodayModule';
import { NoticesModule } from './components/modules/NoticesModule';
import { ExamsModule } from './components/modules/ExamsModule';
import { EventsModule } from './components/modules/EventsModule';
import { ResourcesModule } from './components/modules/ResourcesModule';
import { TransportModule } from './components/modules/TransportModule';
import { HelpdeskModule } from './components/modules/HelpdeskModule';
import { LostFoundModule } from './components/modules/LostFoundModule';
import { ProfileModule } from './components/modules/ProfileModule';
import { AdminPortal } from './components/admin/AdminPortal';
import { AuthModal } from './components/auth/AuthModal';
import { SearchModal } from './components/common/SearchModal';
import { Notice } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [isAdminView, setIsAdminView] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedNoticeForAI, setSelectedNoticeForAI] = useState<Notice | null>(null);

  const handleSelectNoticeForAI = (notice: Notice) => {
    setSelectedNoticeForAI(notice);
    setActiveTab('notices');
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Background Decorative subtle grid and blur glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#253358_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-600/15 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setIsAdminView(false);
            setActiveTab(tab);
          }}
          isAdminView={isAdminView}
          setIsAdminView={setIsAdminView}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
          {isAdminView ? (
            <AdminPortal />
          ) : (
            <>
              {activeTab === 'today' && (
                <TodayModule
                  onNavigate={setActiveTab}
                  onSelectNoticeForAI={handleSelectNoticeForAI}
                />
              )}
              {activeTab === 'notices' && (
                <NoticesModule
                  initialNoticeForAI={selectedNoticeForAI}
                  onClearInitialNoticeForAI={() => setSelectedNoticeForAI(null)}
                />
              )}
              {activeTab === 'exams' && <ExamsModule />}
              {activeTab === 'events' && <EventsModule />}
              {activeTab === 'resources' && <ResourcesModule />}
              {activeTab === 'transport' && <TransportModule />}
              {activeTab === 'helpdesk' && <HelpdeskModule />}
              {activeTab === 'lostfound' && <LostFoundModule />}
              {activeTab === 'profile' && <ProfileModule />}
            </>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Global Modals */}
      <AuthModal />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setIsAdminView(false);
          setActiveTab(tab);
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
