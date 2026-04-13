import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal';
import { AlertCircle, HelpCircle } from 'lucide-react';

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
      <Modal open={modalState.isOpen} title={modalState.title} onClose={modalState.type === 'alert' ? () => handleClose(true) : () => handleClose(false)}>
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-full flex-shrink-0 ${modalState.type === 'alert' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
            {modalState.type === 'alert' ? <AlertCircle size={24} /> : <HelpCircle size={24} />}
          </div>
          <div className="mt-1 flex-1">
            <p className="text-gray-700 leading-relaxed text-sm">{modalState.message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          {modalState.type === 'confirm' && (
            <button
              onClick={() => handleClose(false)}
              className="px-5 py-2.5 font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              Hủy
            </button>
          )}
          <button
            onClick={() => handleClose(true)}
            className="px-5 py-2.5 font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            {modalState.type === 'alert' ? 'Đóng' : 'Xác nhận'}
          </button>
        </div>
      </Modal>
    </ModalContext.Provider>
  );
};
