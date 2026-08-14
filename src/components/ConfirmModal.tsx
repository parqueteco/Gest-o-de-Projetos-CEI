import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg max-w-sm w-full shadow-2xl relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4 text-rose-500">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-lg font-black">{title}</h2>
        </div>
        <p className="text-slate-300 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            CANCELAR
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
          >
            SIM, EXCLUIR
          </button>
        </div>
      </div>
    </div>
  );
}
