import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal';
import { AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm'
    title: '',
    message: '',
    resolve: null,
  });

  const showAlert = useCallback((title, message) => {
    // If only one argument is provided, treat it as message
    if (!message) {
      message = title;
      title = 'Thông báo';
    }
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        resolve,
      });
    });
  }, []);

  const showConfirm = useCallback((title, message) => {
    if (!message) {
      message = title;
      title = 'Xác nhận';
    }
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve,
      });
    });
  }, []);

  const handleClose = (result) => {
    if (modalState.resolve) {
      modalState.resolve(result);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => modalState.type === 'alert' && handleClose(true)} 
          />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-[28px] shadow-2xl w-full max-w-[340px] overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
            
            {/* Header Icon (optional top visual) */}
            <div className="pt-8 pb-2 flex justify-center">
                <div className={`p-3.5 rounded-full ${modalState.type === 'alert' ? (modalState.title.toLowerCase().includes('thành công') || modalState.title.toLowerCase().includes('chúc mừng') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600') : 'bg-amber-100 text-amber-600'}`}>
                    {modalState.type === 'alert' ? (
                        modalState.title.toLowerCase().includes('thành công') || modalState.title.toLowerCase().includes('chúc mừng') 
                        ? <CheckCircle size={32} /> 
                        : <AlertCircle size={32} />
                    ) : <HelpCircle size={32} />}
                </div>
            </div>

            {/* Content text */}
            <div className="px-6 pb-6 text-center">
              <h3 className="text-[19px] font-bold text-gray-900 mb-2 leading-tight tracking-tight">{modalState.title}</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed font-medium px-2">{modalState.message}</p>
            </div>

            {/* Action Buttons */}
            <div className={`flex border-t border-gray-200/80 ${modalState.type === 'confirm' ? 'flex-row' : 'flex-col'}`}>
              {modalState.type === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 py-4 font-semibold text-gray-500 hover:bg-gray-50/50 active:bg-gray-100 transition-colors border-r border-gray-200/80 text-[17px]"
                >
                  Hủy
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 py-4 font-bold active:bg-gray-50 transition-colors text-[17px] ${modalState.type === 'confirm' ? 'text-blue-600' : 'text-blue-600 hover:bg-blue-50/30'}`}
              >
                {modalState.type === 'alert' ? 'Đóng' : 'Xác nhận'}
              </button>
            </div>

          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
