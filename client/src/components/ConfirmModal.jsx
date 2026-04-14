import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger = true }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center justify-center text-center pb-4">
                <div className={`p-4 rounded-full mb-4 ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                    <AlertTriangle size={36} />
                </div>
                <p className="text-slate-600 font-medium">{message}</p>
            </div>
            <div className="flex items-center space-x-3 mt-6">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={`flex-1 py-3 text-white font-bold rounded-2xl transition-all shadow-glow hover:shadow-glow/40 active:scale-95 ${isDanger ? 'bg-rose-600 shadow-rose-500 hover:shadow-rose-500/40' : 'bg-indigo-600 shadow-indigo-500 hover:shadow-indigo-500/40'}`}
                >
                    Confirm
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
