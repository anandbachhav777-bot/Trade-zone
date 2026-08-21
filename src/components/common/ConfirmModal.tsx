import { AlertTriangle, X } from 'lucide-react';
import React, { useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  requireReason?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  requireReason = false,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('A reason is mandatory for audit compliance.');
      return;
    }
    setError('');
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="confirm-modal-box"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isDestructive
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>

          {requireReason && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Audit Reason / Remarks *
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter justification for this modification..."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
