// src/hooks/useConfirm.tsx
import { useState } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    resolve: null
  });

  const confirmAction = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        resolve
      });
    });
  };

  const handleConfirm = () => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState({
      isOpen: false,
      title: '',
      message: '',
      resolve: null
    });
  };

  const handleCancel = () => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState({
      isOpen: false,
      title: '',
      message: '',
      resolve: null
    });
  };

  const ConfirmDialog = () => (
    confirmState.isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmState.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-error text-white rounded-md hover:bg-error-dark"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return {
    confirmAction,
    ConfirmDialog
  };
};