import React from 'react';

const BantuanModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start justify-center">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4 flex items-center justify-center sm:justify-start" id="modal-title">
                  <i className="fas fa-user me-2 mr-2"></i> Informasi Pendaftaran
                </h3>
                <div className="mt-2">
                  <p className="mb-4 text-center text-gray-600">Silakan hubungi kami via WhatsApp (klik untuk chat):</p>
                  
                  <div className="flex flex-col gap-3">
                    <a 
                      href="https://wa.me/6285772224344" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-kg-green text-white font-bold py-3 rounded flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      <i className="fab fa-whatsapp text-2xl mr-2"></i> 0857-7222-4344
                    </a>
                    
                    <a 
                      href="https://wa.me/6281510152797" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-kg-green text-white font-bold py-3 rounded flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      <i className="fab fa-whatsapp text-2xl mr-2"></i> 0815-1015-2797
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" 
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BantuanModal;
