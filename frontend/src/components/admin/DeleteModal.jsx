import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = inputText.trim().toUpperCase() === 'HAPUS SEKARANG';

  return (
    <div className="fixed inset-0 z-40" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-md border-t-4 border-red-600">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-bold leading-6 text-gray-900">Hapus Data Permanen?</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">Data yang dihapus tidak dapat dikembalikan.</p>
                    <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Ketik "HAPUS SEKARANG":</label>
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none uppercase font-bold text-red-600" 
                      placeholder="HAPUS SEKARANG" 
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
              <button 
                type="button" 
                disabled={!isConfirmed}
                onClick={onConfirm}
                className="inline-flex w-full justify-center items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Hapus Data
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
