import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { Toolbar } from './components/Toolbar';
import { DocumentTable } from './components/DocumentTable';
import { DocumentModal } from './components/DocumentModal';
import { BulkImportModal } from './components/BulkImportModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useDocuments } from './hooks/useDocuments';
import { Check, AlertTriangle, Info, X } from 'lucide-react';


// Toast portal renderer component
const ToastPortal: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check size={18} className="toast-icon-success" />;
      case 'error':
        return <AlertTriangle size={18} className="toast-icon-error" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon-warning" />;
      case 'info':
      default:
        return <Info size={18} className="toast-icon-info" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-message-item toast-type-${toast.type}`}>
          {getToastIcon(toast.type)}
          <span className="toast-text">{toast.message}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => dismissToast(toast.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Main Dashboard Content
const DashboardContent: React.FC = () => {
  const {
    search,
    category,
    status,
    currentPage,
    pageSize,
    documents,
    totalRecords,
    loading,
    stats,
    isAddModalOpen,
    isImportModalOpen,
    documentToDelete,
    isDeleting,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    handlePageChange,
    handlePageSizeChange,
    handleSaveDocument,
    handleInlineSave,
    handleDeleteConfirm,
    setIsAddModalOpen,
    setIsImportModalOpen,
    setDocumentToDelete,
    refreshList,
    t,
  } = useDocuments();

  return (
    <div className="app-container">
      {/* Sidebar navigation & controls */}
      <Sidebar />

      {/* Main workspace section */}
      <main className="main-content-layout">
        {/* Dynamic header navigation */}
        <Header />

        {/* Live metric summary cards */}
        <StatsBanner
          total={stats.total}
          pending={stats.pending}
          approved={stats.approved}
          categoriesCount={stats.categoriesCount}
        />

        {/* Filters and search triggers */}
        <Toolbar
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
          onAddClick={() => setIsAddModalOpen(true)}
          onImportClick={() => setIsImportModalOpen(true)}
        />

        {/* Main interactive table view */}
        <DocumentTable
          documents={documents}
          loading={loading}
          totalRecords={totalRecords}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEditSave={handleInlineSave}
          onDeleteClick={(doc) => setDocumentToDelete(doc)}
        />
      </main>

      {/* Modals & Dialog Portals */}
      <DocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveDocument}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={refreshList}
      />

      <ConfirmDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMsg')}
        loading={isDeleting}
      />

      {/* Overlay Toast system alerts */}
      <ToastPortal />
    </div>
  );
};

// Root App Component wrapped in Provider
function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

export default App;
