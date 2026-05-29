import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, HelpCircle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

/**
 * Confirmation Dialog component
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default', // default, danger, warning
  loading = false
}) => {
  if (!isOpen) return null;

  const variantConfig = {
    default: {
      icon: HelpCircle,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      confirmVariant: 'default'
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-destructive',
      iconBg: 'bg-destructive/10',
      confirmVariant: 'destructive'
    },
    warning: {
      icon: Info,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmVariant: 'default'
    }
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-[101] bg-background rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${config.iconBg}`}>
            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-1">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={config.confirmVariant}
            onClick={onConfirm} 
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * Delete confirmation dialog
 */
const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'this item',
  loading
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete Confirmation"
    message={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
    loading={loading}
  />
);

/**
 * Hook for confirm dialog state management
 */
const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      setConfig(options);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resolvePromise?.(false);
  };

  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleClose,
    DialogComponent: (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        {...config}
      />
    )
  };
};

export { ConfirmDialog, DeleteConfirmDialog, useConfirmDialog };
export default ConfirmDialog;
