import { CheckCircle, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let icon = <CheckCircle className="h-4 w-4 text-green-500" />;
        let bgClass = 'bg-white border-green-200 dark:bg-gray-800 dark:border-green-900/50';
        
        switch (toast.type) {
          case 'danger':
            icon = <AlertOctagon className="h-4 w-4 text-red-500" />;
            bgClass = 'bg-white border-red-200 dark:bg-gray-800 dark:border-red-900/50';
            break;
          case 'warning':
            icon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
            bgClass = 'bg-white border-amber-200 dark:bg-gray-800 dark:border-amber-900/50';
            break;
          case 'info':
            icon = <Info className="h-4 w-4 text-blue-500" />;
            bgClass = 'bg-white border-blue-200 dark:bg-gray-800 dark:border-blue-900/50';
            break;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-xl border shadow-lg animate-slide-up transition-all ${bgClass}`}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 shrink-0">{icon}</div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
