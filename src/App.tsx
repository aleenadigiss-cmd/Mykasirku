/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PosView } from './components/PosView';
import { ProductsView } from './components/ProductsView';
import { CategoriesView } from './components/CategoriesView';
import { StockView } from './components/StockView';
import { HistoryReportView } from './components/HistoryReportView';
import { SettingsView } from './components/SettingsView';
import { CheckoutSuccessModal } from './components/CheckoutSuccessModal';
import { OpenRegisterModal } from './components/OpenRegisterModal';
import { AuthView } from './components/AuthView';
import { MemberLandingView } from './components/MemberLandingView';
import { LandingPage } from './components/LandingPage';
import { Toast } from './components/Toast';

const MainLayout: React.FC = () => {
  const { activeTab } = usePos();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fbf8ff] text-[#30323e] font-sans antialiased">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenRegisterModal={() => setOpenRegisterModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top App Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Scrollable Page Body */}
        <main className={`flex-1 min-w-0 ${activeTab === 'kasir' ? 'overflow-y-auto p-0' : 'overflow-y-auto p-4 md:p-8'}`}>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'kasir' && <PosView />}
          {activeTab === 'produk' && <ProductsView />}
          {activeTab === 'kategori' && <CategoriesView />}
          {activeTab === 'stok' && <StockView />}
          {activeTab === 'riwayat' && <HistoryReportView initialTab="history" />}
          {activeTab === 'laporan' && <HistoryReportView initialTab="reports" />}
          {activeTab === 'pengaturan' && <SettingsView />}
        </main>
      </div>

      {/* Modals */}
      <CheckoutSuccessModal />
      <OpenRegisterModal
        isOpen={openRegisterModal}
        onClose={() => setOpenRegisterModal(false)}
      />
    </div>
  );
};

const RootApp: React.FC = () => {
  const { isAuthenticated, activeTab } = usePos();

  // 1. Landing page at the beginning of the application (first open)
  if (activeTab === 'landing') {
    return (
      <div className="w-screen h-screen overflow-y-auto bg-[#fbf8ff]">
        <LandingPage />
        <Toast />
      </div>
    );
  }

  // 2. Member VIP Loyalty Portal
  if (activeTab === 'member') {
    return (
      <div className="w-screen h-screen overflow-y-auto bg-[#fbf8ff]">
        <MemberLandingView />
        <Toast />
      </div>
    );
  }

  // 3. For protected POS views when not authenticated
  if (!isAuthenticated && activeTab !== 'kasir') {
    return (
      <>
        <AuthView />
        <Toast />
      </>
    );
  }

  return (
    <>
      <MainLayout />
      <Toast />
    </>
  );
};

export default function App() {
  return (
    <PosProvider>
      <RootApp />
    </PosProvider>
  );
}
