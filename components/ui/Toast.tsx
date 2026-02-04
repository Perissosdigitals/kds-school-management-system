import React from 'react';
import { useToast, ToastType } from '../../context/ToastContext';

const getToastStyles = (type: ToastType) => {
    switch (type) {
        case 'success':
            return {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-800',
                icon: 'bx-check-circle',
                iconColor: 'text-emerald-500',
                progress: 'bg-emerald-500'
            };
        case 'error':
            return {
                bg: 'bg-rose-50',
                border: 'border-rose-200',
                text: 'text-rose-800',
                icon: 'bx-error-circle',
                iconColor: 'text-rose-500',
                progress: 'bg-rose-500'
            };
        case 'warning':
            return {
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-800',
                icon: 'bx-error',
                iconColor: 'text-amber-500',
                progress: 'bg-amber-500'
            };
        case 'info':
        default:
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                icon: 'bx-info-circle',
                iconColor: 'text-blue-500',
                progress: 'bg-blue-500'
            };
    }
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full">
            {toasts.map((toast) => {
                const styles = getToastStyles(toast.type);
                return (
                    <div
                        key={toast.id}
                        className={`${styles.bg} ${styles.border} border rounded-xl shadow-2xl p-4 flex gap-3 items-start animate-slide-in-right relative overflow-hidden group hover:scale-[1.02] transition-transform`}
                        role="alert"
                    >
                        <div className={`${styles.iconColor} bg-white rounded-lg p-1.5 shadow-sm`}>
                            <i className={`bx ${styles.icon} text-xl flex`}></i>
                        </div>
                        <div className="flex-1 pt-0.5">
                            <p className={`text-sm font-bold ${styles.text}`}>{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                            <i className="bx bx-x text-xl"></i>
                        </button>

                        {/* Auto-dismiss progress bar */}
                        {toast.duration && toast.duration > 0 && (
                            <div
                                className={`absolute bottom-0 left-0 h-1 ${styles.progress} transition-all duration-linear`}
                                style={{
                                    animation: `toast-progress ${toast.duration}ms linear forwards`
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
